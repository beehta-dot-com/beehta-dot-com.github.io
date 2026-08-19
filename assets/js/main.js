/* ============================================================
   MAIN.JS
   Render engine for the application catalogue.
   Depends on data.js (must load first).
============================================================ */

/* ── Status labels ──────────────────────────────────────── */
const STATUS_LABEL = {
  active:      "Active",
  beta:        "Beta",
  maintenance: "Maintenance",
  archived:    "Archived",
  private:     "Private",
  soon:        "Coming soon",
};

function catColor(cat) {
  return (CATEGORY_STYLES[cat] || { color: "#6D6A65" }).color;
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
      renderApps();
    })
  );
}

function activeCategory() {
  const el = document.querySelector(".pill.is-active");
  return el ? el.dataset.cat : "All";
}

/* ── Preview panel markup ───────────────────────────────── */
function previewPanel(app) {
  const hasThumb = !!app.thumbnail;
  const canEmbed = app.allowEmbed && !!app.demoUrl;

  let body;

  if (canEmbed) {
    /* Thumbnail (or icon placeholder) sits under a scrim with a
       button to lazy-load the real iframe, so nothing embeds
       until the person asks for it. */
    const backdrop = hasThumb
      ? `<img class="preview-thumb" src="${app.thumbnail}" alt="${app.name} preview" loading="lazy" />`
      : `<div class="preview-fallback">
           <div class="preview-fallback-icon" style="background:${app.color};">${app.logo}</div>
         </div>`;
    body = `
      ${backdrop}
      <div class="browser-overlay">
        <button class="btn-load-demo" data-load-demo="${app.id}">Load live demo</button>
        ${app.demoUrl ? `<a class="btn-open-demo" href="${app.demoUrl}" target="_blank" rel="noopener noreferrer">Open in new tab</a>` : ""}
      </div>`;
  } else {
    /* No known embeddable demo: one clean fallback state, no scrim. */
    body = `
      <div class="preview-fallback">
        <div class="preview-fallback-icon" style="background:${app.color};">${app.logo}</div>
        <p class="preview-fallback-text">Preview unavailable</p>
        ${app.demoUrl ? `<a class="btn-open-demo" href="${app.demoUrl}" target="_blank" rel="noopener noreferrer">Open demo</a>` : ""}
      </div>`;
  }

  return `
    <div class="browser-frame" data-app-id="${app.id}">
      <div class="browser-bar">
        <span class="browser-dot" aria-hidden="true"></span>
        <span class="browser-url mono">${app.demoUrl ? app.demoUrl.replace(/^https?:\/\//, "") : app.subdomain}</span>
      </div>
      <div class="browser-body" data-state="${canEmbed ? "idle" : "unavailable"}">
        ${body}
      </div>
    </div>`;
}

