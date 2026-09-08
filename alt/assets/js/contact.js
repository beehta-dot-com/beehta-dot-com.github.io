/* ============================================================
   CONTACT.JS

   Validates the contact form and posts it to a relay.

   Nothing is wired up yet. Set ENDPOINT below to your Formspree
   or FormSubmit address and the form starts sending. Until then
   it validates normally and then says plainly that sending is not
   switched on, rather than pretending a message went somewhere.

   Before switching it on, read the two notes in the project
   context about Turnstile: the widget needs frame-src and a
   script host allowed in the CSP, and a widget with no
   server-side token check is decoration. Anyone can post to the
   relay directly. The token has to be verified somewhere that
   runs code, which for beehta.com means a Cloudflare Worker.
============================================================ */

var ENDPOINT = "";   /* e.g. "https://formspree.io/f/xxxxxxxx" */

/* router.js owns this object but loads last, so every page
   script that registers a hook has to be able to create it. */
window.beehtaPages = window.beehtaPages || {};

window.beehtaPages.contact = function (root) {
  "use strict";

  var form = root.querySelector("#contactForm");
  if (!form) return;

  var status = root.querySelector("#formStatus");
  var submit = form.querySelector('button[type="submit"]');

  var RULES = {
    name: function (v) {
      if (!v.trim()) return "Please tell us what to call you.";
      return "";
    },
    email: function (v) {
      if (!v.trim()) return "We need an address to reply to.";
      // Deliberately loose. The only real test of an address is
      // sending to it, and a strict pattern rejects valid ones.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return "That does not look like an email address.";
      return "";
    },
    message: function (v) {
      if (v.trim().length < 10) return "A little more detail would help.";
      return "";
    }
  };

  function fieldOf(input) { return input.closest(".field"); }

  function check(input) {
    var rule = RULES[input.name];
    if (!rule) return true;

    var problem = rule(input.value);
    var field = fieldOf(input);
    var slot = field && field.querySelector(".error");

    if (problem) {
      field.classList.add("has-error");
      input.setAttribute("aria-invalid", "true");
      if (slot) slot.textContent = problem;
      return false;
    }

    field.classList.remove("has-error");
    input.removeAttribute("aria-invalid");
    if (slot) slot.textContent = "";
    return true;
  }

  function say(message, ok) {
    if (!status) return;
    status.textContent = message;
    status.className = "form-status " + (ok ? "is-ok" : "is-bad");
    status.hidden = false;
  }

  var inputs = form.querySelectorAll("input[name], textarea[name]");

  for (var i = 0; i < inputs.length; i++) {
    (function (input) {
      // Only nag after the field has been left once. Complaining
      // while somebody is still typing their address is rude.
      input.addEventListener("blur", function () { check(input); });
      input.addEventListener("input", function () {
        if (fieldOf(input).classList.contains("has-error")) check(input);
      });
    })(inputs[i]);
  }

  function onSubmit(e) {
    e.preventDefault();

    var ok = true;
    var firstBad = null;

    for (var j = 0; j < inputs.length; j++) {
      if (!check(inputs[j])) {
        ok = false;
        if (!firstBad) firstBad = inputs[j];
      }
    }

    if (!ok) {
      say("Have another look at the highlighted boxes.", false);
      if (firstBad) firstBad.focus();
      return;
    }

    if (!ENDPOINT) {
      say("The form checks out, but sending is not switched on yet. Set ENDPOINT in assets/js/contact.js first.", false);
      return;
    }

    submit.disabled = true;
    var label = submit.textContent;
    submit.textContent = "Sending";

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: new FormData(form)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        say("Thanks. We have it, and we will reply to the address you gave.", true);
      })
      .catch(function () {
        say("That did not go through. Try again in a minute, or write to us another way.", false);
      })
      .then(function () {
        submit.disabled = false;
        submit.textContent = label;
      });
  }

  form.addEventListener("submit", onSubmit);

  return function () { form.removeEventListener("submit", onSubmit); };
};
