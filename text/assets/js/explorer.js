/* ============================================================
   EXPLORER.JS
   The catalogue on the home page

   Two sections, each one card.

     Available now   its heading, its search and filters, and the
                     list and the open entry, all inside a single
                     card divided by rules. The search sits in
                     this section, so what it counts is this
                     section: the entries you can actually open.

     Coming soon     its heading and a grid of names, in a card of
                     its own, with its own count. No pager and no
                     previews, because there is nothing yet to
                     preview.

   Inside Available now the same selection is shown two ways.

     wide    a list down the left, the open entry and its preview
             down the right. The list scrolls inside its own
             region so the page never grows with the shelf.

     narrow  the same selection driven by a pager at the top: the
             entry's name with "3 / 6" under it and a step either
             side of it.

   Both are in the DOM at once and CSS decides which is on show.
   That is deliberate. Re-rendering on a width change means
   trusting matchMedia or resize to fire, and in more than one
   embedded context neither of them does; a layout that is simply
   always present cannot get stuck in the wrong one.

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
  var soonCountEl = root.querySelector("#soonCount");
  var soonBand = root.querySelector("#comingSoonBand");
  if (!mountEl) return;

  /* ---------- state ---------- */

  var kind = "all";        // all | page | app
  var category = "All";
  var term = "";
  var current = null;      // id of the selected available entry
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
  function addressOf(app) { return "https://" + domainOf(app); }
  function isLive(app) { return app.status === "live"; }
  function byId(id) {
    for (var i = 0; i < apps.length; i++) if (apps[i].id === id) return apps[i];
    return null;
  }

  /* A page and an app are different promises. The label says which,
     and the colour of the chip says it again without being read. */
  function kindLabel(app) { return app.kind === "app" ? "App" : "Page"; }
  function kindClass(app) { return app.kind === "app" ? "is-app" : "is-page"; }

  var MONTHS = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];

  /* Parsed by hand rather than with new Date(string). A bare
     YYYY-MM-DD is read as UTC and then printed in local time, so
     west of Greenwich every date comes out a day early. */
  function readDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }

  function longDate(iso) {
    var d = readDate(iso);
    return d ? d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear() : "";
  }

  var NEW_FOR = (window.NEW_FOR_DAYS || 31) * 24 * 60 * 60 * 1000;

  function isNew(app) {
    var d = readDate(app.added);
    return !!d && (Date.now() - d.getTime()) < NEW_FOR;
  }
  function matches(app) {
    if (kind !== "all" && app.kind !== kind) return false;
    if (category !== "All" && app.category !== category) return false;
    var needle = term.trim().toLowerCase();
    if (!needle) return true;
    return (app.name + " " + app.summary + " " + app.category + " " + kindLabel(app))
      .toLowerCase().indexOf(needle) !== -1;
  }

  var live = apps.filter(isLive);
  var soon = apps.filter(function (a) { return !isLive(a); });

  function liveShown() { return live.filter(matches); }
  function soonShown() { return soon.filter(matches); }

  /* ---------- the marks ----------

     Three shapes drawn as SVG rather than set as characters, so
     each takes its button's colour and sits on its baseline. No
     icon font and no sprite sheet. */

  var NS = "http://www.w3.org/2000/svg";

  function mark(cls, paths) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 12 12");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    if (cls) svg.setAttribute("class", cls);
    paths.forEach(function (d) {
      var path = document.createElementNS(NS, "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
    });
    return svg;
  }

  // A ring and a handle: this box is for searching.
  function searchMark() {
    return mark("search-ico", ["M5.25 1.75 A3.5 3.5 0 1 1 5.24 8.75 A3.5 3.5 0 1 1 5.25 1.75", "M7.9 7.9 L10.5 10.5"]);
  }

  // A closed padlock: this address is served over https.
  function lockMark() {
    return mark("pv-lock", [
      "M4 5.6 V3.9 A2 2 0 0 1 8 3.9 V5.6",
      "M2.9 5.6 H9.1 V10.4 H2.9 Z"
    ]);
  }

  // A box with an arrow leaving it: this link goes off the page.
  function externalMark() {
    return mark(null, [
      "M5 7 L10.5 1.5",
      "M7 1.5 H10.5 V5",
      "M9.5 7.5 V10.5 H1.5 V2.5 H4.5"
    ]);
  }

  // Four corners pushed out, and the same four pulled back in.
  function expandMark() {
    return mark("pv-ico pv-ico--out", [
      "M1.5 4.5 V1.5 H4.5", "M7.5 1.5 H10.5 V4.5",
      "M10.5 7.5 V10.5 H7.5", "M4.5 10.5 H1.5 V7.5"
    ]);
  }

  function collapseMark() {
    return mark("pv-ico pv-ico--in", [
      "M4.5 1.5 V4.5 H1.5", "M7.5 1.5 V4.5 H10.5",
      "M10.5 7.5 H7.5 V10.5", "M1.5 7.5 H4.5 V10.5"
    ]);
  }

  /* ============================================================
     The furniture, built once

     Everything below exists for the life of the page. Filtering
     redraws the list and the pager; choosing an entry redraws the
     detail. Neither rebuilds the frame.
  ============================================================ */

  /* ---------- search and filters ----------

     A strip across the Available now card rather than a card of
     its own, because it belongs to the list under it and to
     nothing else on the page. */

  var tools = el("div", "cat-tools");

  var searchLabel = el("label", "search");
  searchLabel.appendChild(el("span", "sr-only", "Search what is available"));
  searchLabel.appendChild(searchMark());
  var search = el("input");
  search.type = "search";
  search.id = "appSearch";
  search.placeholder = "Search";
  search.autocomplete = "off";
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

  mountEl.appendChild(tools);

  /* ---------- the two columns ---------- */

  var body = el("div", "cat-body");

  // left, wide screens only
  var listPanel = el("div", "cat-list-panel");
  var listSlot = el("div", "cat-list-slot");
  var list = el("ul", "cat-list");
  list.setAttribute("aria-label", "Everything available now");
  listSlot.appendChild(list);
  listPanel.appendChild(listSlot);
  body.appendChild(listPanel);

  // the pager, narrow screens only
  var pager = el("div", "cat-pager");
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

  /* right: one block. The address bar, then what the thing is,
     then the thing itself. The first two are the frame and stay
     put; only the app inside scrolls.

     The preview is also the one thing on this page that does not
     move, fade or slide. It is a working app behind that glass and
     any animation of the frame reads as the app misbehaving. */
  var mainCol = el("div", "cat-main");
  var preview = el("div", "cat-preview");

  /* The browser bar: the address, and the control that opens the
     square out to the whole window. */
  var chrome = el("div", "pv-chrome");

  var fullBtn = el("button", "pv-full");
  fullBtn.type = "button";
  fullBtn.setAttribute("aria-pressed", "false");
  fullBtn.appendChild(expandMark());
  fullBtn.appendChild(collapseMark());
  setFullLabel(false);

  var addr = el("span", "pv-addr");
  addr.appendChild(lockMark());
  var url = el("span", "pv-url");
  addr.appendChild(url);

  chrome.appendChild(addr);
  chrome.appendChild(fullBtn);
  preview.appendChild(chrome);

  /* Under the address bar, the description, and under that the
     app. The description is set as a dialog rather than a band
     across the panel, because it belongs to the entry and not to
     the app; but it sits above the app rather than over it, so
     nothing of the app is ever hidden behind it and the app has a
     scroll of its own that nothing outside it disturbs. */
  var pvBody = el("div", "pv-body");

  var detail = el("div", "pv-detail");
  pvBody.appendChild(detail);

  var stage = el("div", "pv-stage");
  pvBody.appendChild(stage);

  preview.appendChild(pvBody);

  mainCol.appendChild(preview);
  body.appendChild(mainCol);
  mountEl.appendChild(body);

  // shown instead of the body when nothing available matches
  var empty = el("div", "cat-empty");
  empty.hidden = true;
  empty.appendChild(el("p", null, "Nothing available matches that. It may still be on the way."));
  var emptyBtn = el("button", "btn btn--ghost", "Clear the filters");
  emptyBtn.type = "button";
  empty.appendChild(emptyBtn);
  mountEl.appendChild(empty);

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

  /* The search lives in the Available now card, so its count is a
     count of that card and of nothing else. What is still being
     built is counted in its own section, under its own heading. */
  function drawCount(shown) {
    var text;

    if (shown.length === live.length) {
      var pages = live.filter(function (a) { return a.kind !== "app"; }).length;
      var full = live.length - pages;
      var parts = [live.length + " available"];
      if (pages) parts.push(pages + (pages === 1 ? " page" : " pages"));
      if (full) parts.push(full + (full === 1 ? " app" : " apps"));
      text = parts.join(" · ");
    } else {
      text = "Showing " + shown.length + " of " + live.length + " available";
    }

    if (count.textContent === text) return;
    count.textContent = text;
    count.classList.remove("is-fresh");
    void count.offsetWidth;          // restart the animation
    count.classList.add("is-fresh");
  }

  function drawList(shown) {
    list.textContent = "";

    shown.forEach(function (app, i) {
      var item = el("li", "cat-item");

      var btn = el("button", "cat-row");
      btn.type = "button";
      btn.dataset.app = app.id;
      btn.setAttribute("aria-pressed", String(app.id === current));
      btn.style.setProperty("--app", app.colour);
      // The rows arrive in sequence rather than all at once, which
      // makes a filter change read as the list rearranging itself
      // instead of the whole card blinking.
      btn.style.setProperty("--d", (i * 34) + "ms");

      var top = el("span", "row-top");
      top.appendChild(el("span", "row-name", app.name));

      /* NEW belongs on the list and nowhere else. On the open entry
         it would be telling you something about the thing you are
         already looking at; in the list it is the reason to look. */
      if (isNew(app)) top.appendChild(el("span", "row-new", "New"));

      top.appendChild(el("span", "row-kind " + kindClass(app), kindLabel(app)));
      btn.appendChild(top);
      btn.appendChild(el("span", "row-cat", app.category));

      btn.addEventListener("click", function () { select(app.id); });
      item.appendChild(btn);
      list.appendChild(item);
    });
  }

  function drawSoon(shown) {
    if (!soonEl) return;
    soonEl.textContent = "";

    shown.forEach(function (app, i) {
      var card = el("article", "soon-card");
      card.id = "soon-" + app.id;
      card.style.setProperty("--d", (i * 45) + "ms");

      var swatch = el("span", "soon-swatch");
      swatch.style.backgroundColor = app.colour;
      swatch.setAttribute("aria-hidden", "true");
      card.appendChild(swatch);

      var text = document.createElement("div");
      var meta = el("p", "soon-meta");
      meta.appendChild(el("span", "row-kind " + kindClass(app), kindLabel(app)));
      meta.appendChild(el("span", "soon-cat", app.category));
      text.appendChild(meta);
      text.appendChild(el("h3", null, app.name));
      text.appendChild(el("p", "soon-summary", app.summary));
      card.appendChild(text);

      soonEl.appendChild(card);
    });

    if (soonCountEl) {
      soonCountEl.textContent = shown.length === soon.length
        ? soon.length + " on the way"
        : "Showing " + shown.length + " of " + soon.length + " on the way";
    }

    /* A heading with nothing under it is worse than no heading, and
       an empty section still takes a full gap, so the whole section
       goes rather than only its contents. */
    if (soonBand) soonBand.hidden = !shown.length;
  }

  function drawPager(shown) {
    var at = 0;
    for (var i = 0; i < shown.length; i++) if (shown[i].id === current) at = i;

    var name = shown.length ? shown[at].name : "";
    var where = shown.length ? (at + 1) + " / " + shown.length : "";
    if (pgName.textContent !== name || pgCount.textContent !== where) {
      pgName.textContent = name;
      pgCount.textContent = where;
      pgNow.classList.remove("is-fresh");
      void pgNow.offsetWidth;          // restart the animation
      pgNow.classList.add("is-fresh");
    }

    prevBtn.disabled = shown.length < 2;
    nextBtn.disabled = shown.length < 2;
  }

  function drawDetail() {
    var app = byId(current);
    if (!app) return;

    detail.textContent = "";

    var meta = el("p", "det-meta");
    meta.appendChild(el("span", "det-kind " + kindClass(app), kindLabel(app)));
    meta.appendChild(el("span", "det-cat", app.category));
    detail.appendChild(meta);

    detail.appendChild(el("h3", "det-name", app.name));
    detail.appendChild(el("p", "det-summary", app.summary));

    var foot = el("div", "det-foot");

    var dates = el("p", "det-dates");
    if (app.added) dates.appendChild(el("span", null, "Released " + longDate(app.added)));
    if (app.updated && app.updated !== app.added) {
      dates.appendChild(el("span", null, "Updated " + longDate(app.updated)));
    }
    foot.appendChild(dates);

    if (app.url) {
      var open = el("a", "det-open");
      open.href = app.url;
      open.target = "_blank";
      open.rel = "noopener";
      open.setAttribute("aria-label", "Open " + app.name + ", opens in a new tab");
      open.appendChild(document.createTextNode("Open app"));
      open.appendChild(externalMark());
      foot.appendChild(open);
    }

    detail.appendChild(foot);
  }

  function drawPreview() {
    var app = byId(current);
    if (!app) return;

    setFull(false);

    if (typeof teardown === "function") teardown();
    teardown = null;
    stage.textContent = "";
    stage.scrollTop = 0;

    url.textContent = addressOf(app);

    var demo = app.demo && window.BeehtaDemos[app.demo];
    if (demo && typeof demo.mount === "function") {
      teardown = demo.mount(stage) || null;
    } else {
      var none = el("div", "pv-none");
      none.appendChild(el("p", null, "No preview for this one yet."));
      stage.appendChild(none);
    }
  }

  /* ---------- full screen ----------

     Done with a fixed overlay rather than the Fullscreen API. That
     API is refused without a gesture it recognises, is blocked
     outright in an embedded frame that was not given permission,
     and fails by doing nothing at all, which is the worst way for
     a control to fail. This always works and closes with Escape.
  ---------- */

  var isFull = false;

  function setFullLabel(on) {
    var text = on ? "Leave full screen" : "View the preview full screen";
    fullBtn.setAttribute("aria-label", text);
    fullBtn.dataset.tip = text;
  }

  function setFull(on) {
    if (on === isFull) return;
    isFull = on;
    preview.classList.toggle("is-full", on);
    document.documentElement.classList.toggle("has-full", on);
    fullBtn.setAttribute("aria-pressed", String(on));
    setFullLabel(on);
    // The app inside has just been given a different amount of
    // room, so it should be looked at from the top again.
    stage.scrollTop = 0;
  }

  function onFullClick() { setFull(!isFull); }
  function onEscape(e) { if (e.key === "Escape" && isFull) setFull(false); }

  fullBtn.addEventListener("click", onFullClick);
  document.addEventListener("keydown", onEscape);

  /* ---------- selecting ---------- */

  /* No history entry and no hash. Choosing an entry is looking at
     something on one page, not going somewhere, and rewriting the
     address on every click made the back button meaningless and
     left people with a link to whatever they happened to click
     last. An incoming #id still works; see fromHash below. */
  function select(id) {
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
      // Nothing to cross over from. Crossing anyway would leave the
      // dialog empty and collapsed for the length of the fade.
      drawDetail();
    } else {
      detail.classList.add("is-out");
      later(function () {
        drawDetail();
        detail.classList.remove("is-out");
      }, 130);
    }

    drawPreview();
  }

  function step(by) {
    var shown = liveShown();
    if (shown.length < 2) return;
    var at = 0;
    for (var i = 0; i < shown.length; i++) if (shown[i].id === current) at = i;
    select(shown[(at + by + shown.length) % shown.length].id);
  }

  /* ---------- a full redraw, after a filter changes ---------- */

  function drawAll() {
    var shownLive = liveShown();
    var shownSoon = soonShown();

    drawCount(shownLive);
    drawList(shownLive);
    drawSoon(shownSoon);

    var none = !shownLive.length;
    empty.hidden = !none;
    body.hidden = none;

    if (none) {
      setFull(false);
      if (typeof teardown === "function") teardown();
      teardown = null;
      stage.textContent = "";
      current = null;
      return;
    }

    var stillThere = false;
    for (var i = 0; i < shownLive.length; i++) {
      if (shownLive[i].id === current) stillThere = true;
    }
    if (!stillThere) {
      current = null;
      select(shownLive[0].id);
    } else {
      var rows = list.querySelectorAll(".cat-row");
      for (var r = 0; r < rows.length; r++) {
        rows[r].setAttribute("aria-pressed", String(rows[r].dataset.app === current));
      }
      drawPager(shownLive);
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
    if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
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
    if (target && isLive(target)) { select(wanted); return; }
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
    setFull(false);
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
    fullBtn.removeEventListener("click", onFullClick);
    document.removeEventListener("keydown", onEscape);
  };
};
