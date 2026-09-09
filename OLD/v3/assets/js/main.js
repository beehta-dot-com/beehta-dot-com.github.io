/* ============================================================
   MAIN.JS
   Render engine for the application portal: search, filters,
   the left navigation list, the live preview pane (desktop),
   and the fallback card grid (mobile). Depends on data.js.
============================================================ */

const STATUS_LABEL = {
  active:      "Active",
  beta:        "Beta",
  maintenance: "Maintenance",
  archived:    "Archived",
  private:     "Private",
  soon:        "Coming soon",
};

const DESKTOP_QUERY = "(min-width: 1024px)";

let selectedAppId = null;

function catColor(cat) {
  return (CATEGORY_STYLES[cat] || { color: "#7C8699" }).color;
}

function formatUpdated(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return "";
  const now = new Date();
  const days = Math.floor((now - d) / 86400000);
  if (days < 1) return "Updated today";
  if (days === 1) return "Updated yesterday";
  if (days < 30) return `Updated ${days} days ago`;
  return "Updated " + d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getCategories() {
  const present = [...new Set(APPS.filter(a => a.visible).map(a => a.category))].sort();
  return ["All", ...present];
}

/* ── Filter pills ───────────────────────────────────────── */
function renderFilters() {
  const row = document.getElementById("filterRow");
  row.innerHTML = getCategories()
    .map(c => `<button class="pill${c === "All" ? " is-active" : ""}" data-cat="${c}" role="listitem">${c}</button>`)
    .join("");

  row.querySelectorAll(".pill").forEach(btn =>
    btn.addEventListener("click", () => {
      row.querySelectorAll(".pill").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderAll();
    })
  );
}

function activeCategory() {
  const el = document.querySelector(".pill.is-active");
  return el ? el.dataset.cat : "All";
}

function currentlyFiltered() {
  const query    = document.getElementById("searchInput").value.toLowerCase().trim();
  const category = activeCategory();

  return APPS
    .filter(a => a.visible)
    .filter(app => {
      const matchCat = category === "All" || app.category === category;
      const haystack = [app.name, app.tagline, app.description, app.category, ...(app.tags || [])]
        .join(" ").toLowerCase();
      const matchSearch = !query || haystack.includes(query);
      return matchCat && matchSearch;
    })
    .sort((a, b) => (b.featured - a.featured) || (a.sortOrder - b.sortOrder));
}

/* ── Nav pane (left list) ────────────────────────────────── */
function navItemMarkup(app) {
  const statusClass = `status-${app.status}`;
  const statusLabel = STATUS_LABEL[app.status] || app.status;
  const selected = app.id === selectedAppId;

  return `
    <button class="nav-item${selected ? " is-selected" : ""}" data-app-id="${app.id}" role="listitem"
            aria-pressed="${selected}" aria-label="Preview ${app.name}">
      <div class="nav-item-icon" style="background:${app.color};">${app.logo}</div>
      <div class="nav-item-body">
        <div class="nav-item-top">
          <span class="nav-item-name">${app.name}</span>
          ${app.version ? `<span class="nav-item-version mono">v${app.version}</span>` : ""}
          ${app.featured ? `<span class="nav-item-featured">Featured</span>` : ""}
        </div>
        <p class="nav-item-tagline">${app.tagline}</p>
        <div class="nav-item-meta">
          <span class="nav-cat-tag" style="color:${catColor(app.category)};">${app.category}</span>
          <span class="nav-item-status ${statusClass}"><span class="status-dot"></span>${statusLabel}</span>
          <span class="nav-item-subdomain mono">${app.subdomain}</span>
        </div>
      </div>
    </button>`;
}

function renderNavList(filtered) {
  const list = document.getElementById("appsNavList");
  list.innerHTML = filtered.map(navItemMarkup).join("");

  list.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      selectApp(Number(btn.dataset.appId));
    });
  });
}

