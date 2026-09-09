/* ============================================================
   EXPLORER.JS
   The app catalogue on the home page

   Reads APPS from data.js and draws four things from one piece of
   state:

     - the list of apps (wide screens)
     - the same list as a strip of tab headers (narrow screens)
     - the preview panel, which mounts a demo or the coming-soon
       placeholder
     - the search box, and the category filters once there are
       enough apps to be worth filtering

   Only one of the list and the strip is ever visible; CSS decides
   which. Both drive the same selection, so turning a phone
   sideways keeps the chosen app.

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

  var listEl = root.querySelector("#appList");
  var stripEl = root.querySelector("#tabstrip");
  var previewEl = root.querySelector("#preview");
  var footEl = root.querySelector("#listFoot");
  var searchEl = root.querySelector("#appSearch");
  var filtersEl = root.querySelector("#appFilters");
  var countEl = root.querySelector("#resultCount");
  var heroEl = root.querySelector("#heroMeta");

  if (!listEl || !previewEl) return;

  var category = "All";
  var term = "";
  var selected = null;
  var unmountDemo = null;

  /* ---------- selection ---------- */

  // A preview can be linked to directly: beehta.com/#logins
  var fromHash = location.hash.slice(1);
  if (fromHash && apps.some(function (a) { return a.id === fromHash; })) {
    selected = fromHash;
  } else if (apps.length) {
    selected = apps[0].id;
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

  function select(id) {
    if (id === selected) return;
    selected = id;
    draw();
  }

  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }

  /* ---------- the hero's standing line ----------
     Derived, not typed into the HTML, so it cannot go stale the
     next time an app is added to data.js. */

  function drawHeroMeta() {
    if (!heroEl) return;

    var live = apps.filter(function (a) { return a.status === "live"; }).length;
    var soon = apps.length - live;

    heroEl.textContent = "";

    var parts = [];
    if (live) parts.push(["#e8d3c0", plural(live, "app open", "apps open")]);
    if (soon) parts.push(["#d7e2ce", plural(soon, "more on the way", "more on the way")]);
    parts.push(["#d2dfe8", "The background is yours to rearrange"]);

    parts.forEach(function (part) {
      var span = document.createElement("span");
      var chip = document.createElement("span");
      chip.className = "chip";
      chip.style.backgroundColor = part[0];
      chip.setAttribute("aria-hidden", "true");
      span.appendChild(chip);
      span.appendChild(document.createTextNode(part[1]));
      heroEl.appendChild(span);
    });
  }

  /* ---------- pieces ---------- */

  function swatch(app) {
    var box = document.createElement("span");
    box.className = "app-swatch";
    box.style.backgroundColor = app.colour;
    box.setAttribute("aria-hidden", "true");
    return box;
  }

  function drawList(shown) {
    listEl.textContent = "";

    shown.forEach(function (app) {
      var item = document.createElement("button");
      item.type = "button";
      item.className = "app-item";
      item.id = "app-tab-" + app.id;
      item.setAttribute("role", "tab");
      item.setAttribute("aria-selected", String(app.id === selected));
      item.setAttribute("aria-controls", "preview");

      var name = document.createElement("span");
      name.className = "app-item-name";
      name.appendChild(document.createTextNode(app.name));
      if (app.status !== "live") {
        var tag = document.createElement("span");
        tag.className = "tag tag--soon";
        tag.textContent = "Soon";
        name.appendChild(tag);
      }

      var desc = document.createElement("span");
      desc.className = "app-item-desc";
      desc.textContent = app.summary;

      var body = document.createElement("span");
      body.appendChild(name);
      body.appendChild(desc);

      item.appendChild(swatch(app));
      item.appendChild(body);
      item.addEventListener("click", function () { select(app.id); });

      listEl.appendChild(item);
    });

    if (footEl) {
      footEl.textContent = shown.length > 1
        ? "Pick one to see it working."
        : "";
    }
  }

  function drawStrip(shown) {
    if (!stripEl) return;
    stripEl.textContent = "";

    shown.forEach(function (app) {
      var tab = document.createElement("button");
      tab.type = "button";
      tab.className = "tab";
      tab.id = "app-strip-" + app.id;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(app.id === selected));
      tab.setAttribute("aria-controls", "preview");

      var dot = document.createElement("span");
      dot.className = "dot";
      dot.style.backgroundColor = app.colour;
      dot.setAttribute("aria-hidden", "true");

      tab.appendChild(dot);
      tab.appendChild(document.createTextNode(app.name));
      tab.addEventListener("click", function () {
        select(app.id);
        tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      });

      stripEl.appendChild(tab);
    });

    markStripEdges();
  }

  // Which way the strip can still be scrolled. CSS fades whichever
  // edge has more behind it, so a half-cut tab reads as "there is
  // more" rather than as a rendering fault.
  function markStripEdges() {
    if (!stripEl) return;
    var slack = stripEl.scrollWidth - stripEl.clientWidth;
    var x = stripEl.scrollLeft;
    stripEl.classList.toggle("has-more-left", slack > 2 && x > 2);
    stripEl.classList.toggle("has-more-right", slack > 2 && x < slack - 2);
  }

  function drawPreview(shown) {
    if (unmountDemo) { unmountDemo(); unmountDemo = null; }
    previewEl.textContent = "";

    var app = shown.filter(function (a) { return a.id === selected; })[0];

    if (!app) {
      var empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = term.trim()
        ? "Nothing matches “" + term.trim() + "”. Try a different word."
        : "Nothing to show here.";
      previewEl.appendChild(empty);
      return;
    }

    /* header */
    var head = document.createElement("div");
    head.className = "preview-head";

    var titles = document.createElement("div");
    var kicker = document.createElement("span");
    kicker.className = "kicker";
    kicker.textContent = app.status === "live" ? "Try it here" : "In the works";
    var h3 = document.createElement("h3");
    h3.textContent = app.name;
    titles.appendChild(kicker);
    titles.appendChild(h3);
    head.appendChild(titles);

    if (app.status === "live" && app.url) {
      var open = document.createElement("a");
      open.className = "btn btn--primary";
      open.href = app.url;
      open.target = "_blank";
      open.rel = "noopener";
      open.textContent = "Open " + app.name;
      head.appendChild(open);
    }

    previewEl.appendChild(head);

    /* window chrome */
    var chrome = document.createElement("div");
    chrome.className = "preview-chrome";
    chrome.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 3; i++) chrome.appendChild(document.createElement("i"));
    var url = document.createElement("span");
    url.className = "preview-url";
    url.textContent = app.id + ".beehta.com";
    chrome.appendChild(url);
    previewEl.appendChild(chrome);

    /* the demo, or the placeholder */
    var stage = document.createElement("div");
    stage.className = "preview-stage";
    previewEl.appendChild(stage);

    var demo = app.demo && window.BeehtaDemos[app.demo];
    if (demo && typeof demo.mount === "function") {
      unmountDemo = demo.mount(stage) || null;
    } else {
      stage.appendChild(comingSoon(app));
    }

    /* Footnote, only when there is something app-specific to say.
       The section already explains that every preview is a
       stand-in, so repeating it under each one is noise. */
    var footnote = app.note || (app.status === "live"
      ? ""
      : "Not built yet. It will turn up here when it is.");

    if (footnote) {
      var note = document.createElement("p");
      note.className = "preview-note";
      note.textContent = footnote;
      previewEl.appendChild(note);
    }
  }

  function comingSoon(app) {
    var box = document.createElement("div");
    box.className = "soon";

    var kicker = document.createElement("span");
    kicker.className = "kicker kicker--red";
    kicker.textContent = "Coming soon";

    var h4 = document.createElement("h4");
    h4.textContent = app.name;

    var p = document.createElement("p");
    p.textContent = app.summary;

    var bars = document.createElement("div");
    bars.className = "soon-bars";
    bars.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 4; i++) {
      var bar = document.createElement("i");
      // Tint the bars with the app's own colour so the empty slot
      // still belongs to the app it stands in for.
      if (i < 2) bar.style.backgroundColor = app.colour;
      bars.appendChild(bar);
    }

    box.appendChild(kicker);
    box.appendChild(h4);
    box.appendChild(p);
    box.appendChild(bars);
    return box;
  }

  function drawFilters() {
    if (!filtersEl) return;

    var seen = ["All"];
    apps.forEach(function (app) {
      if (seen.indexOf(app.category) === -1) seen.push(app.category);
    });

    filtersEl.textContent = "";
    seen.forEach(function (name) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter";
      btn.textContent = name;
      btn.setAttribute("aria-pressed", String(name === category));
      btn.addEventListener("click", function () {
        category = name;
        drawFilters();
        draw();
      });
      filtersEl.appendChild(btn);
    });
  }

  /* ---------- draw ---------- */

  function draw() {
    var shown = visible();

    // If a filter or a search hid the selected app, move to the
    // first one still standing rather than showing nothing.
    if (shown.length && !shown.some(function (a) { return a.id === selected; })) {
      selected = shown[0].id;
    }

    drawList(shown);
    drawStrip(shown);
    drawPreview(shown);

    if (countEl) {
      countEl.textContent = (shown.length === apps.length)
        ? plural(apps.length, "app", "apps")
        : shown.length + " of " + apps.length;
    }
  }

  /* ---------- wiring ---------- */

  // Search is always here. Category filters are not: a filter row
  // over five items is furniture, so they wait until the catalogue
  // is long enough to make scanning it expensive.
  if (filtersEl) {
    if (apps.length >= toolsFrom) {
      filtersEl.hidden = false;
      drawFilters();
    } else {
      filtersEl.hidden = true;
    }
  }

  function onSearch(e) {
    term = e.target.value;
    draw();
  }
  if (searchEl) searchEl.addEventListener("input", onSearch);

  if (stripEl) stripEl.addEventListener("scroll", markStripEdges, { passive: true });
  window.addEventListener("resize", markStripEdges);

  drawHeroMeta();
  draw();

  // The page hook contract: hand back a way to undo everything.
  return function () {
    if (unmountDemo) { unmountDemo(); unmountDemo = null; }
    if (searchEl) searchEl.removeEventListener("input", onSearch);
    if (stripEl) stripEl.removeEventListener("scroll", markStripEdges);
    window.removeEventListener("resize", markStripEdges);
  };
};
