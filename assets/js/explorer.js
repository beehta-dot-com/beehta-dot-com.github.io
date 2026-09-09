/* ============================================================
   EXPLORER.JS
   The catalogue on the home page

   One selection, shown two ways, built once.

     wide    a list down the left, the selected entry and its
             preview down the right. The list scrolls inside its
             own panel so the page never grows with the shelf.

     narrow  the same selection driven by a pager at the top:
             the entry's name with "3 / 6" under it and a step
             either side of it. The detail and the preview sit
             below, and the preview takes the whole width of the
             window.

   Both are in the DOM at once and CSS decides which is on show.
   That is deliberate. Re-rendering on a width change means
   trusting matchMedia or resize to fire, and in more than one
   embedded context neither of them does; a layout that is simply
   always present cannot get stuck in the wrong one.

   Search and the filters sit with the list, above it on a wide
   screen and above the pager on a narrow one, so they are in
   reach of the thing they are filtering.

   Coming soon is a separate list further down the page: cards,
   no pager, no previews. There is nothing to preview and a row of
   empty squares would only take the room the working entries have
   earned.

   A preview registers itself on window.BeehtaDemos before this
   runs.
============================================================ */

window.BeehtaDemos = window.BeehtaDemos || {};

/* router.js owns this object but loads last, so every page script
   that registers a hook has to be able to create it. */
window.beehtaPages = window.beehtaPages || {};

