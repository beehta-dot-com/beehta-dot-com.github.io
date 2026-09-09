/* ============================================================
   CONTACT.JS
   Form handling for the beehta.com contact page

   How this works:
   1. The destination email is never written in plain HTML.
      It's assembled here at runtime so plain regex based
      scrapers reading the page source won't pick it up.
   2. Cloudflare Turnstile has to pass before the submit
      button becomes clickable. That's what stops automated
      submissions.
   3. FormSubmit.co is the mail relay, so no backend code is
      needed to receive the message.

   FIRST TIME SETUP (FormSubmit)
   The very first submission won't deliver a message. Instead
   FormSubmit emails an activation link to the destination
   address below. Click it once and every submission after
   that gets forwarded normally.

   TURNSTILE SITE KEY
   Replace TURNSTILE_SITE_KEY with your own key from the
   Cloudflare dashboard before going live. This file uses
   Cloudflare's public test key by default, which always
   passes and is only meant for local development.
   Test key: 1x00000000000000000000AA
============================================================ */

/* ---- configuration ---- */

// Replace with your production site key from
// https://dash.cloudflare.com under Turnstile.
const TURNSTILE_SITE_KEY = "1x00000000000000000000AA";

/* ---- FormSubmit target, built at runtime, not in the HTML ---- */
(function buildFormTarget(){
  const user = "hello";
  const at   = "\x40";
  const domain = "beehta";
  const tld = "\x2ecom";
  const address = user + at + domain + tld;

  const form = document.getElementById("contactForm");
  if (!form) return;

  form.action = "https://formsubmit.co/" + address;

  // FormSubmit needs an absolute URL for _next. A relative one
  // resolves against formsubmit.co and breaks the redirect back.
  const nextField = form.querySelector('[name="_next"]');
  if (nextField){
    nextField.value = new URL("contact.html?sent=1", window.location.href).href;
  }
})();

/* ---- Turnstile render ---- */
function onloadTurnstileCallback(){ // eslint-disable-line no-unused-vars
  turnstile.render("#turnstileWidget", {
    sitekey: TURNSTILE_SITE_KEY,
    callback: onTurnstileSuccess,
    "expired-callback": onTurnstileExpired,
    "error-callback": onTurnstileError,
    theme: "light",
    size: "normal"
  });
}

function onTurnstileSuccess(){ // eslint-disable-line no-unused-vars
  const btn = document.getElementById("submitBtn");
  if (btn){
    btn.disabled = false;
    btn.classList.add("ready");
  }
  const hint = document.getElementById("submitHint");
  if (hint) hint.textContent = "Verification passed, you can send your message now.";
}

function onTurnstileError(){ // eslint-disable-line no-unused-vars
  const btn = document.getElementById("submitBtn");
  if (btn){
    btn.disabled = true;
    btn.classList.remove("ready");
  }
  const hint = document.getElementById("submitHint");
  if (hint) hint.textContent = "Verification failed, please try again.";
}

function onTurnstileExpired(){ // eslint-disable-line no-unused-vars
  onTurnstileError();
}

/* ---- submit handler ---- */
(function attachFormHandler(){
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", function(){
    const btn = document.getElementById("submitBtn");
    if (btn){
      btn.classList.add("loading");
      btn.disabled = true;
    }
    // no preventDefault, let the browser submit to FormSubmit
    // and follow the _next redirect on success
  });
})();
