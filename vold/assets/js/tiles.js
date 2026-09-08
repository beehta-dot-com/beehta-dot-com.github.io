/* ============================================================
   TILES.JS
   The beehta.com background

   A field of coloured tiles fixed behind the page. Two tiles can
   be swapped by dragging one onto the other, or by tapping one
   and then the other. Whatever arrangement a visitor ends up with
   is written to localStorage and restored next time.

   Colours are the app palette from data.js, so the background is
   literally made of the colours of the things in the catalogue.

   Storage note: the grid changes size when the window does, so
   the arrangement is saved as a 2D map (row, column) rather than
   a flat list. On a resize the overlapping area keeps whatever
   the visitor arranged and only the newly exposed edge falls back
   to the default pattern.
============================================================ */

(function () {
  "use strict";

  var KEY = "beehta.tiles.v1";
  var HINT_KEY = "beehta.tiles.hint-seen";

  var field = document.getElementById("tile-field");
  if (!field) return;

  // Falls back to a small built-in set if data.js has not loaded,
  // so the background never renders as a blank rectangle.
  var PALETTE = (window.TILE_COLOURS && window.TILE_COLOURS.length)
    ? window.TILE_COLOURS
    : ["#efe0d2", "#dde5d4", "#d6e2ea", "#f0e6c9", "#e2dcea", "#eedadd"];

  var cols = 0;
  var rows = 0;
  var size = 0;
  var grid = [];        // grid[row][col] = index into PALETTE
  var tiles = [];       // tiles[row][col] = the element
  var picked = null;    // the tile waiting for a partner
  var dragging = false;

  /* ---------- storage ---------- */

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var saved = JSON.parse(raw);
      if (!saved || !Array.isArray(saved.grid)) return null;
      return saved;
    } catch (err) {
      // Private browsing, a full quota, or somebody's hand-edited
      // JSON. None of it is worth breaking the page over.
      return null;
    }
  }

  function write() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ cols: cols, rows: rows, grid: grid }));
    } catch (err) {
      /* nothing to do: the arrangement just will not persist */
    }
  }

  /* ---------- the default pattern ---------- */

  // Deterministic scatter. The same cell always gets the same
  // colour, so a resize does not reshuffle the untouched parts,
  // but the field does not read as diagonal stripes either.
  function defaultAt(row, col) {
    var h = (Math.imul(row + 1, 73856093) ^ Math.imul(col + 1, 19349663)) >>> 0;
    return h % PALETTE.length;
  }

  /* ---------- sizing ---------- */

  function tileSize() {
    var w = window.innerWidth;
    if (w < 420) return 62;
    if (w < 768) return 76;
    if (w < 1200) return 92;
    if (w < 1600) return 106;
    return 120;
  }

  function buildGrid(saved) {
    grid = [];
    for (var r = 0; r < rows; r++) {
      var row = [];
      for (var c = 0; c < cols; c++) {
        var keep = saved &&
          r < saved.rows &&
          c < saved.cols &&
          saved.grid[r] &&
          typeof saved.grid[r][c] === "number" &&
          saved.grid[r][c] < PALETTE.length;
        row.push(keep ? saved.grid[r][c] : defaultAt(r, c));
      }
      grid.push(row);
    }
  }

  /* ---------- rendering ---------- */

  function render() {
    field.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
    field.style.gridTemplateRows = "repeat(" + rows + ", 1fr)";
    field.textContent = "";

    tiles = [];
    picked = null;

    var frag = document.createDocumentFragment();

    for (var r = 0; r < rows; r++) {
      tiles.push([]);
      for (var c = 0; c < cols; c++) {
        var tile = document.createElement("div");
        tile.className = "tile";
        tile.dataset.row = r;
        tile.dataset.col = c;
        tile.style.backgroundColor = PALETTE[grid[r][c]];
        tile.draggable = true;
        tile.tabIndex = -1;
        tile.setAttribute("role", "button");
        tile.setAttribute("aria-label", "Background tile. Pick two to swap them.");
        frag.appendChild(tile);
        tiles[r].push(tile);
      }
    }

    field.appendChild(frag);

    // One tile per field is reachable by keyboard. Once focus is
    // inside, the arrow keys move between tiles; this keeps the
    // background out of the way of a normal tab through the page.
    if (tiles[0] && tiles[0][0]) tiles[0][0].tabIndex = 0;
  }

  function paint(tile) {
    tile.style.backgroundColor = PALETTE[grid[+tile.dataset.row][+tile.dataset.col]];
  }

  /* ---------- swapping ---------- */

  function swap(a, b) {
    if (!a || !b || a === b) return;

    var ar = +a.dataset.row, ac = +a.dataset.col;
    var br = +b.dataset.row, bc = +b.dataset.col;

    var held = grid[ar][ac];
    grid[ar][ac] = grid[br][bc];
    grid[br][bc] = held;

    paint(a);
    paint(b);
    write();

    a.classList.add("just-swapped");
    b.classList.add("just-swapped");
    setTimeout(function () {
      a.classList.remove("just-swapped");
      b.classList.remove("just-swapped");
    }, 340);
  }

  function unpick() {
    if (picked) picked.classList.remove("is-picked");
    picked = null;
  }

  function pickOrSwap(tile) {
    if (!picked) {
      picked = tile;
      tile.classList.add("is-picked");
      return;
    }
    if (picked === tile) { unpick(); return; }
    var first = picked;
    unpick();
    swap(first, tile);
  }

  /* ---------- events ----------
     All of them are bound once, on the container, so rebuilding
     the field costs nothing extra. */

  field.addEventListener("click", function (e) {
    if (dragging) return;
    var tile = e.target.closest(".tile");
    if (!tile) return;
    tile.focus({ preventScroll: true });
    pickOrSwap(tile);
    dismissHint();
  });

  field.addEventListener("dragstart", function (e) {
    var tile = e.target.closest(".tile");
    if (!tile) return;
    dragging = true;
    unpick();
    tile.classList.add("is-dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", tile.dataset.row + "," + tile.dataset.col);
  });

  field.addEventListener("dragover", function (e) {
    var tile = e.target.closest(".tile");
    if (!tile) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!tile.classList.contains("is-dragging")) tile.classList.add("is-target");
  });

  field.addEventListener("dragleave", function (e) {
    var tile = e.target.closest(".tile");
    if (tile) tile.classList.remove("is-target");
  });

  field.addEventListener("drop", function (e) {
    var tile = e.target.closest(".tile");
    if (!tile) return;
    e.preventDefault();
    tile.classList.remove("is-target");

    var from = (e.dataTransfer.getData("text/plain") || "").split(",");
    if (from.length !== 2) return;

    var source = tiles[+from[0]] && tiles[+from[0]][+from[1]];
    swap(source, tile);
    dismissHint();
  });

  field.addEventListener("dragend", function () {
    dragging = false;
    var stale = field.querySelectorAll(".is-dragging, .is-target");
    for (var i = 0; i < stale.length; i++) {
      stale[i].classList.remove("is-dragging", "is-target");
    }
  });

  field.addEventListener("keydown", function (e) {
    var tile = e.target.closest(".tile");
    if (!tile) return;

    var r = +tile.dataset.row;
    var c = +tile.dataset.col;
    var dr = 0, dc = 0;

    switch (e.key) {
      case "ArrowUp":    dr = -1; break;
      case "ArrowDown":  dr = 1;  break;
      case "ArrowLeft":  dc = -1; break;
      case "ArrowRight": dc = 1;  break;
      case "Enter":
      case " ":
        e.preventDefault();
        pickOrSwap(tile);
        dismissHint();
        return;
      case "Escape":
        unpick();
        return;
      default:
        return;
    }

    e.preventDefault();
    var next = tiles[r + dr] && tiles[r + dr][c + dc];
    if (!next) return;
    tile.tabIndex = -1;
    next.tabIndex = 0;
    next.focus({ preventScroll: true });
  });

  /* ---------- the hint ---------- */

  var hint = document.getElementById("tile-hint");

  function dismissHint() {
    if (!hint || hint.hidden) return;
    hint.hidden = true;
    try { localStorage.setItem(HINT_KEY, "1"); } catch (err) { /* ignore */ }
  }

  function maybeShowHint() {
    if (!hint) return;
    var seen = false;
    try { seen = localStorage.getItem(HINT_KEY) === "1"; } catch (err) { seen = true; }
    if (seen) return;
    // Late enough that it does not compete with the page loading.
    setTimeout(function () { hint.hidden = false; }, 1400);
  }

  if (hint) {
    hint.querySelector("[data-dismiss]").addEventListener("click", dismissHint);
  }

  /* ---------- build and rebuild ---------- */

  function build() {
    size = tileSize();
    cols = Math.max(1, Math.ceil(window.innerWidth / size));
    rows = Math.max(1, Math.ceil(window.innerHeight / size) + 1);
    buildGrid(read());
    render();
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var s = tileSize();
      var c = Math.max(1, Math.ceil(window.innerWidth / s));
      var r = Math.max(1, Math.ceil(window.innerHeight / s) + 1);
      if (c === cols && r === rows && s === size) return;

      // Carry the current arrangement across, not the saved one,
      // so a swap made since load is not lost on a resize.
      var current = { cols: cols, rows: rows, grid: grid };
      size = s; cols = c; rows = r;
      buildGrid(current);
      render();
      write();
    }, 180);
  });

  // Exposed so the footer's "Reset background" control can call it.
  window.resetTiles = function () {
    try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
    buildGrid(null);
    render();
  };

  build();
  maybeShowHint();
})();
