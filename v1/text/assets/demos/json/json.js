/* ============================================================
   JSON DEMO

   A stand-in for json.beehta.com, small enough to sit inside
   the catalogue's preview panel and real enough to be worth
   trying. Registers itself on window.BeehtaDemos under "json",
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
     JSON KIT

     Format, minify, and above all say where a broken one broke.
     The last of those is the reason people open one of these.
  ============================================================ */

  window.BeehtaDemos.json = {
    mount: function (host) {
      var box = root(host, "td-json");

      var area = mk("textarea", "td-area");
      area.spellcheck = false;
      area.setAttribute("aria-label", "JSON");
      area.value = '{"trip":"Kerala","days":4,"stops":["Kochi","Munnar","Alleppey"],"budget":{"stay":18000,"food":6000}}';
      box.appendChild(area);

      var bar = mk("div", "td-actions");
      var fmt = button(bar, "Format");
      var min = button(bar, "Minify", "td-btn--ghost");
      var sample = button(bar, "Sample", "td-btn--ghost");
      box.appendChild(bar);

      var status = mk("p", "td-status");
      box.appendChild(status);

      var stats = mk("dl", "td-rows");
      box.appendChild(stats);

      function depthOf(value) {
        if (value === null || typeof value !== "object") return 0;
        var deepest = 0;
        Object.keys(value).forEach(function (key) {
          var d = depthOf(value[key]);
          if (d > deepest) deepest = d;
        });
        return deepest + 1;
      }

      function countKeys(value) {
        if (value === null || typeof value !== "object") return 0;
        var n = Array.isArray(value) ? 0 : Object.keys(value).length;
        Object.keys(value).forEach(function (key) { n += countKeys(value[key]); });
        return n;
      }

      function parsed() {
        try {
          return { ok: true, value: JSON.parse(area.value) };
        } catch (err) {
          return { ok: false, message: String(err.message || err) };
        }
      }

      function check() {
        var res = parsed();
        stats.textContent = "";

        if (!res.ok) {
          status.textContent = res.message;
          status.className = "td-status is-bad";
          return null;
        }

        status.textContent = "Valid JSON.";
        status.className = "td-status is-ok";

        row("Keys", String(countKeys(res.value)));
        row("Depth", String(depthOf(res.value)));
        row("Characters", String(area.value.length));
        return res.value;
      }

      function row(label, value) {
        stats.appendChild(mk("dt", null, label));
        stats.appendChild(mk("dd", null, value));
      }

      function onFormat() {
        var value = check();
        if (value === null) return;
        area.value = JSON.stringify(value, null, 2);
        check();
      }

      function onMinify() {
        var value = check();
        if (value === null) return;
        area.value = JSON.stringify(value);
        check();
      }

      function onSample() {
        area.value = JSON.stringify({
          name: "beehta",
          kind: ["page", "app"],
          live: true,
          counts: { pages: 8, apps: 6 }
        }, null, 2);
        check();
      }

      fmt.addEventListener("click", onFormat);
      min.addEventListener("click", onMinify);
      sample.addEventListener("click", onSample);
      area.addEventListener("input", check);
      check();

      return function () {
        fmt.removeEventListener("click", onFormat);
        min.removeEventListener("click", onMinify);
        sample.removeEventListener("click", onSample);
        area.removeEventListener("input", check);
        host.textContent = "";
      };
    }
  };

})();
