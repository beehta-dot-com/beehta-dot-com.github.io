/* ============================================================
   EXPLORER.JS
   The catalogue on the home page  (stacked layout)

   Every app is drawn as its own block, one below the other, with
   its own preview beside it and a gradient in its own colour so
   one block is told from the next at a glance. There is no search
   and no selection: nothing is hidden behind a click, so a reader
   sees the whole shelf by scrolling.

   The cost of that is every preview exists at once. With one real
   demo that is nothing, but it does not stay nothing, so a demo
   is only built once its row comes near the viewport. Once built
   it stays, so a demo somebody has been poking at still looks the
   way they left it when they scroll back.

   A demo registers itself on window.BeehtaDemos before this runs.
============================================================ */

window.BeehtaDemos = window.BeehtaDemos || {};

/* router.js owns this object but loads last, so every page
   script that registers a hook has to be able to create it. */
window.beehtaPages = window.beehtaPages || {};

/* 24px grid, drawn rather than typed. A glyph taken from a font
   renders at whatever weight and baseline that font happens to
   use, which reads thin and sits low next to real type. */
var ICONS = {
  key:      '<path d="M14 7a4 4 0 1 1 3 6.9V16h-2v2h-2v2H9v-3l4.2-4.2A4 4 0 0 1 14 7z"/><circle cx="17.5" cy="8.5" r="1.2"/>',
  notebook: '<path d="M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6z"/><path d="M9 3v18M12 8h4M12 12h4"/>',
  split:    '<path d="M12 4v6M12 10l-5 4M12 10l5 4"/><circle cx="12" cy="4" r="1.6"/><circle cx="7" cy="15" r="1.6"/><circle cx="17" cy="15" r="1.6"/>',
  swap:     '<path d="M7 4v13M7 17l-3-3M7 17l3-3M17 20V7M17 7l3 3M17 7l-3 3"/>',
  shelf:    '<path d="M4 5h16v6H4zM4 13h16v6H4z"/><path d="M8 5v6M14 13v6"/>',
  box:      '<path d="M4 4h16v16H4z"/><path d="M4 9h16"/>'
};

function iconSvg(name, size) {
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' +
    'aria-hidden="true">' + (ICONS[name] || ICONS.box) + '</svg>';
}

