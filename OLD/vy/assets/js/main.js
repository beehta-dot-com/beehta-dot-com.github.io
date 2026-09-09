/* ============================================================
   MAIN.JS
   beehta.com, application explorer

   Reads APPS / CATEGORIES from data.js and renders:
   - the desktop two column explorer (list + demo)
   - the mobile carousel
   - the search box and category filter row

   Nothing here needs to change when apps are added. Edit
   data.js instead.
============================================================ */

const ICONS = {
  board: '<path d="M4 4h16v16H4z"/><path d="M9 4v16M15 4v16"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  swap: '<path d="M7 3v14M7 17l-4-4M7 17l4-4M17 21V7M17 7l4 4M17 7l-4 4"/>',
  terminal: '<path d="M4 4h16v16H4z"/><path d="M8 9l3 3-3 3M13 15h4"/>',
  notebook: '<path d="M5 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5z"/><path d="M9 3v18M13 9h5M13 13h5"/>',
  receipt: '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>'
};

function iconSvg(name, size = 18){
  const path = ICONS[name] || ICONS.board;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

(function explorer(){
  const listEl        = document.getElementById("appList");
  const carouselEl     = document.getElementById("appCarousel");
  const carouselLabel  = document.getElementById("carouselLabel");
  const carouselPrev   = document.getElementById("carouselPrev");
  const carouselNext   = document.getElementById("carouselNext");
  const searchInput    = document.getElementById("appSearch");
  const filterRow      = document.getElementById("categoryFilters");
  const demoPanel      = document.getElementById("demoPanel");
  const emptyState     = document.getElementById("explorerEmpty");

  if (!listEl) return; // explorer isn't on this page

  let activeCategory = "All";
  let searchTerm = "";
  let selectedId = APPS[0] ? APPS[0].id : null;

  function getFiltered(){
    const term = searchTerm.trim().toLowerCase();
    return APPS.filter(app => {
      const matchesCategory = activeCategory === "All" || app.category === activeCategory;
      const matchesSearch = !term ||
        app.name.toLowerCase().includes(term) ||
        app.description.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }

  function selectApp(id){
    selectedId = id;
    renderAll();
  }

  function renderList(filtered){
    listEl.innerHTML = "";
    filtered.forEach(app => {
      const isSelected = app.id === selectedId;
      const item = document.createElement("button");
      item.type = "button";
      item.className = "app-item" + (isSelected ? " is-selected" : "");
      item.setAttribute("aria-pressed", String(isSelected));
      item.innerHTML = `
        <span class="app-item-icon">${iconSvg(app.icon)}</span>
        <span class="app-item-body">
          <span class="app-item-name">${app.name}</span>
          <span class="app-item-desc">${app.description}</span>
          <span class="app-item-cat">${app.category}</span>
        </span>
      `;
      item.addEventListener("click", () => selectApp(app.id));
      listEl.appendChild(item);
    });
  }

  function renderCarousel(filtered){
    const idx = Math.max(0, filtered.findIndex(a => a.id === selectedId));
    const current = filtered[idx];

    carouselEl.innerHTML = "";
    if (!current){ carouselLabel.textContent = ""; return; }

    const prevApp = filtered[idx - 1];
    const nextApp = filtered[idx + 1];

    if (prevApp){
      const p = document.createElement("span");
      p.className = "carousel-neighbor";
      p.textContent = prevApp.name;
      carouselEl.appendChild(p);
    }

    const c = document.createElement("span");
    c.className = "carousel-current";
    c.textContent = current.name;
    carouselEl.appendChild(c);

    if (nextApp){
      const n = document.createElement("span");
      n.className = "carousel-neighbor";
      n.textContent = nextApp.name;
      carouselEl.appendChild(n);
    }

    carouselLabel.textContent = `${idx + 1} / ${filtered.length}`;
    carouselPrev.disabled = idx <= 0;
    carouselNext.disabled = idx >= filtered.length - 1;

    carouselPrev.onclick = () => { if (prevApp) selectApp(prevApp.id); };
    carouselNext.onclick = () => { if (nextApp) selectApp(nextApp.id); };
  }

  function renderDemo(filtered){
    const app = filtered.find(a => a.id === selectedId) || filtered[0];

    if (!app){
      demoPanel.style.display = "none";
      emptyState.style.display = "flex";
      return;
    }
    demoPanel.style.display = "flex";
    emptyState.style.display = "none";

    const mediaHtml = app.demo.type === "iframe"
      ? `<iframe src="${app.demo.src}" title="${app.name} live demo" loading="lazy"></iframe>`
      : `<img src="${app.demo.src}" alt="${app.demo.alt || app.name + ' preview'}" />`;

    demoPanel.innerHTML = `
      <div class="demo-chrome">
        <span class="demo-dot"></span>
        <span class="demo-dot"></span>
        <span class="demo-dot"></span>
        <span class="demo-url">${app.name.toLowerCase()}.beehta.com</span>
      </div>
      <div class="demo-media">${mediaHtml}</div>
      <div class="demo-footer">
        <div class="demo-footer-text">
          <span class="demo-app-name">${app.name}</span>
          <span class="demo-app-cat">${app.category}</span>
        </div>
        <a class="demo-open" href="${app.url}" target="_blank" rel="noopener">
          Open application
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9"/></svg>
        </a>
      </div>
    `;
  }

  function renderAll(){
    const filtered = getFiltered();
    if (filtered.length && !filtered.some(a => a.id === selectedId)){
      selectedId = filtered[0].id;
    }
    renderList(filtered);
    renderCarousel(filtered);
    renderDemo(filtered);
  }

  function renderFilters(){
    const cats = ["All", ...CATEGORIES];
    filterRow.innerHTML = "";
    cats.forEach(cat => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-btn" + (cat === activeCategory ? " is-active" : "");
      btn.textContent = cat;
      btn.addEventListener("click", () => {
        activeCategory = cat;
        renderFilters();
        renderAll();
      });
      filterRow.appendChild(btn);
    });
  }

  searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderAll();
  });

  renderFilters();
  renderAll();
})();