/* ── App rows ───────────────────────────────────────────── */
function renderApps() {
  const query    = document.getElementById("searchInput").value.toLowerCase().trim();
  const category = activeCategory();

  const filtered = APPS
    .filter(a => a.visible)
    .filter(app => {
      const matchCat = category === "All" || app.category === category;
      const haystack = [app.name, app.tagline, app.description, app.category, ...(app.tags || [])]
        .join(" ").toLowerCase();
      const matchSearch = !query || haystack.includes(query);
      return matchCat && matchSearch;
    })
    .sort((a, b) => (b.featured - a.featured) || (a.sortOrder - b.sortOrder));

  document.getElementById("sectionTitle").textContent =
    category === "All" ? "Applications" : category;
  document.getElementById("sectionCount").textContent =
    `${filtered.length} app${filtered.length !== 1 ? "s" : ""}`;

  const list = document.getElementById("appsList");

  if (!filtered.length) {
    list.innerHTML = `
      <div class="empty-state">
        <p class="empty-title">No applications found</p>
        <p class="empty-sub">Try a different search term or category.</p>
        <button class="btn-secondary" id="clearFiltersBtn">Clear filters</button>
      </div>`;
    const clearBtn = document.getElementById("clearFiltersBtn");
    if (clearBtn) clearBtn.addEventListener("click", () => {
      document.getElementById("searchInput").value = "";
      document.querySelectorAll(".pill").forEach(b => b.classList.remove("is-active"));
      document.querySelector('.pill[data-cat="All"]').classList.add("is-active");
      renderApps();
    });
    return;
  }

  list.innerHTML = filtered.map(app => {
    const statusClass = `status-${app.status}`;
    const statusLabel = STATUS_LABEL[app.status] || app.status;
    const updated = formatUpdated(app.updatedDate);

    return `
      <article class="app-row${app.featured ? " is-featured" : ""}" role="listitem">
        <div class="row-main">
          <div class="row-icon" style="background:${app.color};">${app.logo}</div>
          <div class="row-identity">
            <div class="row-name-line">
              <h3 class="row-name">${app.name}</h3>
              ${app.version ? `<span class="row-version mono">v${app.version}</span>` : ""}
              ${app.featured ? `<span class="row-featured-tag">Featured</span>` : ""}
            </div>
            <p class="row-tagline">${app.tagline}</p>
            <p class="row-desc">${app.description}</p>
            <div class="row-meta">
              <span class="cat-tag" style="color:${catColor(app.category)};">${app.category}</span>
              <span class="row-status ${statusClass}"><span class="status-dot"></span>${statusLabel}</span>
              <span class="row-subdomain mono">${app.subdomain}</span>
              ${updated ? `<span class="row-updated">${updated}</span>` : ""}
            </div>
            <div class="row-actions">
              <a class="btn-primary" href="${app.url}" target="_blank" rel="noopener noreferrer">Open application</a>
              ${app.demoUrl ? `<button class="btn-secondary preview-toggle" data-toggle="${app.id}" aria-expanded="false">View demo</button>` : ""}
            </div>
          </div>
        </div>
        <div class="row-preview" id="preview-${app.id}" hidden>
          ${previewPanel(app)}
        </div>
      </article>`;
  }).join("");

  attachRowHandlers();
}

/* ── Interaction: expand/collapse preview, lazy-load iframe ── */
function attachRowHandlers() {
  document.querySelectorAll(".preview-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.toggle;
      const panel = document.getElementById(`preview-${id}`);
      const isOpen = !panel.hidden;
      panel.hidden = isOpen;
      btn.setAttribute("aria-expanded", String(!isOpen));
      btn.textContent = isOpen ? "View demo" : "Hide demo";
    });
  });

  document.querySelectorAll("[data-load-demo]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id   = btn.dataset.loadDemo;
      const app  = APPS.find(a => String(a.id) === String(id));
      const body = btn.closest(".browser-body");
      if (!app || !body) return;

      body.dataset.state = "loading";
      const iframe = document.createElement("iframe");
      iframe.src = app.demoUrl;
      iframe.title = `${app.name} live demo`;
      iframe.loading = "lazy";
      iframe.className = "preview-iframe";

      let settled = false;
      iframe.addEventListener("load", () => {
        settled = true;
        body.dataset.state = "loaded";
      });

      body.querySelector(".preview-fallback, .preview-thumb")?.remove();
      body.querySelector(".browser-overlay")?.remove();
      body.appendChild(iframe);

      /* Some hosts block embedding without firing an error event
         (X-Frame-Options / frame-ancestors just render blank).
         Fall back gracefully if nothing loaded in a reasonable window. */
      setTimeout(() => {
        if (!settled) body.dataset.state = "blocked";
      }, 4000);
    });
  });
}

/* ── Search shortcut (Ctrl/Cmd+K) ───────────────────────── */
function initSearchShortcut() {
  const input = document.getElementById("searchInput");
  document.addEventListener("keydown", e => {
    const isCombo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
    if (isCombo) {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });
}

/* ── Initialise ─────────────────────────────────────────── */
(function init() {
  const visibleCount = APPS.filter(a => a.visible).length;
  document.getElementById("copYear").textContent = new Date().getFullYear();
  document.getElementById("headerCount").textContent = `${visibleCount} apps`;

  renderFilters();
  renderApps();
  initSearchShortcut();

  document.getElementById("searchInput").addEventListener("input", renderApps);
})();
