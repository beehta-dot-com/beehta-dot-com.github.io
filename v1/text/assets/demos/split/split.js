/* ============================================================
   SPLIT DEMO

   A stand-in for split.beehta.com, small enough to sit inside
   the catalogue's preview panel and real enough to be worth
   trying. Registers itself on window.BeehtaDemos under "split",
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
     SPLIT

     Even splits are arithmetic nobody needs help with. The case
     worth building a page for is the uneven one: everybody shares
     the table, and two people also had the wine.
  ============================================================ */

  window.BeehtaDemos.split = {
    mount: function (host) {
      var box = root(host, "td-split");

      var top = mk("div", "td-grid");
      var total = field(top, "Shared part of the bill", "2400", { type: "number", inputmode: "decimal", min: 0, step: "0.01" });
      var tip = field(top, "Tip, %", "10", { type: "number", inputmode: "decimal", min: 0 });
      box.appendChild(top);

      box.appendChild(mk("p", "td-lede", "Who was there, and what was only theirs"));

      var people = [
        { name: "Asha", extra: 0 },
        { name: "Ben", extra: 450 },
        { name: "Chandra", extra: 0 },
        { name: "Dee", extra: 450 }
      ];

      var rows = mk("div", "td-people");
      box.appendChild(rows);

      var addBtn = button(box, "Add someone", "td-btn--ghost");
      var out = mk("div", "td-out");
      box.appendChild(out);

      function drawPeople() {
        rows.textContent = "";
        people.forEach(function (person, i) {
          var row = mk("div", "td-person");

          var name = mk("input", "td-name");
          name.value = person.name;
          name.setAttribute("aria-label", "Name");
          name.addEventListener("input", function () { person.name = name.value; run(); });

          var extra = mk("input", "td-extra");
          extra.type = "number";
          extra.inputMode = "decimal";
          extra.min = "0";
          extra.value = String(person.extra);
          extra.setAttribute("aria-label", "Only theirs");
          extra.addEventListener("input", function () { person.extra = parseFloat(extra.value) || 0; run(); });

          var drop = mk("button", "td-drop", "Remove");
          drop.type = "button";
          drop.disabled = people.length < 2;
          drop.addEventListener("click", function () {
            people.splice(i, 1);
            drawPeople();
            run();
          });

          row.appendChild(name);
          row.appendChild(extra);
          row.appendChild(drop);
          rows.appendChild(row);
        });
      }

      function run() {
        var shared = num(total);
        var pct = num(tip) / 100;
        var head = people.length || 1;
        var each = shared / head;

        out.textContent = "";

        var dl = mk("dl", "td-rows");
        var grand = 0;

        people.forEach(function (person) {
          var owed = (each + person.extra) * (1 + pct);
          grand += owed;
          dl.appendChild(mk("dt", null, person.name || "Someone"));
          dl.appendChild(mk("dd", null, money(owed)));
        });

        var headline = mk("div", "td-headline");
        headline.appendChild(mk("span", "td-label", "Bill with tip"));
        headline.appendChild(mk("strong", "td-big", money(grand)));
        out.appendChild(headline);
        out.appendChild(dl);
        out.appendChild(mk("p", "td-hint",
          "Everyone covers " + money(each) + " of the shared part, plus whatever was only theirs, plus " +
          num(tip) + "% on top."));
      }

      addBtn.addEventListener("click", function () {
        people.push({ name: "Someone", extra: 0 });
        drawPeople();
        run();
      });

      var off = live([total, tip], run);
      drawPeople();
      run();

      return function () { off(); host.textContent = ""; };
    }
  };

})();
