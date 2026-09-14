/* ============================================================
   DEMO KIT

   The scaffolding every preview on the shelf is built out of: a
   few element helpers, a labelled field, a button, two number
   formatters, and a way to re-run a calculation whenever an input
   changes.

   It is here rather than copied into each demo because all of
   them are the same shape: a few inputs at the top, an answer
   underneath, and no state that outlives the tab.

   A demo is not obliged to use any of it. A demo with its own
   shape, like Logins, ignores this entirely.
============================================================ */

window.BeehtaDemoKit = (function () {
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

  return {
    mk: mk,
    root: root,
    field: field,
    button: button,
    num: num,
    money: money,
    live: live
  };
})();
