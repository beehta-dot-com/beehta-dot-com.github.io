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

function renderApps() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  const category = activeCategory();

  const filtered = APPS.filter(a => a.visible).filter(app => {
    const matchCat = category === "All" || app.category === category;
    const haystack = [app.name, app.tagline, app.description, app.category, ...(app.tags || [])].join(" ").toLowerCase();
    return matchCat && (!query || haystack.includes(query));
  }).sort((a, b) => (b.featured - a.featured) || (a.sortOrder - b.sortOrder));

  document.getElementById("sectionTitle").textContent = category === "All" ? "Applications" : category;
  document.getElementById("sectionCount").textContent = `${filtered.length} app${filtered.length !== 1 ? "s" : ""}`;

  const list = document.getElementById("appsList");
  if (!filtered.length) {
    list.innerHTML = `<div class="empty-state"><p class="empty-title">No applications found</p><button class="btn-clear" id="clearFiltersBtn">Clear filters</button></div>`;
    document.getElementById("clearFiltersBtn")?.addEventListener("click", () => {
      document.getElementById("searchInput").value = "";
      document.querySelector('.pill[data-cat="All"]').click();
    });
    return;
  }

  list.innerHTML = filtered.map(app => {
    const statusClass = `status-${app.status}`;
    const statusLabel = STATUS_LABEL[app.status] || app.status;
    const canEmbed = app.allowEmbed && !!app.demoUrl;
    
    // Fallback abstract art utilizing the app's brand color
    const fallbackArt = `<div class="preview-fallback" style="background-color: ${app.color}15;">
        <div style="transform: scale(1.5); opacity: 0.8;">${app.logo}</div>
        ${!canEmbed && app.demoUrl ? `<a class="btn-open-demo" href="${app.demoUrl}" target="_blank">Open demo</a>` : `<p class="preview-fallback-text">Preview unavailable</p>`}
      </div>`;

    return `
      <article class="app-card" role="listitem">
        <a href="${app.url}" target="_blank" class="card-header">
          <div class="row-icon" style="background:${app.color};">${app.logo}</div>
          <div class="row-identity">
            <h3 class="row-name">${app.name} ${app.featured ? `<span class="row-featured-tag">Featured</span>` : ""}</h3>
            <p class="row-tagline">${app.tagline}</p>
          </div>
        </a>
        <div class="browser-frame">
          <div class="browser-bar">
            <span class="browser-dot"></span><span class="browser-dot"></span><span class="browser-dot"></span>
            <span class="browser-url mono" style="margin-left:8px;">${app.demoUrl ? app.demoUrl.replace(/^https?:\/\//, "") : app.subdomain}</span>
          </div>
          <div class="browser-body">
            ${app.thumbnail ? `<img class="preview-thumb" src="${app.thumbnail}" alt="" />` : fallbackArt}
          </div>
        </div>
        <div class="card-footer">
          <p class="row-desc">${app.description}</p>
          <div class="row-meta">
            <span class="cat-tag" style="color:${catColor(app.category)}; background: ${catColor(app.category)}15">${app.category}</span>
            <span class="row-status ${statusClass}"><span class="status-dot"></span>${statusLabel}</span>
          </div>
        </div>
      </article>`;
  }).join("");
}

/* ── Interaction: lazy-load the live demo iframe on request ── */
function attachRowHandlers() {
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
  const searchEl = document.getElementById("searchInput");

  if (!document.getElementById("filterRow") || !document.getElementById("appsList") || !searchEl) {
    console.error(
      "beehta: expected elements (#filterRow, #appsList, #searchInput) were not found. " +
      "This usually means index.html is out of sync with main.js - check that both files " +
      "were deployed from the same version of the site."
    );
    return;
  }

  renderFilters();
  renderApps();
  initSearchShortcut();

  searchEl.addEventListener("input", renderApps);
})();
