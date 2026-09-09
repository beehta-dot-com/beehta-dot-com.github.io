/* ============================================================
   TOOLS DEMOS

   Stand-ins for the five single-purpose pages on the shelf. They
   are in one file because they are one kind of thing: a page with
   a few inputs at the top, an answer underneath, and no state that
   outlives the tab. Splitting them into five folders would be five
   copies of the same forty lines of scaffolding.

   The full apps do not go in here. Logins has its own folder
   because it has its own shape, and so will the next one.

   Each registers itself on window.BeehtaDemos under the id used in
   data.js, and each mount() hands back a teardown. Nothing here
   reads or writes anything outside the element it is given.
============================================================ */

window.BeehtaDemos = window.BeehtaDemos || {};

(function () {
  "use strict";

  /* ---------- the scaffolding all five share ---------- */

  function mk(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function root(host, extra) {
    var box = mk("div", "td" + (extra ? " " + extra : ""));
    host.appendChild(box);
    return box;
  }

  /* A labelled input. Returns the input so the caller can read it
     and bind to it without walking the DOM again. */
  function field(parent, label, value, opts) {
    opts = opts || {};
    var wrap = mk("label", "td-field");
    wrap.appendChild(mk("span", null, label));
    var input = mk("input");
    input.type = opts.type || "text";
    input.value = value;
    if (opts.step) input.step = opts.step;
    if (opts.min != null) input.min = opts.min;
    if (opts.placeholder) input.placeholder = opts.placeholder;
    if (opts.inputmode) input.inputMode = opts.inputmode;
    wrap.appendChild(input);
    parent.appendChild(wrap);
    return input;
  }

  function button(parent, label, cls) {
    var btn = mk("button", "td-btn" + (cls ? " " + cls : ""), label);
    btn.type = "button";
    parent.appendChild(btn);
    return btn;
  }

  function num(input) {
    var v = parseFloat(String(input.value).replace(/,/g, ""));
    return isFinite(v) ? v : 0;
  }

  function money(v) {
    if (!isFinite(v)) return "0.00";
    return v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /* Bind an input to a redraw and hand back a way to unbind. */
  function live(inputs, run) {
    inputs.forEach(function (i) { i.addEventListener("input", run); });
    run();
    return function () {
      inputs.forEach(function (i) { i.removeEventListener("input", run); });
    };
  }


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


  /* ============================================================
     NUMEROLOGY

     Every one of these online shows you a number and not the sum
     behind it. The whole value of a page like this is the working,
     so the working is what it prints.
  ============================================================ */

  window.BeehtaDemos.numerology = {
    mount: function (host) {
      var box = root(host, "td-numerology");

      var top = mk("div", "td-grid");
      var nameIn = field(top, "Full name", "Ada Lovelace");
      var dobIn = field(top, "Date of birth", "1815-12-10", { type: "date" });
      box.appendChild(top);

      var out = mk("div", "td-out");
      box.appendChild(out);

      // Pythagorean: A is 1 through I is 9, then it starts again.
      function letterValue(ch) {
        var code = ch.toUpperCase().charCodeAt(0);
        if (code < 65 || code > 90) return 0;
        return ((code - 65) % 9) + 1;
      }

      // 11, 22 and 33 are left alone by convention, so the steps
      // stop there rather than grinding everything down to one.
      function reduce(n, steps) {
        while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
          var sum = 0, s = String(n);
          for (var i = 0; i < s.length; i++) sum += parseInt(s.charAt(i), 10);
          n = sum;
          steps.push(n);
        }
        return n;
      }

      function run() {
        out.textContent = "";

        var digits = dobIn.value.replace(/\D/g, "");
        if (digits.length >= 8) {
          var dobSum = 0;
          for (var i = 0; i < digits.length; i++) dobSum += parseInt(digits.charAt(i), 10);
          var dobSteps = [dobSum];
          var life = reduce(dobSum, dobSteps);
          out.appendChild(result("Life path", life, digits.split("").join(" plus ") + " is " + dobSum, dobSteps));
        }

        var letters = nameIn.value.replace(/[^A-Za-z]/g, "");
        if (letters.length) {
          var nameSum = 0;
          for (var j = 0; j < letters.length; j++) nameSum += letterValue(letters.charAt(j));
          var nameSteps = [nameSum];
          var expr = reduce(nameSum, nameSteps);

          var working = [];
          for (var k = 0; k < letters.length; k++) {
            working.push(letters.charAt(k).toUpperCase() + " " + letterValue(letters.charAt(k)));
          }
          out.appendChild(result("Expression", expr, working.join(", ") + " is " + nameSum, nameSteps));
        }

        if (!out.childNodes.length) {
          out.appendChild(mk("p", "td-hint", "Type a name or pick a date and the working appears here."));
        }
      }

      function result(label, value, working, steps) {
        var card = mk("div", "td-result");

        var headline = mk("div", "td-headline");
        headline.appendChild(mk("span", "td-label", label));
        headline.appendChild(mk("strong", "td-big", String(value)));
        card.appendChild(headline);

        card.appendChild(mk("p", "td-working", working));
        if (steps.length > 1) {
          card.appendChild(mk("p", "td-working", "then " + steps.join(", then ")));
        }
        return card;
      }

      var off = live([nameIn, dobIn], run);
      return function () { off(); host.textContent = ""; };
    }
  };


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
