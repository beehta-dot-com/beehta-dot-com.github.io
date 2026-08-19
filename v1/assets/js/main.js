/* ============================================================
   MAIN.JS - Render engine for the landing page

   Depends on: data.js (must be loaded before this file)
============================================================ */

/* ── Helpers ────────────────────────────────────────────── */

/**
 * Returns the badge/text style for a given category name.
 * Falls back to a neutral grey if the category is not in CATEGORY_STYLES.
 */
function catStyle(cat) {
  return CATEGORY_STYLES[cat] || { bg: "#F0F0F5", color: "#555555" };
}

/**
 * Converts a numeric rating string into filled star characters.
 * e.g. "4.5" → "★★★★½"
 */
// function starsHTML(rating) {
//   const r    = parseFloat(rating);
//   const full = Math.floor(r);
//   let s      = "★".repeat(full);
//   if (r % 1 >= 0.5) s += "½";
//   return s;
// }

/**
 * Returns a deduplicated, sorted array of all categories
 * found in the APPS array, prefixed with "All".
 */
function getCategories() {
  return ["All", ...[...new Set(APPS.map(a => a.category))].sort()];
}

/* ── Filter Pills ───────────────────────────────────────── */

/**
 * Builds the category filter pill row from the APPS data
 * and attaches click handlers.
 */
function renderFilters() {
  const row = document.getElementById("filterRow");
  row.innerHTML = getCategories()
    .map(c => `<button class="pill${c === "All" ? " active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");

  row.querySelectorAll(".pill").forEach(btn =>
    btn.addEventListener("click", () => {
      row.querySelectorAll(".pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderApps();
    })
  );
}

/**
 * Returns the currently selected category label.
 */
function activeCategory() {
  const el = document.querySelector(".pill.active");
  return el ? el.dataset.cat : "All";
}

/* ── App Grid ───────────────────────────────────────────── */

/**
 * Filters the APPS array by active category and search query,
 * then re-renders the grid. Called on every filter/search change.
 */
function renderApps() {
  const query    = document.getElementById("searchInput").value.toLowerCase().trim();
  const category = activeCategory();

  const filtered = APPS.filter(app => {
    const matchCat = category === "All" || app.category === category;
    const matchSearch = !query
      || app.name.toLowerCase().includes(query)
      || app.tagline.toLowerCase().includes(query)
      || app.description.toLowerCase().includes(query)
      || app.category.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  /* Update section label */
  document.getElementById("sectionTitle").textContent =
    category === "All" ? "All Apps" : category;
  document.getElementById("sectionCount").textContent =
    `${filtered.length} app${filtered.length !== 1 ? "s" : ""}`;

  const grid = document.getElementById("appsGrid");

  /* Empty state */
  if (!filtered.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">No apps found</div>
        <div class="empty-sub">Try a different search term or category.</div>
      </div>`;
    return;
  }

  /* Build card HTML */
  grid.innerHTML = filtered.map((app, i) => {
    const cs         = catStyle(app.category);
    // const badge      = app.isFeatured
    //   ? `<span class="badge-featured">Featured</span>`
    //   : app.isNew
    //     ? `<span class="badge-new">New</span>`
    //     : "";
    const isExternal = app.url && app.url !== "#";

    return `
      <a class="app-card"
         href="${app.url}"
         ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''}
         style="--card-accent:${app.iconColor}; animation-delay:${(i * 0.04).toFixed(2)}s;">
        
        <div class="card-top">
          <div class="app-icon" style="background:${app.color};">${app.logo}</div>
          <div class="app-info">
            <div class="app-name">${app.name}</div>
            <div class="app-tagline">${app.tagline}</div>
            <span class="cat-pill" style="background:${cs.bg}; color:${cs.color};">${app.category}</span>
          </div>
        </div>
        <div class="app-desc">${app.description}</div>
        <div class="card-bottom">
          
          <button class="open-btn"
            onclick="event.preventDefault(); ${isExternal ? `window.open('${app.url}', '_blank', 'noopener,noreferrer')` : 'void(0)'}">
            Open
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
          </button>
        </div>
      </a>`;
  }).join("");
}

/* ── Initialise ─────────────────────────────────────────── */
(function init() {
  /* Set dynamic values */
  document.getElementById("copYear").textContent    = new Date().getFullYear();
  document.getElementById("headerPill").textContent = `${APPS.length} Apps`;

  /* Build UI */
  renderFilters();
  renderApps();

  /* Live search */
  document.getElementById("searchInput").addEventListener("input", renderApps);
})();
