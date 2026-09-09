(() => {
  "use strict";

  const state = {
    query: "",
    category: "All",
    filtered: [],
    selectedId: null
  };

  const els = {
    list: document.getElementById("appList"),
    count: document.getElementById("appCount"),
    filters: document.getElementById("categoryFilters"),
    search: document.getElementById("searchInput"),
    title: document.getElementById("demoTitle"),
    description: document.getElementById("demoDescription"),
    open: document.getElementById("openDemo"),
    url: document.getElementById("demoUrl"),
    content: document.getElementById("demoContent"),
    prev: document.getElementById("prevApp"),
    next: document.getElementById("nextApp"),
    mobileName: document.getElementById("mobileAppName"),
    mobilePosition: document.getElementById("mobileAppPosition"),
    mobileNav: document.getElementById("mobileAppNav"),
    footerYear: document.getElementById("footerYear"),
    menuToggle: document.querySelector(".menu-toggle"),
    mobileNavMenu: document.querySelector(".mobile-nav")
  };

  const categories = ["All", ...new Set(BEEHTA_APPS.map(app => app.category))];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[char]));
  }

  function renderFilters() {
    els.filters.innerHTML = categories.map(category => `
      <button type="button"
        class="category-btn ${category === state.category ? "is-active" : ""}"
        data-category="${escapeHtml(category)}">
        ${escapeHtml(category)}
      </button>
    `).join("");
  }

  function getFilteredApps() {
    const q = state.query.trim().toLowerCase();
    return BEEHTA_APPS.filter(app => {
      const categoryMatch = state.category === "All" || app.category === state.category;
      const text = `${app.name} ${app.category} ${app.description}`.toLowerCase();
      return categoryMatch && (!q || text.includes(q));
    });
  }

  function renderList() {
    state.filtered = getFilteredApps();
    els.count.textContent = state.filtered.length;

    if (!state.filtered.length) {
      els.list.innerHTML = `
        <div class="no-results">
          <strong>No applications found.</strong>
          <span>Try another search or category.</span>
        </div>`;
      els.mobileNav.hidden = true;
      return;
    }

    if (!state.filtered.some(app => app.id === state.selectedId)) {
      state.selectedId = state.filtered[0].id;
    }

    els.list.innerHTML = state.filtered.map((app, index) => `
      <button type="button"
        class="app-row ${app.id === state.selectedId ? "is-selected" : ""}"
        data-id="${escapeHtml(app.id)}"
        aria-current="${app.id === state.selectedId ? "true" : "false"}">
        <span class="app-icon">${escapeHtml(app.icon || "•")}</span>
        <span class="app-row-copy">
          <strong>${escapeHtml(app.name)}</strong>
          <small>${escapeHtml(app.description)}</small>
          <em>${escapeHtml(app.category)}</em>
        </span>
        <span class="app-index">${String(index + 1).padStart(2, "0")}</span>
      </button>
    `).join("");

    renderDemo();
  }

  function renderDemo() {
    const index = state.filtered.findIndex(app => app.id === state.selectedId);
    const app = state.filtered[index];
    if (!app) return;

    els.title.textContent = app.name;
    els.description.textContent = app.description;
    els.open.href = app.demo;
    els.open.hidden = false;
    els.url.textContent = app.demo.replace(/^https?:\/\//, "").replace(/\/$/, "");
    els.mobileNav.hidden = false;
    els.mobileName.textContent = app.name;
    els.mobilePosition.textContent = `${index + 1} / ${state.filtered.length}`;
    els.prev.disabled = state.filtered.length < 2;
    els.next.disabled = state.filtered.length < 2;

    if (app.demoType === "image") {
      els.content.innerHTML = `
        <div class="image-demo">
          <img src="${escapeHtml(app.demo)}" alt="${escapeHtml(app.name)} preview">
        </div>`;
    } else {
      els.content.innerHTML = `
        <iframe
          src="${escapeHtml(app.demo)}"
          title="${escapeHtml(app.name)} demo"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          allow="fullscreen"></iframe>
        <div class="iframe-fallback">
          <span>This app does not allow embedded previews.</span>
          <a href="${escapeHtml(app.demo)}" target="_blank" rel="noopener">Open it directly ↗</a>
        </div>`;
    }

    document.querySelectorAll(".app-row").forEach(row => {
      const selected = row.dataset.id === state.selectedId;
      row.classList.toggle("is-selected", selected);
      row.setAttribute("aria-current", selected ? "true" : "false");
    });
  }

  function selectApp(id) {
    if (!state.filtered.some(app => app.id === id)) return;
    state.selectedId = id;
    renderDemo();
    const selected = els.list.querySelector(`[data-id="${CSS.escape(id)}"]`);
    if (selected) selected.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function moveSelection(delta) {
    const current = state.filtered.findIndex(app => app.id === state.selectedId);
    if (current < 0) return;
    const next = (current + delta + state.filtered.length) % state.filtered.length;
    selectApp(state.filtered[next].id);
  }

  els.filters.addEventListener("click", event => {
    const btn = event.target.closest("[data-category]");
    if (!btn) return;
    state.category = btn.dataset.category;
    renderFilters();
    renderList();
  });

  els.list.addEventListener("click", event => {
    const row = event.target.closest("[data-id]");
    if (row) selectApp(row.dataset.id);
  });

  els.search.addEventListener("input", event => {
    state.query = event.target.value;
    renderList();
  });

  els.prev.addEventListener("click", () => moveSelection(-1));
  els.next.addEventListener("click", () => moveSelection(1));

  document.addEventListener("keydown", event => {
    if (event.target.matches("input, textarea, select")) return;
    if (event.key === "ArrowLeft") moveSelection(-1);
    if (event.key === "ArrowRight") moveSelection(1);
  });

  els.menuToggle.addEventListener("click", () => {
    const open = els.menuToggle.getAttribute("aria-expanded") === "true";
    els.menuToggle.setAttribute("aria-expanded", String(!open));
    els.mobileNavMenu.classList.toggle("is-open", !open);
    els.mobileNavMenu.setAttribute("aria-hidden", String(open));
  });

  els.mobileNavMenu.addEventListener("click", () => {
    els.menuToggle.setAttribute("aria-expanded", "false");
    els.mobileNavMenu.classList.remove("is-open");
    els.mobileNavMenu.setAttribute("aria-hidden", "true");
  });

  els.footerYear.textContent = new Date().getFullYear();

  renderFilters();
  renderList();
})();
