// ... [Keep existing formatUpdated and getCategories functions] ...

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
// ... [Keep existing init logic] ...