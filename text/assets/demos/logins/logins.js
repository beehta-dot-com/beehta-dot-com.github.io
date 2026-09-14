/* ============================================================
   LOGINS DEMO

   A stand-in for logins.beehta.com, small enough to sit inside
   the catalogue's preview panel. It shows the one idea the real
   app is built on: everything is a card, and cards link to each
   other, so you can see what a single account is holding up.

   Self-contained on purpose. One CSS file, this file, no shared
   helpers, so it can be copied into the Logins landing repo as
   is. The only outside contract is registering itself on
   window.BeehtaDemos.

   The data is made up. There are no real accounts here, and the
   real app never stores a password either.
============================================================ */

window.BeehtaDemos = window.BeehtaDemos || {};

window.BeehtaDemos.logins = (function () {
  "use strict";

  var CARDS = [
    { id: "mail",    kind: "Email",     name: "Personal email", detail: "you@example.com",    edge: "#c98a5e", links: ["netflix", "spotify", "github", "bank"] },
    { id: "phone",   kind: "Phone",     name: "Mobile number",  detail: "SIM, since 2019",    edge: "#7a9a6b", links: ["bank", "netflix"] },
    { id: "netflix", kind: "Streaming", name: "Netflix",        detail: "Signs in with email", edge: "#c0574a", links: ["mail", "phone"] },
    { id: "spotify", kind: "Streaming", name: "Spotify",        detail: "Signs in with email", edge: "#6f8f7a", links: ["mail"] },
    { id: "github",  kind: "Work",      name: "GitHub",         detail: "Signs in with email", edge: "#5d7a92", links: ["mail"] },
    { id: "bank",    kind: "Money",     name: "Bank account",   detail: "Alerts to mobile",    edge: "#8d7aa3", links: ["mail", "phone"] }
  ];

  function byId(id) {
    for (var i = 0; i < CARDS.length; i++) {
      if (CARDS[i].id === id) return CARDS[i];
    }
    return null;
  }

  function mount(host) {
    var view = "cards";
    var selected = "mail";

    var root = document.createElement("div");
    root.className = "logins-demo";
    host.appendChild(root);

    /* ---------- toolbar ---------- */

    var bar = document.createElement("div");
    bar.className = "ld-bar";

    var views = document.createElement("div");
    views.className = "ld-views";
    views.setAttribute("role", "group");
    views.setAttribute("aria-label", "View");

    var cardsBtn = viewButton("Cards", "cards");
    var chainsBtn = viewButton("Chains", "chains");
    views.appendChild(cardsBtn);
    views.appendChild(chainsBtn);

    var hint = document.createElement("span");
    hint.className = "ld-hint";
    hint.textContent = "Pick a card to see what it holds up.";

    bar.appendChild(views);
    bar.appendChild(hint);
    root.appendChild(bar);

    var body = document.createElement("div");
    root.appendChild(body);

    var summary = document.createElement("p");
    summary.className = "ld-summary";
    root.appendChild(summary);

    function viewButton(label, name) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = label;
      btn.setAttribute("aria-pressed", String(view === name));
      btn.addEventListener("click", function () {
        view = name;
        draw();
      });
      return btn;
    }

    /* ---------- card element ---------- */

    function cardEl(card, interactive) {
      var el = document.createElement(interactive ? "button" : "div");
      el.className = "ld-card";
      el.style.borderLeftColor = card.edge;

      if (interactive) {
        el.type = "button";
        el.setAttribute("aria-pressed", String(card.id === selected));
        el.addEventListener("click", function () {
          selected = card.id;
          draw();
        });
      }

      var kind = document.createElement("div");
      kind.className = "ld-kind";
      kind.textContent = card.kind;

      var name = document.createElement("div");
      name.className = "ld-name";
      name.textContent = card.name;

      var detail = document.createElement("div");
      detail.className = "ld-detail";
      detail.textContent = card.detail;

      el.appendChild(kind);
      el.appendChild(name);
      el.appendChild(detail);
      return el;
    }

    /* ---------- views ---------- */

    function drawCards() {
      var grid = document.createElement("div");
      grid.className = "ld-grid";

      var chosen = byId(selected);

      CARDS.forEach(function (card) {
        var el = cardEl(card, true);
        if (card.id !== selected) {
          if (chosen && chosen.links.indexOf(card.id) !== -1) el.classList.add("is-linked");
          else el.classList.add("is-faded");
        }
        grid.appendChild(el);
      });

      body.appendChild(grid);
    }

    function drawChains() {
      var chosen = byId(selected);
      if (!chosen) return;

      var wrap = document.createElement("div");
      wrap.className = "ld-chain";

      var root_ = document.createElement("div");
      root_.className = "ld-root";
      root_.style.borderLeftColor = chosen.edge;

      var kind = document.createElement("div");
      kind.className = "ld-kind";
      kind.textContent = chosen.kind;
      var name = document.createElement("div");
      name.className = "ld-name";
      name.textContent = chosen.name;
      var detail = document.createElement("div");
      detail.className = "ld-detail";
      detail.textContent = chosen.detail;
      root_.appendChild(kind);
      root_.appendChild(name);
      root_.appendChild(detail);
      wrap.appendChild(root_);

      if (chosen.links.length) {
        var branches = document.createElement("ul");
        branches.className = "ld-branches";
        chosen.links.forEach(function (id) {
          var card = byId(id);
          if (!card) return;
          var li = document.createElement("li");
          li.className = "ld-branch";
          li.appendChild(cardEl(card, true));
          branches.appendChild(li);
        });
        wrap.appendChild(branches);
      } else {
        var none = document.createElement("div");
        none.className = "ld-none";
        none.textContent = "Nothing else depends on this one.";
        wrap.appendChild(none);
      }

      body.appendChild(wrap);
    }

    /* ---------- draw ---------- */

    function draw() {
      cardsBtn.setAttribute("aria-pressed", String(view === "cards"));
      chainsBtn.setAttribute("aria-pressed", String(view === "chains"));

      body.textContent = "";
      if (view === "cards") drawCards();
      else drawChains();

      var chosen = byId(selected);
      var count = chosen ? chosen.links.length : 0;

      summary.textContent = "";
      var strong = document.createElement("strong");
      strong.textContent = chosen ? chosen.name : "";
      summary.appendChild(strong);
      summary.appendChild(document.createTextNode(
        count === 0
          ? " stands on its own."
          : count === 1
            ? " is tied to 1 other card. Lose it and that one is affected."
            : " is tied to " + count + " other cards. Lose it and all of them are affected."
      ));
    }

    draw();

    // Nothing is held outside this element, so tearing down is
    // just emptying it.
    return function () { host.textContent = ""; };
  }

  return { mount: mount };
})();
