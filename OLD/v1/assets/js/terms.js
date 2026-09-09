/* ============================================================
   TERMS.JS - Minimal script for the legal page
============================================================ */

(function init() {
  /* Set current year in footer copyright */
  const yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
