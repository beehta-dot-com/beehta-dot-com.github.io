/* ============================================================
   PARTIALS.JS
   Single source for the header and footer markup used on every
   page. To change the nav links, footer columns, or copy, edit
   the two template strings below, nothing else needs to change.

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
      <nav class="header-nav" aria-label="Primary">
        <a href="/">Applications</a>
        <a href="/#directory">Categories</a>
        <a href="/contact">Contact</a>
      </nav>
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
    if (el) el.innerHTML = HEADER_HTML;
  }

  function renderFooter() {
    const el = document.getElementById("siteFooter");
    if (el) el.innerHTML = FOOTER_HTML;
    const yearEl = document.getElementById("copYear");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  return { renderHeader, renderFooter };
})();
