/* ============================================================
   PARTIALS.JS
   Single source for the header and footer markup used on every
   page. To change the footer columns or copy, edit the template
   strings below, nothing else needs to change.

   Usage in each HTML file:
     <header id="siteHeader"></header>
     <script src="assets/js/partials.js"></script>
     <script>Partials.renderHeader();</script>
     ...
     <footer id="siteFooter"></footer>
     <script>Partials.renderFooter();</script>
============================================================ */

const Partials = (function () {

  const HEADER_HTML = `
    <div class="header-inner">
      <a class="brand" href="/">beehta<em>.com</em></a>
      <button class="go-top-btn is-hidden" id="goTopBtn" type="button" aria-label="Go to top of page">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
        <span>Go to top</span>
      </button>
    </div>`;

  const FOOTER_HTML = `
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <a class="footer-brand-name" href="/">beehta<em>.com</em></a>
          <p class="footer-brand-sub">A collection of small applications for everyday digital work.</p>
        </div>
        <div class="footer-cols">
          <div>
            <div class="footer-col-title">Legal</div>
            <div class="footer-col">
              <a href="/terms">Terms &amp; Conditions</a>
              <a href="/terms#disclaimer">Disclaimer</a>
              <a href="/terms#privacy">Privacy Policy</a>
              <a href="/terms#cookies">Cookie Policy</a>
            </div>
          </div>
          <div>
            <div class="footer-col-title">Connect</div>
            <div class="footer-col">
              <a href="/contact">Contact us</a>
              <a href="/">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Back to apps
              </a>
            </div>
          </div>
        </div>
      </div>
      <hr class="footer-divider" />
      <div class="footer-bottom">
        <p class="footer-copy">&copy; <span id="copYear"></span> beehta.com. All rights reserved.</p>
      </div>
    </div>`;

  function renderHeader() {
    const el = document.getElementById("siteHeader");
    if (!el) return;
    el.innerHTML = HEADER_HTML;

    const btn = document.getElementById("goTopBtn");
    if (!btn) return;

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    /* Only show the button once the page has scrolled a bit,
       so it isn't a redundant "go to top" while already there. */
    const toggle = () => {
      if (window.scrollY > 200) btn.classList.remove("is-hidden");
      else btn.classList.add("is-hidden");
    };
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
  }

  function renderFooter() {
    const el = document.getElementById("siteFooter");
    if (el) el.innerHTML = FOOTER_HTML;
    const yearEl = document.getElementById("copYear");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  return { renderHeader, renderFooter };
})();
