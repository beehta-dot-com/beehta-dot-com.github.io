/* ============================================================
   TRANSITIONS.JS
   A small fade-in on load. Nothing more, no page-to-page
   routing tricks, just a soft entrance for the content.
============================================================ */
(function fadeIn(){
  document.documentElement.style.opacity = "0";
  window.addEventListener("DOMContentLoaded", function(){
    document.documentElement.style.transition = "opacity .25s ease";
    requestAnimationFrame(function(){
      document.documentElement.style.opacity = "1";
    });
  });
})();