window.beehtaPages.home = function (root) {
  "use strict";

  var apps = window.APPS || [];

  var entriesEl = root.querySelector("#entries");
  var emptyEl = root.querySelector("#entriesEmpty");
  var filtersEl = root.querySelector("#appFilters");
  var countEl = root.querySelector("#resultCount");

  if (!entriesEl) return;

  var category = "All";

  // id -> teardown, for the demos already built
  var mounted = Object.create(null);

  /* ---------- helpers ---------- */

  function domainOf(app) { return app.domain || (app.id + ".beehta.com"); }

  function statusOf(app) {
    if (app.status === "live") return { cls: "is-live", label: "Active" };
    if (app.status === "beta") return { cls: "is-beta", label: "Beta" };
    return { cls: "is-soon", label: "Coming soon" };
  }

  // A translucent version of an app's colour, for the gradient on
  // its block. Kept in JS because the colours are data, not CSS.
  function wash(hex, alpha) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return "transparent";
    var n = parseInt(m[1], 16);
    return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + alpha + ")";
  }

  function visible() {
    if (category === "All") return apps.slice();
    return apps.filter(function (app) { return app.category === category; });
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  /* ---------- one row ---------- */

  function entryEl(app) {
    var entry = el("article", "entry panel");
    entry.id = "app-" + app.id;
    entry.dataset.app = app.id;

    // Both are read by the block's own gradient in pages.css. The
    // featured entry is washed harder so it still stands out now
    // that every block is tinted.
    entry.style.setProperty("--app", app.colour);
    entry.style.setProperty("--wash", wash(app.colour, app.featured ? 0.85 : 0.5));

    /* --- left: what it is --- */

    var info = el("div", "entry-info");

    var top = el("div", "entry-top");
    var icon = el("span", "entry-icon");
    icon.innerHTML = iconSvg(app.icon, 18);
    icon.setAttribute("aria-hidden", "true");
    top.appendChild(icon);

    var titles = el("div", "entry-titles");
    var h3 = el("h3");
    h3.appendChild(document.createTextNode(app.name));
    if (app.version) h3.appendChild(el("span", "ver", app.version));
    if (app.featured) h3.appendChild(el("span", "badge", "Featured"));
    titles.appendChild(h3);
    if (app.tagline) titles.appendChild(el("p", "entry-tagline", app.tagline));
    top.appendChild(titles);

    // Anything that exists can be opened. "soon" entries have
    // nowhere to go, so they get nothing to press.
    if (app.status !== "soon" && app.url) {
      var open = el("a", "btn btn--primary entry-open", "Open " + app.name);
      open.href = app.url;
      open.target = "_blank";
      open.rel = "noopener";
      top.appendChild(open);
    }

    info.appendChild(top);

    info.appendChild(el("p", "entry-summary", app.summary));

    var meta = el("p", "entry-meta");
    meta.appendChild(el("span", "meta-cat", app.category));

    var st = statusOf(app);
    var status = el("span", "meta-status " + st.cls);
    status.appendChild(el("i"));
    status.appendChild(document.createTextNode(st.label));
    meta.appendChild(status);

    meta.appendChild(el("span", "meta-domain", domainOf(app)));
    if (app.updated) meta.appendChild(el("span", "meta-updated", "Updated " + app.updated));
    info.appendChild(meta);

    entry.appendChild(info);

    /* --- right: the preview --- */

    var preview = el("div", "entry-preview");

    var bar = el("div", "pv-bar");
    bar.setAttribute("aria-hidden", "true");
    bar.appendChild(el("i"));
    bar.appendChild(el("span", null, domainOf(app) + "/demo"));
    preview.appendChild(bar);

    var body = el("div", "pv-body");
    body.dataset.demo = app.demo || "";
    preview.appendChild(body);

    // A demo is filled in later, when the row is near the screen.
    // Anything without one gets its panel now and keeps it.
    if (!(app.demo && window.BeehtaDemos[app.demo])) {
      body.appendChild(placeholder(app));
    }

    if (app.note) preview.appendChild(el("p", "preview-note", app.note));

    entry.appendChild(preview);
    return entry;
  }

  function placeholder(app) {
    var box = el("div", "pv-empty");

    var icon = el("span", "entry-icon");
    icon.innerHTML = iconSvg(app.icon, 22);
    icon.setAttribute("aria-hidden", "true");
    box.appendChild(icon);

    box.appendChild(el("p", null, app.status === "live"
      ? "No preview for this one yet."
      : "Not built yet."));

    // No button down here: a finished app already carries one up
    // beside its name, and an unbuilt one has nowhere to send you.
    return box;
  }

  /* ---------- demos, built when they come near ----------

     Deliberately not done with an IntersectionObserver. That
     callback is async and in some contexts never fires at all,
     which would leave every preview permanently blank rather than
     merely late. A measurement taken during the first draw cannot
     fail that way, and a throttled scroll handler picks up the
     rows further down.
  ---------------------------------------------------------- */

  var NEAR = 400;          // px beyond the viewport that counts as near
  var watching = false;
  var queued = false;

  function mountDemo(body) {
    var entry = body.closest(".entry");
    if (!entry) return;

    var id = entry.dataset.app;
    var name = body.dataset.demo;
    if (!name || mounted[id]) return;

    var demo = window.BeehtaDemos[name];
    if (!demo || typeof demo.mount !== "function") return;

    mounted[id] = demo.mount(body) || function () { body.textContent = ""; };
  }

  function pending() {
    return entriesEl.querySelectorAll(".pv-body[data-demo]:not([data-demo=''])");
  }

  function mountNearby() {
    queued = false;

    var bodies = pending();
    var left = 0;

    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      var entry = body.closest(".entry");
      if (entry && mounted[entry.dataset.app]) continue;

      var box = body.getBoundingClientRect();
      if (box.top < window.innerHeight + NEAR && box.bottom > -NEAR) mountDemo(body);
      else left++;
    }

    // Once every demo on the page is up there is nothing left to
    // wait for, so stop listening.
    if (!left) stopWatching();
  }

  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(mountNearby);
  }

  function startWatching() {
    mountNearby();                       // first pass, synchronous
    if (watching || !pending().length) return;
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

  function unmountAll() {
    stopWatching();
    Object.keys(mounted).forEach(function (id) { mounted[id](); delete mounted[id]; });
  }

  /* ---------- draw ---------- */

  function draw() {
    unmountAll();
    entriesEl.textContent = "";

    var shown = visible();
    shown.forEach(function (app) { entriesEl.appendChild(entryEl(app)); });

    if (emptyEl) {
      emptyEl.hidden = shown.length > 0;
      emptyEl.textContent = "Nothing in that category yet.";
    }

    if (countEl) {
      countEl.textContent = (shown.length === apps.length)
        ? apps.length + (apps.length === 1 ? " app" : " apps")
        : shown.length + " of " + apps.length;
    }

    startWatching();
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

  drawFilters();
  draw();

  // A row can be linked to directly: beehta.com/#logins
  var fromHash = location.hash.slice(1);
  if (fromHash) {
    var target = root.querySelector("#app-" + CSS.escape(fromHash));
    if (target) target.scrollIntoView();
  }

  // The page hook contract: hand back a way to undo everything.
  return function () {
    unmountAll();
  };
};
