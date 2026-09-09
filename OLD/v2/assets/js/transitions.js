/* ============================================================
   TRANSITIONS.JS - Smooth page-to-page transition handler
   beehta.com

   How it works:
   ─────────────
   • On every page load the CSS `pageFadeIn` keyframe runs
     automatically (applied to <body> in base.css).

   • When the user clicks an internal link this script:
       1. Cancels the default navigation.
       2. Adds the `.page-leaving` class to <body>, which
          triggers the `pageFadeOut` keyframe (also in base.css).
       3. After the fade-out duration, performs the navigation.

   • Root-relative links to a hash on the current page
     (e.g. "/#directory" clicked while already on "/") scroll
     smoothly instead of reloading the page.

   Links that are skipped (no transition applied):
   ─────────────────────────────────────────────────
   • External URLs  (http / https / //)
   • Hash-only anchors (#section)
   • mailto: / tel: links
   • Links with target="_blank"
============================================================ */

(function initPageTransitions() {
  /* Must match the pageFadeOut duration in base.css */
  const FADE_OUT_MS = 260;

  function onHomePage() {
    return location.pathname === "/" || location.pathname.endsWith("/index.html");
  }

  document.addEventListener("click", function (e) {
    /* Walk up the DOM to find the nearest <a> ancestor */
    const link = e.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || link.target === "_blank") return;

    /* Root-relative link to a hash on the page we're already on:
       just scroll there, no reload needed. */
    if (href.startsWith("/#") && onHomePage()) {
      const target = document.getElementById(href.slice(2));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", href);
        return;
      }
    }

    /* Skip anything that isn't a plain internal page link */
    if (
      href.startsWith("http")    ||
      href.startsWith("//")      ||
      href.startsWith("#")       ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) return;

    e.preventDefault();

    /* Trigger the fade-out animation */
    document.body.classList.add("page-leaving");

    /* Navigate after the animation completes */
    setTimeout(function () {
      window.location.href = href;
    }, FADE_OUT_MS);
  });
})();
