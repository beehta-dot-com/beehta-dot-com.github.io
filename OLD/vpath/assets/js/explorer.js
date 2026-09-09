/* ============================================================
   EXPLORER.JS
   The catalogue on the home page  (hybrid layout)

   Two layouts from one set of data, chosen by width:

     wide    a list of apps beside a single preview panel, the
             same master-detail arrangement as the site/ version
     narrow  every app in a block of its own, stacked, with its
             preview running the full width of the screen

   They are different enough in structure that showing and hiding
   one of them would mean building both, and building both would
   mean mounting every demo twice. So only one exists at a time
   and the whole catalogue is redrawn when the window crosses the
   breakpoint. Whatever app was selected survives the switch.

   A demo registers itself on window.BeehtaDemos before this runs.
============================================================ */

window.BeehtaDemos = window.BeehtaDemos || {};

/* router.js owns this object but loads last, so every page
   script that registers a hook has to be able to create it. */
window.beehtaPages = window.beehtaPages || {};

window.beehtaPages.home = function (root) {
  "use strict";

  var apps = window.APPS || [];
  var toolsFrom = window.TOOLS_FROM || 7;

  var catalogueEl = root.querySelector("#catalogue");
  var searchEl = root.querySelector("#appSearch");
  var filtersEl = root.querySelector("#appFilters");
  var countEl = root.querySelector("#resultCount");
  var heroEl = root.querySelector("#heroMeta");

  if (!catalogueEl) return;

  // Matches the breakpoint in pages.css. Kept in one place here
  // because the layout is chosen in script, not by a media query.
  var wide = window.matchMedia("(min-width: 900px)");

  var category = "All";
  var term = "";
  var selected = apps.length ? apps[0].id : null;

  // id -> teardown, for the demos currently built
  var mounted = Object.create(null);

  // Which layout is actually on the page. Compared against the
  // media query on every resize, because a missed change event
  // would otherwise leave the wrong layout up for good.
  var renderedWide = null;

  /* ---------- helpers ---------- */

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function domainOf(app) { return app.id + ".beehta.com"; }

  function statusOf(app) {
    if (app.status === "live") return { cls: "is-live", label: "Active" };
    if (app.status === "beta") return { cls: "is-beta", label: "Beta" };
    return { cls: "is-soon", label: "Coming soon" };
  }

  function swatch(app, cls) {
    var box = el("span", cls || "app-swatch");
    box.style.backgroundColor = app.colour;
    box.setAttribute("aria-hidden", "true");
    return box;
  }

  function openLink(app, cls) {
    if (app.status === "soon" || !app.url) return null;
    var a = el("a", cls, "Open " + app.name);
    a.href = app.url;
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  }

  function visible() {
    var needle = term.trim().toLowerCase();
    return apps.filter(function (app) {
      if (category !== "All" && app.category !== category) return false;
      if (!needle) return true;
      return (app.name + " " + app.summary + " " + app.category)
        .toLowerCase().indexOf(needle) !== -1;
    });
  }

  /* ---------- demos ----------

     Deliberately not done with an IntersectionObserver. That
     callback is async and in some contexts never fires at all,
     which would leave previews permanently blank rather than
     merely late. */

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
    return catalogueEl.querySelectorAll(".hy-body[data-demo]:not([data-demo=''])");
  }

  function mountNearby() {
    queued = false;
    var bodies = pendingBodies();
    var left = 0;

    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      var id = body.closest(".hy-entry").dataset.app;
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

  /* Chrome bar for a preview: an address field and a badge, so it
     is obvious the panel below is a screen inside a screen. */
  function chrome(app) {
    var bar = el("div", "pv-chrome");
    bar.setAttribute("aria-hidden", "true");
    bar.appendChild(el("span", "pv-addr", domainOf(app) + "/demo"));
    bar.appendChild(el("span", "pv-badge", "Demo"));
    return bar;
  }

  /* ---------- the coming-soon panel, shared by both layouts ---------- */

  function comingSoon(app) {
    var box = el("div", "hy-empty");
    box.appendChild(swatch(app, "app-swatch app-swatch--lg"));
    box.appendChild(el("p", null, app.status === "live"
      ? "No preview for this one yet."
      : "Not built yet."));
    return box;
  }

  /* ================= wide: list beside one preview ================= */

  function renderWide(shown) {
    var grid = el("div", "shell explorer-grid");

    /* --- the list --- */
    var slot = el("div", "app-list-slot");
    var panel = el("div", "panel app-list-panel");
    var list = el("div", "app-list");
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-label", "Apps");

    shown.forEach(function (app) {
      var item = el("button", "app-item");
      item.type = "button";
      item.setAttribute("role", "tab");
      item.setAttribute("aria-selected", String(app.id === selected));

      var name = el("span", "app-item-name");
      name.appendChild(document.createTextNode(app.name));
      if (app.status !== "live") name.appendChild(el("span", "tag", "Soon"));

      var body = document.createElement("span");
      body.appendChild(name);
      body.appendChild(el("span", "app-item-desc", app.summary));

      item.appendChild(swatch(app));
      item.appendChild(body);
      item.addEventListener("click", function () {
        if (app.id === selected) return;
        selected = app.id;
        draw();
      });
      list.appendChild(item);
    });

    panel.appendChild(list);
    panel.appendChild(el("p", "list-foot",
      shown.length > 1 ? "Pick one to see it working." : ""));
    slot.appendChild(panel);
    grid.appendChild(slot);

    /* --- the preview --- */
    var preview = el("div", "panel preview");
    preview.setAttribute("role", "tabpanel");
    preview.setAttribute("aria-label", "Preview");
    preview.tabIndex = 0;

    var app = shown.filter(function (a) { return a.id === selected; })[0];

    if (!app) {
      preview.appendChild(el("div", "empty", term.trim()
        ? "Nothing matches that. Try a different word."
        : "Nothing to show here."));
      grid.appendChild(preview);
      catalogueEl.appendChild(grid);
      return;
    }

    var head = el("div", "preview-head");
    var titles = document.createElement("div");
    titles.appendChild(el("span", "kicker",
      app.status === "live" ? "Try it here" : "In the works"));
    titles.appendChild(el("h3", null, app.name));
    head.appendChild(titles);

    var open = openLink(app, "btn btn--primary");
    if (open) head.appendChild(open);
    preview.appendChild(head);

    preview.appendChild(chrome(app));

    var stage = el("div", "preview-stage");
    preview.appendChild(stage);

    if (app.demo && window.BeehtaDemos[app.demo]) mountInto(stage, app);
    else stage.appendChild(comingSoon(app));

    if (app.note) preview.appendChild(el("p", "preview-note", app.note));

    grid.appendChild(preview);
    catalogueEl.appendChild(grid);
  }

  /* ================= narrow: a block each, full-width previews ================= */

  function renderNarrow(shown) {
    if (!shown.length) {
      var wrap = el("div", "shell");
      wrap.appendChild(el("p", "panel block hy-none", term.trim()
        ? "Nothing matches that. Try a different word."
        : "Nothing in that category yet."));
      catalogueEl.appendChild(wrap);
      return;
    }

    var entries = el("div", "hy-entries");

    shown.forEach(function (app) {
      var entry = el("article", "hy-entry");
      entry.id = "app-" + app.id;
      entry.dataset.app = app.id;

      /* --- the description, padded like the rest of the page --- */
      var pad = el("div", "shell");
      var info = el("div", "panel hy-info");

      var top = el("div", "hy-top");
      top.appendChild(swatch(app));

      var titles = document.createElement("div");
      var h3 = el("h3");
      h3.appendChild(document.createTextNode(app.name));
      if (app.status !== "live") h3.appendChild(el("span", "tag", "Soon"));
      titles.appendChild(h3);
      top.appendChild(titles);

      var open = openLink(app, "btn btn--ghost hy-open");
      if (open) top.appendChild(open);
      info.appendChild(top);

      info.appendChild(el("p", "hy-summary", app.summary));

      var st = statusOf(app);
      var meta = el("p", "hy-meta");
      meta.appendChild(el("span", "meta-cat", app.category));
      meta.appendChild(el("span", "meta-status " + st.cls, st.label));
      meta.appendChild(el("span", "meta-domain", domainOf(app)));
      info.appendChild(meta);

      pad.appendChild(info);
      entry.appendChild(pad);

      /* --- the preview, edge to edge ---
         Outside the padded wrapper on purpose: this is the one
         thing on the page that gets the whole screen width. */
      var preview = el("div", "hy-preview");

      preview.appendChild(chrome(app));

      var body = el("div", "hy-body");
      body.dataset.demo = app.demo || "";
      preview.appendChild(body);

      // A demo is filled in once the block comes near the screen.
      // Anything without one gets its panel now and keeps it.
      if (!(app.demo && window.BeehtaDemos[app.demo])) {
        body.appendChild(comingSoon(app));
      }

      if (app.note) preview.appendChild(el("p", "hy-note", app.note));

      entry.appendChild(preview);
      entries.appendChild(entry);
    });

    catalogueEl.appendChild(entries);
    startWatching();
  }

  /* ---------- draw ---------- */

  function draw() {
    unmountAll();
    catalogueEl.textContent = "";

    var shown = visible();

    // If a filter or a search hid the selected app, move to the
    // first one still standing rather than showing nothing.
    if (shown.length && !shown.some(function (a) { return a.id === selected; })) {
      selected = shown[0].id;
    }

    renderedWide = wide.matches;
    if (renderedWide) renderWide(shown);
    else renderNarrow(shown);

    if (countEl) {
      countEl.textContent = (shown.length === apps.length)
        ? apps.length + (apps.length === 1 ? " app" : " apps")
        : shown.length + " of " + apps.length;
    }
  }

  /* ---------- the hero's standing line ----------
     Derived, not typed into the HTML, so it cannot go stale the
     next time an app is added to data.js. */

  function drawHeroMeta() {
    if (!heroEl) return;
    var live = apps.filter(function (a) { return a.status === "live"; }).length;
    var soon = apps.length - live;

    var parts = [];
    if (live) parts.push(live + (live === 1 ? " app open" : " apps open"));
    if (soon) parts.push(soon + " more on the way");
    parts.push("the background is yours to rearrange");
    heroEl.textContent = parts.join(", ") + ".";
  }

  function drawUpNext() {
    var host = root.querySelector("#upNext");
    if (!host) return;

    var soon = apps.filter(function (a) { return a.status !== "live"; });
    host.textContent = "";

    if (!soon.length) {
      host.appendChild(el("p", null, "Nothing queued at the moment. Everything on the shelf is open."));
      return;
    }

    soon.forEach(function (app) {
      var row = document.createElement("article");
      var mark = el("span", "swatch");
      mark.style.backgroundColor = app.colour;
      mark.setAttribute("aria-hidden", "true");

      var body = document.createElement("div");
      body.appendChild(el("h3", null, app.name));
      body.appendChild(el("p", "upnext-cat", app.category));
      body.appendChild(el("p", null, app.summary));

      row.appendChild(mark);
      row.appendChild(body);
      host.appendChild(row);
    });
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

  if (filtersEl) {
    if (apps.length >= toolsFrom) {
      filtersEl.hidden = false;
      drawFilters();
    } else {
      filtersEl.hidden = true;
    }
  }

  function onSearch(e) { term = e.target.value; draw(); }
  if (searchEl) searchEl.addEventListener("input", onSearch);

  /* Crossing the breakpoint swaps the whole catalogue over.

     Two ways in, on purpose. The change event is the quick one,
     but it does not always arrive: emulated viewports and some
     window managers resize without firing it, and a single missed
     event would leave the wrong layout on screen permanently. So
     a throttled resize handler compares what is drawn against
     what should be drawn and puts it right. */

  function onBreakpoint() { draw(); }
  if (wide.addEventListener) wide.addEventListener("change", onBreakpoint);
  else wide.addListener(onBreakpoint);           // older Safari

  var layoutQueued = false;

  function onResize() {
    if (layoutQueued) return;
    layoutQueued = true;
    setTimeout(function () {
      layoutQueued = false;
      if (renderedWide !== wide.matches) draw();
    }, 150);
  }
  window.addEventListener("resize", onResize);

  drawHeroMeta();
  drawUpNext();
  draw();

  // A block can be linked to directly: beehta.com/#logins
  var fromHash = location.hash.slice(1);
  if (fromHash && apps.some(function (a) { return a.id === fromHash; })) {
    selected = fromHash;
    draw();
    var target = document.getElementById("app-" + fromHash);
    if (target) target.scrollIntoView();
  }

  /* The page hook contract: hand back a way to undo everything. */
  return function () {
    unmountAll();
    if (searchEl) searchEl.removeEventListener("input", onSearch);
    if (wide.removeEventListener) wide.removeEventListener("change", onBreakpoint);
    else wide.removeListener(onBreakpoint);
    window.removeEventListener("resize", onResize);
  };
};
