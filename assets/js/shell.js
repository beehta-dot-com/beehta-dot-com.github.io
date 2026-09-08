/* ============================================================
   SHELL.JS

   The small jobs that belong to the page furniture rather than to
   any one page: the copyright year, the controls that reset the
   background, and the back-to-top button.

   All of it lives outside <main>, so this runs once and the router
   never disturbs it.

   Kept out of an inline <script> tag on purpose: beehta.com is
   meant to end up behind a Content Security Policy with
   script-src 'self', and inline handlers are the first thing that
   breaks.
============================================================ */

(function () {
  "use strict";

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- reset the background ----------
     There is one of these in the footer of every page and another
     inside the section that explains the background, so this binds
     by attribute rather than by id. */

  var resets = document.querySelectorAll("[data-reset-tiles]");
  for (var i = 0; i < resets.length; i++) {
    resets[i].addEventListener("click", function () {
      if (typeof window.resetTiles === "function") window.resetTiles();
    });
  }

  /* ---------- back to the top ----------

     Built here rather than written into every page, so there is
     one copy of it. It only turns up once there is enough page
     behind you to be worth going back over. */

  var SHOW_AFTER = 700;   // px scrolled before the button appears

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

  var queued = false;

  function mark() {
    queued = false;
    toTop.classList.toggle("is-on", window.scrollY > SHOW_AFTER);
  }

  // A timer rather than requestAnimationFrame, which does not run
  // while the document is hidden.
  window.addEventListener("scroll", function () {
    if (queued) return;
    queued = true;
    setTimeout(mark, 100);
  }, { passive: true });

  mark();

  /* ---------- reveal sections as they arrive ----------

     The class is added here rather than written into the markup,
     so with JavaScript off nothing is ever hidden. A measurement
     on a timer rather than an IntersectionObserver, for the same
     reason as everywhere else: that callback does not fire at all
     in some contexts, and a permanently invisible page is a far
     worse failure than one that does not animate. */

  var revealing = document.querySelectorAll("main .section > .panel, main .section > .about-grid");
  var pending = [];

  for (var r = 0; r < revealing.length; r++) {
    revealing[r].classList.add("reveal");
    pending.push(revealing[r]);
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
    if (!pending.length) window.removeEventListener("scroll", onRevealScroll);
  }

  var revealQueued = false;

  function onRevealScroll() {
    if (revealQueued) return;
    revealQueued = true;
    setTimeout(function () { revealQueued = false; showNearby(); }, 80);
  }

  if (pending.length) {
    window.addEventListener("scroll", onRevealScroll, { passive: true });
    window.addEventListener("resize", onRevealScroll);
    showNearby();
  }
})();
