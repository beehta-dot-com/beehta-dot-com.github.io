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
})();
