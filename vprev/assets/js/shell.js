/* ============================================================
   SHELL.JS

   The small jobs that belong to the page furniture rather than to
   any one page: the copyright year, the control that resets the
   background, the header's scrolled state, the back-to-top button,
   and the arrival animations.

   All of it lives outside <main>, so this runs once. What it does
   inside <main> is re-run after every router swap, through
   window.beehtaShell.animate().

   Kept out of an inline <script> tag on purpose: beehta.com is
   meant to end up behind a Content Security Policy with
   script-src 'self', and inline handlers are the first thing that
   breaks.
============================================================ */

window.beehtaShell = window.beehtaShell || {};

(function () {
  "use strict";

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- reset the background ---------- */

  var resets = document.querySelectorAll("[data-reset-tiles]");
  for (var i = 0; i < resets.length; i++) {
    resets[i].addEventListener("click", function () {
      if (typeof window.resetTiles === "function") window.resetTiles();
    });
  }

  /* ============================================================
     Everything below reacts to the scroll position.

     One listener, one timer, one pass. Three separate throttled
     handlers on the same event is three times the work for the
     same information.

     A timer rather than requestAnimationFrame throughout: rAF does
     not run while the document is hidden, and in more than one
     embedded context the document is permanently hidden. A page
     whose header never un-sticks is a small bug; a page whose
     content never becomes visible is a broken page.
  ============================================================ */

  var header = document.querySelector(".site-header");
  var SHOW_AFTER = 700;   // px scrolled before the top button appears

  /* ---------- back to the top ---------- */

  var toTop = document.createElement("button");
  toTop.type = "button";
  toTop.className = "to-top";
  toTop.textContent = "Top";
  toTop.setAttribute("aria-label", "Back to the top of the page");

  toTop.addEventListener("click", function () {
    // Honour a reader who has asked the system for less movement.
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });

    // Send the keyboard back with the page, or the next Tab picks
    // up wherever it left off further down.
    var first = document.querySelector(".site-header a");
    if (first) first.focus({ preventScroll: true });
  });

  document.body.appendChild(toTop);

  /* ---------- arrival ----------

     The classes are added here rather than written into the
     markup, so with JavaScript off nothing is ever hidden.

     The preview panel is deliberately not in any of these
     selectors. It holds a working app and it stays still. */

  var pending = [];

  function stagger(panel, selector, gap) {
    var kids = panel.querySelectorAll(selector);
    for (var i = 0; i < kids.length; i++) {
      kids[i].classList.add("stagger");
      kids[i].style.setProperty("--d", (i * gap) + "ms");
    }
  }

  function animate() {
    pending = [];

    /* Everything that arrives as a block. Not .doc, whose side
       nav is position:sticky and would be broken by a transform
       on its ancestor, and not the preview panel, which stays
       still on purpose. */
    var panels = document.querySelectorAll(
      "main .section > .panel:not(.block--hero), " +
      "main .section > .about-grid, " +
      "main .cat-heading > .panel, " +
      "main .soon-wrap, " +
      "main .page-head > .panel, " +
      "main .doc-single > .panel, " +
      "main .contact > .panel, " +
      "main .contact > .contact-aside, " +
      "main .notfound > .panel"
    );

    for (var i = 0; i < panels.length; i++) {
      var panel = panels[i];
      panel.classList.add("reveal");

      // The lists inside a panel come in behind it, in order.
      stagger(panel, ".steps > li", 90);
      stagger(panel, ".plainlist > li", 80);
      stagger(panel, ".about-card", 80);
      stagger(panel, ".statement .line", 110);
      stagger(panel, ".twoup > div", 90);
      stagger(panel, ".aside-card", 70);

      pending.push(panel);
    }

    showNearby();
  }

  function showNearby() {
    for (var i = pending.length - 1; i >= 0; i--) {
      var box = pending[i].getBoundingClientRect();
      // No lower bound: a block the reader has already scrolled
      // past should simply be shown, not left waiting to animate.
      if (box.top < window.innerHeight - 60) {
        pending[i].classList.add("is-in");
        pending.splice(i, 1);
      }
    }
  }

  /* ---------- the one scroll pass ---------- */

  var queued = false;

  function pass() {
    queued = false;
    toTop.classList.toggle("is-on", window.scrollY > SHOW_AFTER);
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
    if (pending.length) showNearby();
  }

  function onScroll() {
    if (queued) return;
    queued = true;
    setTimeout(pass, 80);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* The router calls this after it swaps a new <main> in, because
     the old panels are gone and the new ones have never been
     looked at. */
  window.beehtaShell.animate = function () {
    animate();
    pass();
  };

  animate();
  pass();
})();
