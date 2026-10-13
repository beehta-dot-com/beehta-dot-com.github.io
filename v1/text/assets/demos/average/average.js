/* ============================================================
   AVERAGE DEMO

   A stand-in for average.beehta.com, small enough to sit inside
   the catalogue's preview panel and real enough to be worth
   trying. Registers itself on window.BeehtaDemos under "average",
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
     AVERAGE DOWN

     You hold something at one price, you buy more at a lower one,
     and the question is always the same two things: what is the
     new average, and how far does the price have to come back
     before you are level.
  ============================================================ */

  window.BeehtaDemos.average = {
    mount: function (host) {
      var box = root(host, "td-average");

      box.appendChild(mk("p", "td-lede", "What you hold now"));
      var now = mk("div", "td-grid");
      var heldQty = field(now, "Units", "100", { type: "number", inputmode: "decimal", min: 0 });
      var heldAvg = field(now, "Average price", "250", { type: "number", inputmode: "decimal", min: 0, step: "0.01" });
      box.appendChild(now);

      box.appendChild(mk("p", "td-lede", "What you are about to buy"));
      var add = mk("div", "td-grid");
      var addQty = field(add, "Units", "150", { type: "number", inputmode: "decimal", min: 0 });
      var addPx = field(add, "Price", "180", { type: "number", inputmode: "decimal", min: 0, step: "0.01" });
      box.appendChild(add);

      var out = mk("div", "td-out");
      box.appendChild(out);

      var inputs = [heldQty, heldAvg, addQty, addPx];

      function run() {
        var q1 = num(heldQty), p1 = num(heldAvg);
        var q2 = num(addQty), p2 = num(addPx);
        var qty = q1 + q2;
        var cost = q1 * p1 + q2 * p2;
        var avg = qty > 0 ? cost / qty : 0;

        out.textContent = "";

        if (qty <= 0) {
          out.appendChild(mk("p", "td-hint", "Put a number of units in and the answer appears here."));
          return;
        }

        var headline = mk("div", "td-headline");
        headline.appendChild(mk("span", "td-label", "New average price"));
        headline.appendChild(mk("strong", "td-big", money(avg)));
        out.appendChild(headline);

        var rows = mk("dl", "td-rows");
        addRow(rows, "Units after the buy", money(qty));
        addRow(rows, "Total put in", money(cost));
        addRow(rows, "Was", money(p1));
        addRow(rows, "Moved by", (p1 ? ((avg - p1) / p1 * 100).toFixed(2) : "0.00") + "%");
        out.appendChild(rows);

        // The bar is the point of the page: the old average, the
        // new one, and the price you just paid, to the same scale.
        var top = Math.max(p1, p2, avg) || 1;
        var bars = mk("div", "td-bars");
        bar(bars, "Old average", p1, top, "#c0574a");
        bar(bars, "New average", avg, top, "#3f7d4e");
        bar(bars, "Price paid", p2, top, "#5d7a92");
        out.appendChild(bars);

        var gap = avg - p2;
        var back = p2 > 0 ? (gap / p2 * 100) : 0;
        out.appendChild(mk("p", "td-hint",
          gap <= 0
            ? "You are already above the new average at that price."
            : "From " + money(p2) + " the price has to rise " + back.toFixed(2) +
              "% to reach the new average."));
      }

      function addRow(dl, label, value) {
        dl.appendChild(mk("dt", null, label));
        dl.appendChild(mk("dd", null, value));
      }

      function bar(parent, label, value, top, colour) {
        var row = mk("div", "td-bar");
        row.appendChild(mk("span", "td-bar-label", label));
        var track = mk("span", "td-bar-track");
        var fill = mk("span", "td-bar-fill");
        fill.style.width = Math.max(2, (value / top) * 100) + "%";
        fill.style.backgroundColor = colour;
        track.appendChild(fill);
        row.appendChild(track);
        row.appendChild(mk("span", "td-bar-value", money(value)));
        parent.appendChild(row);
      }

      var off = live(inputs, run);
      return function () { off(); host.textContent = ""; };
    }
  };

})();
