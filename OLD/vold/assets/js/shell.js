/* ============================================================
   SHELL.JS

   The two small jobs that belong to the header and footer rather
   than to any one page. Both live outside <main>, so this runs
   once and the router never disturbs it.

   Kept out of an inline <script> tag on purpose: beehta.com is
   meant to end up behind a Content Security Policy with
   script-src 'self', and inline handlers are the first thing
   that breaks.
============================================================ */

(function () {
  "use strict";

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  var reset = document.getElementById("resetTiles");
  if (reset) {
    reset.addEventListener("click", function () {
      if (typeof window.resetTiles === "function") window.resetTiles();
    });
  }

  /* ---------- back to the top ----------

     Built here rather than written into every page, so there is
     one copy of it and no fifth file to remember. It only turns
     up once there is enough page behind you to be worth going
     back over. */

  var SHOW_AFTER = 700;   // px scrolled before the button appears

  var toTop = document.createElement("button");
  toTop.type = "button";
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Back to the top");
  toTop.innerHTML =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 19V5M5 12l7-7 7 7"/></svg>';

  toTop.addEventListener("click", function () {
    // Honour a reader who has asked the system for less movement.
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });

    // Send the keyboard back with the page, or the next Tab picks
    // up wherever it left off further down.
    var skip = document.querySelector(".skip-link");
    if (skip) skip.focus({ preventScroll: true });
  });

  document.body.appendChild(toTop);

  var queued = false;

  function mark() {
    queued = false;
    toTop.classList.toggle("is-on", window.scrollY > SHOW_AFTER);
  }

  window.addEventListener("scroll", function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(mark);
  }, { passive: true });

  mark();
})();
