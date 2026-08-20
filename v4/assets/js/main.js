/* ============================================================
   MAIN.JS
   Render engine for the application directory (masonry cards).
   Depends on data.js (must load first).
============================================================ */

const STATUS_LABEL = {
  active:      "Active",
  beta:        "Beta",
  maintenance: "Maintenance",
  archived:    "Archived",
  private:     "Private",
  soon:        "Coming soon",
};

function catColor(cat) {
  return (CATEGORY_STYLES[cat] || { color: "#8A7F98" }).color;
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

/* ── Card markup ─────────────────────────────────────────── */
function cardMarkup(app) {
  const statusClass = `status-${app.status}`;
  const statusLabel = STATUS_LABEL[app.status] || app.status;
  const updated = formatUpdated(app.updatedDate);

  return `
    <article class="app-card${app.featured ? " is-featured" : ""}" role="listitem">
      <div class="card-illustration" style="background:${app.color};">
        <div class="card-blob" style="background:${app.iconColor}22;"></div>
        <svg class="card-icon" viewBox="0 0 38 38">${app.logo.replace(/<svg[^>]*>|<\/svg>/g, "")}</svg>
        ${app.featured ? `<span class="card-featured-tag">Featured</span>` : ""}
      </div>
      <div class="card-body">
        <div class="card-name-line">
          <a class="card-name" href="${app.url}" target="_blank" rel="noopener noreferrer">${app.name}</a>
          ${app.version ? `<span class="card-version mono">v${app.version}</span>` : ""}
        </div>
        <p class="card-tagline">${app.tagline}</p>
        <p class="card-desc">${app.description}</p>
        <div class="card-meta">
          <span class="cat-tag" style="color:${catColor(app.category)};">${app.category}</span>
          <span class="card-status ${statusClass}"><span class="status-dot"></span>${statusLabel}</span>
          <span class="card-subdomain mono">${app.subdomain}</span>
          ${updated ? `<span class="card-updated">${updated}</span>` : ""}
        </div>
        <div class="card-actions">
          <a class="btn-launch" href="${app.url}" target="_blank" rel="noopener noreferrer">Launch app</a>
          ${app.demoUrl ? `<a class="btn-demo" href="${app.demoUrl}" target="_blank" rel="noopener noreferrer">Demo</a>` : ""}
        </div>
      </div>
    </article>`;
}

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

  const grid = document.getElementById("appsGrid");

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <p class="empty-title">No applications found</p>
        <p class="empty-sub">Try a different search term or category.</p>
        <button class="btn-clear" id="clearFiltersBtn">Clear filters</button>
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

  grid.innerHTML = filtered.map(cardMarkup).join("");
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

  if (!document.getElementById("filterRow") || !document.getElementById("appsGrid") || !searchEl) {
    console.error(
      "beehta: expected elements (#filterRow, #appsGrid, #searchInput) were not found. " +
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
