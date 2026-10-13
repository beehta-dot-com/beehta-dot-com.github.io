/* ============================================================
   NUMEROLOGY DEMO

   A stand-in for numerology.beehta.com, small enough to sit inside
   the catalogue's preview panel and real enough to be worth
   trying. Registers itself on window.BeehtaDemos under "numerology",
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

})();
