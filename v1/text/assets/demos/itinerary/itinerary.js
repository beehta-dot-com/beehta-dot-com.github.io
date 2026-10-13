/* ============================================================
   ITINERARY DEMO

   A stand-in for itinerary.beehta.com, small enough to sit inside
   the catalogue's preview panel and real enough to be worth
   trying. Registers itself on window.BeehtaDemos under "itinerary",
   which is the id data.js points at.

   The scaffolding comes from _kit/kit.js. Everything below is
   particular to this one.
============================================================ */

window.BeehtaDemos = window.BeehtaDemos || {};

(function () {
  "use strict";

  var K = window.BeehtaDemoKit;
  var mk = K.mk, root = K.root, field = K.field, button = K.button;
  var num = K.num, money = K.money, live = K.live;

  /* ============================================================
     ITINERARY

     A trip is a list of days and each day is a list of things in
     an order you keep changing your mind about. So the only two
     controls that matter are add and move.
  ============================================================ */

  window.BeehtaDemos.itinerary = {
    mount: function (host) {
      var box = root(host, "td-itinerary");

      var days = [
        { label: "Day 1", stops: [
          { at: "08:30", what: "Train to Munnar" },
          { at: "13:00", what: "Lunch at the tea estate" },
          { at: "16:00", what: "Check in, walk to the viewpoint" }
        ] },
        { label: "Day 2", stops: [
          { at: "07:00", what: "Sunrise at Top Station" },
          { at: "12:30", what: "Spice plantation" }
        ] },
        { label: "Day 3", stops: [
          { at: "09:00", what: "Drive down to Alleppey" }
        ] }
      ];
      var at = 0;

      var tabs = mk("div", "td-days");
      box.appendChild(tabs);

      var stopsEl = mk("ol", "td-stops");
      box.appendChild(stopsEl);

      var addRow = mk("div", "td-addrow");
      var when = mk("input", "td-when");
      when.type = "time";
      when.value = "18:00";
      when.setAttribute("aria-label", "Time");
      var what = mk("input", "td-what");
      what.placeholder = "What happens";
      what.setAttribute("aria-label", "What happens");
      var addBtn = mk("button", "td-btn", "Add");
      addBtn.type = "button";
      addRow.appendChild(when);
      addRow.appendChild(what);
      addRow.appendChild(addBtn);
      box.appendChild(addRow);

      var foot = mk("div", "td-actions");
      var addDay = mk("button", "td-btn td-btn--ghost", "Add a day");
      addDay.type = "button";
      foot.appendChild(addDay);
      box.appendChild(foot);

      function drawTabs() {
        tabs.textContent = "";
        days.forEach(function (day, i) {
          var btn = mk("button", "td-day", day.label);
          btn.type = "button";
          btn.setAttribute("aria-pressed", String(i === at));
          btn.addEventListener("click", function () { at = i; drawTabs(); drawStops(); });
          tabs.appendChild(btn);
        });
      }

      function drawStops() {
        stopsEl.textContent = "";
        var day = days[at];

        if (!day.stops.length) {
          stopsEl.appendChild(mk("li", "td-empty", "Nothing planned for this day yet."));
          return;
        }

        day.stops.forEach(function (stop, i) {
          var li = mk("li", "td-stop");
          li.appendChild(mk("span", "td-time", stop.at));
          li.appendChild(mk("span", "td-what-text", stop.what));

          var tools = mk("span", "td-stop-tools");
          tool(tools, "Up", i === 0, function () { swap(i, i - 1); });
          tool(tools, "Down", i === day.stops.length - 1, function () { swap(i, i + 1); });
          tool(tools, "Remove", false, function () { day.stops.splice(i, 1); drawStops(); });
          li.appendChild(tools);

          stopsEl.appendChild(li);
        });
      }

      function tool(parent, label, disabled, fn) {
        var btn = mk("button", "td-tool", label);
        btn.type = "button";
        btn.disabled = disabled;
        btn.addEventListener("click", fn);
        parent.appendChild(btn);
      }

      function swap(a, b) {
        var stops = days[at].stops;
        var held = stops[a];
        stops[a] = stops[b];
        stops[b] = held;
        drawStops();
      }

      function onAdd() {
        var text = what.value.trim();
        if (!text) { what.focus(); return; }
        days[at].stops.push({ at: when.value || "12:00", what: text });
        // Kept in time order, because a plan that is not is not a plan.
        days[at].stops.sort(function (x, y) { return x.at < y.at ? -1 : 1; });
        what.value = "";
        drawStops();
      }

      function onAddDay() {
        days.push({ label: "Day " + (days.length + 1), stops: [] });
        at = days.length - 1;
        drawTabs();
        drawStops();
      }

      function onKey(e) { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }

      addBtn.addEventListener("click", onAdd);
      addDay.addEventListener("click", onAddDay);
      what.addEventListener("keydown", onKey);

      drawTabs();
      drawStops();

      return function () {
        addBtn.removeEventListener("click", onAdd);
        addDay.removeEventListener("click", onAddDay);
        what.removeEventListener("keydown", onKey);
        host.textContent = "";
      };
    }
  };

})();