/* ── Preview pane (right, desktop only) ─────────────────── */
function iconSvg(name) {
  const icons = {
    reload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
    external: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    expand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`,
    module: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  };
  return icons[name] || "";
}

function renderPreviewPane(app) {
  const pane = document.getElementById("previewPane");

  if (!app) {
    pane.innerHTML = `
      <div class="preview-body" data-state="empty">
        <div class="preview-empty">
          <div class="preview-empty-icon">${iconSvg("module")}</div>
          <p class="preview-empty-title">No application selected</p>
          <p class="preview-empty-sub">Choose one from the list to see it here.</p>
        </div>
      </div>`;
    return;
  }

  const canEmbed = app.allowEmbed && !!app.demoUrl;
  const statusClass = `status-${app.status}`;
  const statusLabel = STATUS_LABEL[app.status] || app.status;
  const updated = formatUpdated(app.updatedDate);

  let bodyInner;
  if (canEmbed) {
    bodyInner = `
      <div class="preview-fallback">
        <div class="preview-fallback-icon" style="background:${app.color};">${app.logo}</div>
        <p class="preview-fallback-title">Ready to preview</p>
        <p class="preview-fallback-sub">Load the live demo from ${app.subdomain}.</p>
        <div class="preview-actions">
          <button class="btn-load-demo" data-load-demo="${app.id}">Load live demo</button>
          <a class="btn-open-demo" href="${app.demoUrl}" target="_blank" rel="noopener noreferrer">Open in new tab</a>
        </div>
      </div>`;
  } else {
    bodyInner = `
      <div class="preview-fallback">
        <div class="preview-fallback-icon" style="background:${app.color};">${app.logo}</div>
        <p class="preview-fallback-title">Preview unavailable</p>
        <p class="preview-fallback-sub">This application does not allow embedded previews.</p>
        ${app.demoUrl ? `<div class="preview-actions"><a class="btn-open-demo" href="${app.demoUrl}" target="_blank" rel="noopener noreferrer">Open demo</a></div>` : ""}
      </div>`;
  }

  pane.innerHTML = `
    <div class="preview-toolbar">
      <button class="preview-toolbar-btn" id="previewReloadBtn" title="Reload preview" ${canEmbed ? "" : "disabled"}>${iconSvg("reload")}</button>
      <span class="preview-toolbar-url mono">${app.demoUrl ? app.demoUrl.replace(/^https?:\/\//, "") : app.subdomain}</span>
      <a class="preview-toolbar-btn" href="${app.demoUrl || app.url}" target="_blank" rel="noopener noreferrer" title="Open in new tab">${iconSvg("external")}</a>
    </div>
    <div class="preview-body" data-state="${canEmbed ? "idle" : "unavailable"}" id="previewBody">
      ${bodyInner}
    </div>
    <div class="preview-status-bar mono">
      <span class="preview-status-live ${statusClass}"><span class="status-dot"></span><strong>${statusLabel}</strong></span>
      ${app.version ? `<span>v${app.version}</span>` : ""}
      <span>${app.subdomain}</span>
      ${updated ? `<span>${updated}</span>` : ""}
    </div>`;

  attachPreviewHandlers(app);
}

function loadPreviewIframe(app) {
  const body = document.getElementById("previewBody");
  if (!body) return;

  body.dataset.state = "loading";
  body.innerHTML = "";

  const iframe = document.createElement("iframe");
  iframe.src = app.demoUrl;
  iframe.title = `${app.name} live demo`;
  iframe.loading = "lazy";
  iframe.className = "preview-iframe";
  iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms");

  let settled = false;
  iframe.addEventListener("load", () => {
    settled = true;
    body.dataset.state = "loaded";
  });

  body.appendChild(iframe);

  /* Some hosts block embedding without firing an error event
     (X-Frame-Options / frame-ancestors just render blank).
     Fall back gracefully if nothing loaded in a reasonable window. */
  setTimeout(() => {
    if (!settled) {
      body.dataset.state = "blocked";
      body.innerHTML = `
        <div class="preview-fallback">
          <div class="preview-fallback-icon" style="background:${app.color};">${app.logo}</div>
          <p class="preview-fallback-title">Preview blocked</p>
          <p class="preview-fallback-sub">This application does not allow embedded previews.</p>
          <div class="preview-actions"><a class="btn-open-demo" href="${app.demoUrl}" target="_blank" rel="noopener noreferrer">Open demo</a></div>
        </div>`;
    }
  }, 4000);
}

function attachPreviewHandlers(app) {
  const loadBtn = document.getElementById("previewReloadBtn");
  if (loadBtn && app.allowEmbed && app.demoUrl) {
    loadBtn.addEventListener("click", () => loadPreviewIframe(app));
  }
  document.querySelectorAll("[data-load-demo]").forEach(btn => {
    btn.addEventListener("click", () => loadPreviewIframe(app));
  });
}

/* ── Mobile card grid ────────────────────────────────────── */
function cardMarkup(app) {
  const statusClass = `status-${app.status}`;
  const statusLabel = STATUS_LABEL[app.status] || app.status;
  const updated = formatUpdated(app.updatedDate);

  return `
    <article class="app-card" role="listitem">
      <div class="app-card-top">
        <div class="app-card-icon" style="background:${app.color};">${app.logo}</div>
        <div>
          <div class="app-card-name-line">
            <span class="app-card-name">${app.name}</span>
            ${app.version ? `<span class="app-card-version mono">v${app.version}</span>` : ""}
          </div>
          <p class="app-card-tagline">${app.tagline}</p>
        </div>
      </div>
      <p class="app-card-desc">${app.description}</p>
      <div class="app-card-meta">
        <span class="nav-cat-tag" style="color:${catColor(app.category)};">${app.category}</span>
        <span class="nav-item-status ${statusClass}"><span class="status-dot"></span>${statusLabel}</span>
        ${updated ? `<span class="nav-item-subdomain">${updated}</span>` : ""}
      </div>
      <div class="app-card-actions">
        <a class="btn-launch-app" href="${app.url}" target="_blank" rel="noopener noreferrer">Launch app</a>
        ${app.demoUrl ? `<a class="btn-view-demo" href="${app.demoUrl}" target="_blank" rel="noopener noreferrer">View demo</a>` : ""}
      </div>
    </article>`;
}

function renderCardGrid(filtered) {
  const grid = document.getElementById("appsCardGrid");
  grid.innerHTML = filtered.map(cardMarkup).join("");
}

/* ── Selection ───────────────────────────────────────────── */
function selectApp(id) {
  selectedAppId = id;
  const filtered = currentlyFiltered();
  renderNavList(filtered);
  renderPreviewPane(APPS.find(a => a.id === id) || null);

  const item = document.querySelector(`.nav-item[data-app-id="${id}"]`);
  if (item) item.scrollIntoView({ block: "nearest" });
}

/* ── Full render ─────────────────────────────────────────── */
function renderAll() {
  const filtered = currentlyFiltered();

  const category = activeCategory();
  document.getElementById("sectionTitle").textContent =
    category === "All" ? "Applications" : category;
  document.getElementById("sectionCount").textContent =
    `${filtered.length} app${filtered.length !== 1 ? "s" : ""}`;

  if (!filtered.length) {
    document.getElementById("appsNavList").innerHTML = "";
    document.getElementById("appsCardGrid").innerHTML = `
      <div class="empty-state">
        <p class="empty-title">No applications found</p>
        <p class="empty-sub">Try a different search term or category.</p>
        <button class="btn-clear" id="clearFiltersBtn">Clear filters</button>
      </div>`;
    renderPreviewPane(null);
    const clearBtn = document.getElementById("clearFiltersBtn");
    if (clearBtn) clearBtn.addEventListener("click", () => {
      document.getElementById("searchInput").value = "";
      document.querySelectorAll(".pill").forEach(b => b.classList.remove("is-active"));
      document.querySelector('.pill[data-cat="All"]').classList.add("is-active");
      renderAll();
    });
    return;
  }

  /* Keep the current selection if it still matches the filter,
     otherwise default to the first visible application. */
  if (!filtered.some(a => a.id === selectedAppId)) {
    selectedAppId = filtered[0].id;
  }

  renderNavList(filtered);
  renderCardGrid(filtered);
  renderPreviewPane(APPS.find(a => a.id === selectedAppId) || null);
}

/* ── Keyboard: Cmd/Ctrl+K to search, arrows to switch preview ── */
function initKeyboardShortcuts() {
  const input = document.getElementById("searchInput");

  document.addEventListener("keydown", e => {
    const isSearchCombo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
    if (isSearchCombo) {
      e.preventDefault();
      input.focus();
      input.select();
      return;
    }

    const typing = document.activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName);
    if (typing) return;
    if (!window.matchMedia(DESKTOP_QUERY).matches) return;
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

    const filtered = currentlyFiltered();
    if (!filtered.length) return;

    e.preventDefault();
    const idx = filtered.findIndex(a => a.id === selectedAppId);
    const nextIdx = e.key === "ArrowDown"
      ? Math.min(filtered.length - 1, idx + 1)
      : Math.max(0, idx - 1);
    selectApp(filtered[nextIdx].id);
  });
}

/* ── Initialise ─────────────────────────────────────────── */
(function init() {
  const searchEl = document.getElementById("searchInput");

  if (!document.getElementById("filterRow") || !document.getElementById("appsNavList") || !searchEl) {
    console.error(
      "beehta: expected elements (#filterRow, #appsNavList, #searchInput) were not found. " +
      "This usually means index.html is out of sync with main.js - check that both files " +
      "were deployed from the same version of the site."
    );
    return;
  }

  renderFilters();
  renderAll();
  initKeyboardShortcuts();

  searchEl.addEventListener("input", renderAll);
})();
