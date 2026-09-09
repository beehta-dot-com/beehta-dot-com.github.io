/* ============================================================
   EXPLORER.JS
   The catalogue on the home page  (directory layout)

   The apps are the point of this page, so they are not hidden
   behind a selection. Every app that exists gets a block of its
   own with its preview beside it, and everything still being
   built is listed separately and compactly, because there is
   nothing to preview and a row of empty squares says nothing.

   Two lists, one set of data:

     #available    status "live", with a working preview
     #comingSoon   everything else, name and one line only

   A preview registers itself on window.BeehtaDemos before this
   runs.
============================================================ */

window.BeehtaDemos = window.BeehtaDemos || {};

/* router.js owns this object but loads last, so every page
   script that registers a hook has to be able to create it. */
window.beehtaPages = window.beehtaPages || {};

window.beehtaPages.home = function (root) {
  "use strict";

  var apps = window.APPS || [];
  var toolsFrom = window.TOOLS_FROM || 7;

  var availableEl = root.querySelector("#available");
  var soonEl = root.querySelector("#comingSoon");
  var availableHead = root.querySelector("#availableHead");
  var soonHead = root.querySelector("#comingSoonHead");
  var countEl = root.querySelector("#appCount");
  var toolsEl = root.querySelector("#directoryTools");
  var searchEl = root.querySelector("#appSearch");
  var filtersEl = root.querySelector("#appFilters");
  var emptyEl = root.querySelector("#directoryEmpty");

  if (!availableEl || !soonEl) return;

  var category = "All";
  var term = "";

  // id -> teardown, for the previews already built
  var mounted = Object.create(null);

  /* ---------- helpers ---------- */

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function domainOf(app) { return app.id + ".beehta.com"; }
  function isLive(app) { return app.status === "live"; }

  function matches(app) {
    if (category !== "All" && app.category !== category) return false;
    var needle = term.trim().toLowerCase();
    if (!needle) return true;
    return (app.name + " " + app.summary + " " + app.category)
      .toLowerCase().indexOf(needle) !== -1;
  }

  /* ---------- previews, built when they come near ----------

     Deliberately not done with an IntersectionObserver. That
     callback is async and in some contexts never fires at all,
     which would leave every preview permanently blank rather
     than merely late. */

  var NEAR = 400;
  var watching = false;
  var queued = false;

  function mountInto(host, app) {
    if (mounted[app.id]) return;
    var demo = app.demo && window.BeehtaDemos[app.demo];
    if (!demo || typeof demo.mount !== "function") return;
    mounted[app.id] = demo.mount(host) || function () { host.textContent = ""; };
  }

  function unmountAll() {
    stopWatching();
    Object.keys(mounted).forEach(function (id) { mounted[id](); delete mounted[id]; });
  }

  function pendingBodies() {
    return availableEl.querySelectorAll(".pv-stage[data-demo]:not([data-demo=''])");
  }

  function mountNearby() {
    queued = false;
    var bodies = pendingBodies();
    var left = 0;

    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      var id = body.closest(".app-block").dataset.app;
      if (mounted[id]) continue;

      var box = body.getBoundingClientRect();
      if (box.top < window.innerHeight + NEAR && box.bottom > -NEAR) {
        mountInto(body, apps.filter(function (a) { return a.id === id; })[0]);
      } else {
        left++;
      }
    }
    if (!left) stopWatching();
  }

  function onScroll() {
    if (queued) return;
    queued = true;
    setTimeout(mountNearby, 100);
  }

  function startWatching() {
    mountNearby();
    if (watching || !pendingBodies().length) return;
    watching = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  function stopWatching() {
    if (!watching) return;
    watching = false;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  }

  /* ---------- an available app ---------- */

  function availableBlock(app) {
    var block = el("article", "app-block");
    block.id = "app-" + app.id;
    block.dataset.app = app.id;
    block.style.setProperty("--app", app.colour);

    var inner = el("div", "app-block-inner");

    /* --- what it is --- */
    var detail = el("div", "panel block app-detail");

    detail.appendChild(el("p", "app-cat", app.category));

    var head = el("div", "app-head");
    head.appendChild(el("h3", null, app.name));
    head.appendChild(el("span", "app-status is-live", "Available"));
    detail.appendChild(head);

    detail.appendChild(el("p", "app-summary", app.summary));

    if (app.url) {
      var open = el("a", "btn btn--primary app-open", "Open " + app.name);
      open.href = app.url;
      open.target = "_blank";
      open.rel = "noopener";
      detail.appendChild(open);
    }

    detail.appendChild(el("p", "app-domain", domainOf(app)));
    inner.appendChild(detail);

    /* --- the preview --- */
    var preview = el("div", "app-preview");

    var chrome = el("div", "pv-chrome");
    chrome.setAttribute("aria-hidden", "true");
    chrome.appendChild(el("span", "pv-addr", domainOf(app)));
    chrome.appendChild(el("span", "pv-badge", "Preview"));
    preview.appendChild(chrome);

    var stage = el("div", "pv-stage");
    stage.dataset.demo = app.demo || "";
    preview.appendChild(stage);

    if (!(app.demo && window.BeehtaDemos[app.demo])) {
      var none = el("div", "pv-none");
      none.appendChild(el("p", null, "No preview for this one yet."));
      stage.appendChild(none);
    }

    if (app.note) preview.appendChild(el("p", "pv-note", app.note));

    inner.appendChild(preview);
    block.appendChild(inner);
    return block;
  }

  /* ---------- an app that is not built yet ---------- */

  function soonCard(app) {
    var card = el("article", "panel soon-card");
    card.id = "app-" + app.id;

    var mark = el("span", "soon-swatch");
    mark.style.backgroundColor = app.colour;
    mark.setAttribute("aria-hidden", "true");
    card.appendChild(mark);

    var body = document.createElement("div");
    body.appendChild(el("p", "app-cat", app.category));
    body.appendChild(el("h3", null, app.name));
    body.appendChild(el("p", "soon-summary", app.summary));
    card.appendChild(body);

    return card;
  }

  /* ---------- draw ---------- */

  function draw() {
    unmountAll();
    availableEl.textContent = "";
    soonEl.textContent = "";

    var shown = apps.filter(matches);
    var live = shown.filter(isLive);
    var soon = shown.filter(function (a) { return !isLive(a); });

    live.forEach(function (app) { availableEl.appendChild(availableBlock(app)); });
    soon.forEach(function (app) { soonEl.appendChild(soonCard(app)); });

    // A heading with nothing under it is worse than no heading.
    if (availableHead) availableHead.hidden = !live.length;
    if (soonHead) soonHead.hidden = !soon.length;
    availableEl.hidden = !live.length;
    soonEl.hidden = !soon.length;

    if (emptyEl) emptyEl.hidden = shown.length > 0;

    drawCount(shown);
    startWatching();
  }

  /* The count says what the shelf holds, not just how many rows
     came back, so it stays useful as the catalogue grows. */
  function drawCount(shown) {
    if (!countEl) return;

    var total = apps.length;
    var live = apps.filter(isLive).length;
    var soon = total - live;

    var parts = [total + (total === 1 ? " app" : " apps")];
    if (live) parts.push(live + " available");
    if (soon) parts.push(soon + " coming soon");

    var text = parts.join(" · ");
    if (shown.length !== total) text = "Showing " + shown.length + " of " + text;
    countEl.textContent = text;
  }

  function drawFilters() {
    if (!filtersEl) return;

    var seen = ["All"];
    apps.forEach(function (app) {
      if (seen.indexOf(app.category) === -1) seen.push(app.category);
    });

    filtersEl.textContent = "";
    seen.forEach(function (name) {
      var btn = el("button", "filter", name);
      btn.type = "button";
      btn.setAttribute("aria-pressed", String(name === category));
      btn.addEventListener("click", function () {
        category = name;
        drawFilters();
        draw();
      });
      filtersEl.appendChild(btn);
    });
  }

  /* ---------- wiring ---------- */

  if (toolsEl) {
    if (apps.length >= toolsFrom) {
      toolsEl.hidden = false;
      drawFilters();
    } else {
      toolsEl.hidden = true;
    }
  }

  function onSearch(e) { term = e.target.value; draw(); }
  if (searchEl) searchEl.addEventListener("input", onSearch);

  draw();

  // An app can be linked to directly: beehta.com/#logins
  var fromHash = location.hash.slice(1);
  if (fromHash) {
    var target = root.querySelector("#app-" + (window.CSS && CSS.escape ? CSS.escape(fromHash) : fromHash));
    if (target) target.scrollIntoView();
  }

  /* The page hook contract: hand back a way to undo everything. */
  return function () {
    unmountAll();
    if (searchEl) searchEl.removeEventListener("input", onSearch);
  };
};
