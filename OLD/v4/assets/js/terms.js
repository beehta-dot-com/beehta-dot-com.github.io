/* ============================================================
   TERMS.JS - Accordion behaviour for the policies page
   beehta.com

   • Each .acc-item toggles open/closed independently on click.
   • Jump-nav pills and any #hash link open the matching section
     and smooth-scroll to it, so deep links keep working.
   • The first section is open by default on a fresh visit.
============================================================ */

(function () {

  function openItem(id) {
    const item = document.getElementById(id);
    if (!item || !item.classList.contains("acc-item")) return;
    item.classList.add("is-open");
    const header = item.querySelector(".acc-header");
    if (header) header.setAttribute("aria-expanded", "true");
  }

  function openAndScroll(id) {
    openItem(id);
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function initAccordionToggles() {
    document.querySelectorAll(".acc-header").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".acc-item");
        if (!item) return;
        const isOpen = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(isOpen));
      });
    });
  }

  function initJumpNav() {
    document.querySelectorAll(".jump-link").forEach(link => {
      link.addEventListener("click", e => {
        const href = link.getAttribute("href") || "";
        if (!href.startsWith("#")) return;
        e.preventDefault();
        const id = href.slice(1);
        history.pushState(null, "", href);
        openAndScroll(id);
      });
    });
  }

  function initDefaultState() {
    if (location.hash) {
      const id = location.hash.slice(1);
      /* Wait a tick so layout has settled before measuring scroll position. */
      setTimeout(() => openAndScroll(id), 60);
    } else {
      const first = document.querySelector(".acc-item");
      if (first) openItem(first.id);
    }
  }

  initAccordionToggles();
  initJumpNav();
  initDefaultState();

})();