window.beehtaPages.home = function (root) {
  "use strict";

  var apps = window.APPS || [];

  var mountEl = root.querySelector("#catalogue");
  var soonEl = root.querySelector("#comingSoon");
  var soonHead = root.querySelector("#comingSoonHead");
  var soonBand = root.querySelector("#comingSoonBand");
  if (!mountEl) return;

  /* ---------- state ---------- */

  var kind = "all";        // all | page | app
  var category = "All";
  var term = "";
  var current = null;      // id of the selected live entry
  var teardown = null;     // teardown for the mounted preview
  var timers = [];

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  /* ---------- helpers ---------- */

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function domainOf(app) { return app.id + ".beehta.com"; }
  function isLive(app) { return app.status === "live"; }
  function byId(id) {
    for (var i = 0; i < apps.length; i++) if (apps[i].id === id) return apps[i];
    return null;
  }

  /* A page and an app are different promises, and the label is the
     only place the page makes that difference visible. */
  function kindLabel(app) { return app.kind === "app" ? "App" : "Page"; }
  function kindNote(app) {
    return app.kind === "app"
      ? "A full web app. One account covers it and everything else on the shelf."
      : "A single page. No account, nothing saved, nothing sent.";
  }

  function matches(app) {
    if (kind !== "all" && app.kind !== kind) return false;
    if (category !== "All" && app.category !== category) return false;
    var needle = term.trim().toLowerCase();
    if (!needle) return true;
    return (app.name + " " + app.summary + " " + app.category + " " + kindLabel(app))
      .toLowerCase().indexOf(needle) !== -1;
  }

  function liveShown() { return apps.filter(function (a) { return isLive(a) && matches(a); }); }
  function soonShown() { return apps.filter(function (a) { return !isLive(a) && matches(a); }); }

  /* ============================================================
     The furniture, built once

     Everything below exists for the life of the page. Filtering
     redraws the list and the pager; choosing an entry redraws the
     detail. Neither rebuilds the frame.
  ============================================================ */

  var inner = el("div", "cat-inner");

  /* ---------- search and filters ---------- */

  var tools = el("div", "panel cat-tools");

  var searchLabel = el("label", "search");
  var searchHint = el("span", "sr-only", "Search the catalogue");
  var search = el("input");
  search.type = "search";
  search.id = "appSearch";
  search.placeholder = "Search";
  search.autocomplete = "off";
  searchLabel.appendChild(searchHint);
  searchLabel.appendChild(search);
  tools.appendChild(searchLabel);

  var kindRow = el("div", "filters");
  kindRow.setAttribute("role", "group");
  kindRow.setAttribute("aria-label", "Filter by what it is");
  tools.appendChild(kindRow);

  var catWrap = el("label", "catfilter");
  catWrap.appendChild(el("span", "sr-only", "Filter by category"));
  var catSelect = el("select");
  catWrap.appendChild(catSelect);
  tools.appendChild(catWrap);

  var count = el("p", "cat-count");
  count.setAttribute("role", "status");
  tools.appendChild(count);

  inner.appendChild(tools);

  /* ---------- the two-column body ---------- */

  var body = el("div", "cat-body");

  // left, wide screens only
  var listPanel = el("div", "panel cat-list-panel");
  var listSlot = el("div", "cat-list-slot");
  var list = el("ul", "cat-list");
  list.setAttribute("aria-label", "Everything available now");
  listSlot.appendChild(list);
  listPanel.appendChild(listSlot);
  body.appendChild(listPanel);

  // the pager, narrow screens only
  var pager = el("div", "panel cat-pager");
  var prevBtn = el("button", "pg-step", "Prev");
  prevBtn.type = "button";
  var nextBtn = el("button", "pg-step", "Next");
  nextBtn.type = "button";
  var pgNow = el("div", "pg-now");
  var pgName = el("span", "pg-name");
  var pgCount = el("span", "pg-count");
  pgNow.appendChild(pgName);
  pgNow.appendChild(pgCount);
  pager.appendChild(prevBtn);
  pager.appendChild(pgNow);
  pager.appendChild(nextBtn);
  body.appendChild(pager);

  // right
  var mainCol = el("div", "cat-main");

  var detail = el("div", "panel cat-detail");
  mainCol.appendChild(detail);

  /* The preview is the one thing on this page that does not move,
     fade or slide. It is a working app behind that glass and any
     animation of the frame reads as the app itself misbehaving. */
  var preview = el("div", "cat-preview");
  var chrome = el("div", "pv-chrome");
  chrome.setAttribute("aria-hidden", "true");
  var addr = el("span", "pv-addr");
  var badge = el("span", "pv-badge", "Preview");
  chrome.appendChild(addr);
  chrome.appendChild(badge);
  var stage = el("div", "pv-stage");
  var pvNote = el("p", "pv-note");
  preview.appendChild(chrome);
  preview.appendChild(stage);
  preview.appendChild(pvNote);
  mainCol.appendChild(preview);

  body.appendChild(mainCol);
  inner.appendChild(body);

  // shown instead of the body when nothing matches
  var empty = el("div", "panel cat-empty");
  empty.hidden = true;
  var emptyText = el("p", null, "Nothing on the shelf matches that.");
  var emptyBtn = el("button", "btn btn--ghost", "Clear the filters");
  emptyBtn.type = "button";
  empty.appendChild(emptyText);
  empty.appendChild(emptyBtn);
  inner.appendChild(empty);

  mountEl.appendChild(inner);

  /* ============================================================
     Drawing
  ============================================================ */

  function drawKinds() {
    var options = [
      { id: "all", label: "Everything" },
      { id: "page", label: "Pages" },
      { id: "app", label: "Apps" }
    ];
    kindRow.textContent = "";
    options.forEach(function (opt) {
      var btn = el("button", "filter", opt.label);
      btn.type = "button";
      btn.setAttribute("aria-pressed", String(opt.id === kind));
      btn.addEventListener("click", function () {
        if (kind === opt.id) return;
        kind = opt.id;
        drawKinds();
        drawAll();
      });
      kindRow.appendChild(btn);
    });
  }

  function drawCategories() {
    var seen = ["All"];
    apps.forEach(function (app) {
      if (seen.indexOf(app.category) === -1) seen.push(app.category);
    });
    catSelect.textContent = "";
    seen.forEach(function (name) {
      var opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name === "All" ? "All categories" : name;
      catSelect.appendChild(opt);
    });
    catSelect.value = category;
  }

  /* The count describes the shelf, not just the rows that came
     back, so it stays useful as the catalogue grows. */
  function drawCount(live, soon) {
    var total = apps.length;
    var allLive = apps.filter(isLive).length;

    var text;
    if (live.length + soon.length === total) {
      text = total + " apps and pages · " + allLive + " available · " +
             (total - allLive) + " coming soon";
    } else {
      text = "Showing " + (live.length + soon.length) + " of " + total +
             " · " + live.length + " available · " + soon.length + " coming soon";
    }
    if (count.textContent === text) return;
    count.textContent = text;
    count.classList.remove("is-fresh");
    void count.offsetWidth;          // restart the animation
    count.classList.add("is-fresh");
  }

  function drawList(live) {
    list.textContent = "";

    live.forEach(function (app, i) {
      var item = el("li", "cat-item");

      var btn = el("button", "cat-row");
      btn.type = "button";
      btn.dataset.app = app.id;
      btn.setAttribute("aria-pressed", String(app.id === current));
      btn.style.setProperty("--app", app.colour);
      // The rows arrive in sequence rather than all at once, which
      // makes a filter change read as the list rearranging itself
      // instead of the whole panel blinking.
      btn.style.setProperty("--d", (i * 34) + "ms");

      var top = el("span", "row-top");
      top.appendChild(el("span", "row-name", app.name));
      top.appendChild(el("span", "row-kind", kindLabel(app)));
      btn.appendChild(top);
      btn.appendChild(el("span", "row-cat", app.category));

      btn.addEventListener("click", function () { select(app.id); });
      item.appendChild(btn);
      list.appendChild(item);
    });
  }

  function drawSoon(soon) {
    if (!soonEl) return;
    soonEl.textContent = "";

    soon.forEach(function (app, i) {
      var card = el("article", "panel soon-card");
      card.id = "soon-" + app.id;
      card.style.setProperty("--d", (i * 45) + "ms");

      var mark = el("span", "soon-swatch");
      mark.style.backgroundColor = app.colour;
      mark.setAttribute("aria-hidden", "true");
      card.appendChild(mark);

      var text = document.createElement("div");
      var meta = el("p", "soon-meta");
      meta.appendChild(el("span", "row-kind", kindLabel(app)));
      meta.appendChild(el("span", "soon-cat", app.category));
      text.appendChild(meta);
      text.appendChild(el("h3", null, app.name));
      text.appendChild(el("p", "soon-summary", app.summary));
      card.appendChild(text);

      soonEl.appendChild(card);
    });

    // A heading with nothing under it is worse than no heading,
    // and an empty band still takes a full section gap, so the
    // whole thing goes rather than just its contents.
    if (soonBand) soonBand.hidden = !soon.length;
    if (soonHead) soonHead.hidden = !soon.length;
    soonEl.hidden = !soon.length;
  }

  function drawPager(live) {
    var at = 0;
    for (var i = 0; i < live.length; i++) if (live[i].id === current) at = i;

    var name = live.length ? live[at].name : "";
    var where = live.length ? (at + 1) + " / " + live.length : "";
    if (pgName.textContent !== name || pgCount.textContent !== where) {
      pgName.textContent = name;
      pgCount.textContent = where;
      pgNow.classList.remove("is-fresh");
      void pgNow.offsetWidth;          // restart the animation
      pgNow.classList.add("is-fresh");
    }

    prevBtn.disabled = live.length < 2;
    nextBtn.disabled = live.length < 2;
    pager.hidden = !live.length;
  }

  function drawDetail() {
    var app = byId(current);
    if (!app) return;

    detail.textContent = "";

    var meta = el("p", "det-meta");
    meta.appendChild(el("span", "det-kind", kindLabel(app)));
    meta.appendChild(el("span", "det-cat", app.category));
    detail.appendChild(meta);

    var head = el("div", "det-head");
    head.appendChild(el("h3", null, app.name));
    head.appendChild(el("span", "det-status", "Available"));
    detail.appendChild(head);

    detail.appendChild(el("p", "det-summary", app.summary));
    detail.appendChild(el("p", "det-kindnote", kindNote(app)));

    var actions = el("div", "det-actions");
    if (app.url) {
      var open = el("a", "btn btn--primary", "Open " + app.name);
      open.href = app.url;
      open.target = "_blank";
      open.rel = "noopener";
      actions.appendChild(open);
    }
    actions.appendChild(el("span", "det-domain", domainOf(app)));
    detail.appendChild(actions);
  }

  function drawPreview() {
    var app = byId(current);
    if (!app) return;

    if (typeof teardown === "function") teardown();
    teardown = null;
    stage.textContent = "";
    stage.scrollTop = 0;

    addr.textContent = domainOf(app);

    var demo = app.demo && window.BeehtaDemos[app.demo];
    if (demo && typeof demo.mount === "function") {
      teardown = demo.mount(stage) || null;
    } else {
      var none = el("div", "pv-none");
      none.appendChild(el("p", null, "No preview for this one yet."));
      stage.appendChild(none);
    }

    pvNote.textContent = app.note || "";
    pvNote.hidden = !app.note;
  }

  /* ---------- selecting ---------- */

  function select(id, quiet) {
    if (id === current) return;
    current = id;

    var rows = list.querySelectorAll(".cat-row");
    for (var i = 0; i < rows.length; i++) {
      rows[i].setAttribute("aria-pressed", String(rows[i].dataset.app === id));
    }

    drawPager(liveShown());

    // The detail crosses over; the preview underneath it does not.
    // Fading a live app in and out looks like it is failing to load.
    if (!detail.firstChild) {
      // Nothing to cross over from. Crossing anyway leaves the
      // panel empty and collapsed for the length of the fade.
      drawDetail();
    } else {
      detail.classList.add("is-out");
      later(function () {
        drawDetail();
        detail.classList.remove("is-out");
      }, 130);
    }

    drawPreview();

    if (!quiet) {
      var url = location.pathname + "#" + id;
      history.replaceState({}, "", url);
    }
  }

  function step(by) {
    var live = liveShown();
    if (live.length < 2) return;
    var at = 0;
    for (var i = 0; i < live.length; i++) if (live[i].id === current) at = i;
    var next = (at + by + live.length) % live.length;
    select(live[next].id);
  }

  /* ---------- a full redraw, after a filter changes ---------- */

  function drawAll() {
    var live = liveShown();
    var soon = soonShown();

    drawCount(live, soon);
    drawList(live);
    drawSoon(soon);

    var nothing = !live.length && !soon.length;
    empty.hidden = !nothing;

    // With no live entry to show, the detail and the preview would
    // be describing something the reader has just filtered out.
    var noLive = !live.length;
    body.hidden = nothing;
    listPanel.hidden = noLive;
    mainCol.hidden = noLive;
    pager.hidden = noLive;

    if (noLive) {
      if (typeof teardown === "function") teardown();
      teardown = null;
      stage.textContent = "";
      current = null;
      return;
    }

    var stillThere = false;
    for (var i = 0; i < live.length; i++) if (live[i].id === current) stillThere = true;
    if (!stillThere) {
      current = null;
      select(live[0].id, true);
    } else {
      var rows = list.querySelectorAll(".cat-row");
      for (var r = 0; r < rows.length; r++) {
        rows[r].setAttribute("aria-pressed", String(rows[r].dataset.app === current));
      }
      drawPager(live);
    }
  }

  /* ---------- wiring ---------- */

  function onSearch(e) { term = e.target.value; drawAll(); }
  function onCategory(e) { category = e.target.value; drawAll(); }
  function onPrev() { step(-1); }
  function onNext() { step(1); }
  function onClear() {
    kind = "all";
    category = "All";
    term = "";
    search.value = "";
    catSelect.value = "All";
    drawKinds();
    drawAll();
  }

  search.addEventListener("input", onSearch);
  catSelect.addEventListener("change", onCategory);
  prevBtn.addEventListener("click", onPrev);
  nextBtn.addEventListener("click", onNext);
  emptyBtn.addEventListener("click", onClear);

  /* The pager is a pair of buttons, so the arrow keys are not
     wired to it by the browser. On a list you step through, they
     are the obvious thing to reach for. */
  function onKey(e) {
    if (e.target === search || e.target === catSelect) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "ArrowLeft") { step(-1); }
    else if (e.key === "ArrowRight") { step(1); }
    else return;
    e.preventDefault();
  }
  pager.addEventListener("keydown", onKey);
  listPanel.addEventListener("keydown", onKey);

  drawKinds();
  drawCategories();
  drawAll();

  /* An entry can be linked to directly: beehta.com/#itinerary */

  function fromHash() {
    var wanted = location.hash.slice(1);
    if (!wanted) return;
    var target = byId(wanted);
    if (target && isLive(target)) { select(wanted, true); return; }
    var section = root.querySelector("#" + (window.CSS && CSS.escape ? CSS.escape(wanted) : wanted));
    if (section) section.scrollIntoView();
  }

  /* A hash on its own does not reload the document and the router
     leaves it alone, so following such a link from this same page
     would otherwise change the address and nothing else. */
  window.addEventListener("hashchange", fromHash);

  fromHash();

  /* The page hook contract: hand back a way to undo everything. */
  return function () {
    if (typeof teardown === "function") teardown();
    teardown = null;
    timers.forEach(clearTimeout);
    search.removeEventListener("input", onSearch);
    catSelect.removeEventListener("change", onCategory);
    prevBtn.removeEventListener("click", onPrev);
    nextBtn.removeEventListener("click", onNext);
    emptyBtn.removeEventListener("click", onClear);
    pager.removeEventListener("keydown", onKey);
    listPanel.removeEventListener("keydown", onKey);
    window.removeEventListener("hashchange", fromHash);
  };
};
