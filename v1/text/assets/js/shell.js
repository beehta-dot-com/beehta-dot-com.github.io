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

  /* ---------- moving the page ----------

     One way in for every animated scroll on the site, so the
     back-to-top button and the links down the page behave alike.

     The browser does the animation. It knows the platform, it
     honours the reader's motion setting on its own, and it hands
     the scroll back the moment the reader touches it.

     What it does not do is fail loudly. behavior:"smooth" is driven
     by the frame clock, and in an embedded context whose document
     is permanently hidden that clock never ticks: the call is
     accepted, nothing is thrown, and the page does not move at all.
     Measured in one such context, a plain scroll moved 1147px and
     the smooth one moved nothing. So the arrival is checked, and if
     the page never started, it is taken there directly.
  ---------- */

  var LANDING = 80;        // clear of the sticky header

  var nudged = false;      // the reader took over
  ["wheel", "touchstart", "keydown"].forEach(function (kind) {
    window.addEventListener(kind, function () { nudged = true; }, { passive: true });
  });

  function glideTo(y) {
    var max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    var to = Math.max(0, Math.min(Math.round(y), max));
    if (Math.abs(to - window.scrollY) < 2) return;

    nudged = false;
    window.scrollTo({ top: to, behavior: "smooth" });
    settle(to, 0);
  }

  /* Watch it arrive.

     Asking whether it started is not enough: where the frame clock
     stops part way through, the scroll stops with it, some of the
     distance covered and no error raised. So the position is
     sampled twice. Still moving, leave it alone. Stopped short,
     take it the rest of the way. */
  function settle(to, tries) {
    var was = window.scrollY;
    setTimeout(function () {
      if (nudged) return;
      if (Math.abs(window.scrollY - to) < 2) return;          // arrived
      if (Math.abs(window.scrollY - was) < 2) {               // stalled
        window.scrollTo(0, to);
        return;
      }
      if (tries < 12) settle(to, tries + 1);                  // still going
    }, 140);
  }

  /* ---------- links down the page ----------

     An href of "#apps" is left alone by the router, so the browser
     jumps to it. Nothing is wrong with a jump, but the rest of the
     page arrives rather than appears, and this should match.

     The address is deliberately not changed. Choosing where to look
     on a page is not going somewhere, and a hash left behind sends
     whoever you send the link to halfway down the page. */

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var link = e.target.closest && e.target.closest('a[href^="#"]');
    if (!link) return;

    var id = link.getAttribute("href").slice(1);
    var target = id && document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    glideTo(target.getBoundingClientRect().top + window.scrollY - LANDING);
  });

  /* ---------- back to the top ---------- */

  var toTop = document.createElement("button");
  toTop.type = "button";
  toTop.className = "to-top";
  toTop.textContent = "Top";
  toTop.setAttribute("aria-label", "Back to the top of the page");

  toTop.addEventListener("click", function () {
    glideTo(0);

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

    /* Everything that arrives as a block. Not the side nav of a
       document, which is position:sticky and should simply be
       there, and not the preview panel, which stays still on
       purpose because there is a working app inside it. */
    var panels = document.querySelectorAll(
      "main .section > .panel:not(.block--hero), " +
      "main .section > .about-grid, " +
      "main .page-head > .panel, " +
      "main .doc > .doc-body, " +
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

    /* It stays put over the footer as well. It used to stand down
       there because it was covering the control that resets the
       background; that control has moved to the other end of the
       footer row instead, which is the better fix. */
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
