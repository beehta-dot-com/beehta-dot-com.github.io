/* ============================================================
   CONTACT.JS - Form handling for the contact page
   beehta.com

   Security approach:
   ─────────────────
   1. The destination email is NEVER written in plain HTML.
      It is assembled in JS at runtime so it won't be picked
      up by regex-based email harvesters scanning raw HTML.

   2. Cloudflare Turnstile must pass before the submit button
      becomes active. This stops automated form submissions.

   3. FormSubmit.co acts as the serverless mail relay -
      no back-end code required.

   ──────────────────────────────────────────────────────────
   FIRST-TIME SETUP (FormSubmit activation)
   ──────────────────────────────────────────────────────────
   The very first submission will NOT deliver the message.
   Instead FormSubmit sends an activation email to the
   destination address. Click the confirmation link, and
   every subsequent submission will be forwarded normally.
   ──────────────────────────────────────────────────────────

   PRODUCTION TURNSTILE SITE KEY
   ──────────────────────────────────────────────────────────
   Set TURNSTILE_SITE_KEY below to your key from Cloudflare.
   This is the ONLY place you need to change it.
   The widget renders explicitly once the Turnstile script
   finishes loading (onloadTurnstileCallback below).
   TEST key (always passes, local dev): "1x00000000000000000000AA"
   ──────────────────────────────────────────────────────────
============================================================ */

/* ── Configuration ──────────────────────────────────────── */

// Your Cloudflare Turnstile site key - the single source of truth.
// Get it from: https://dash.cloudflare.com - Turnstile
const TURNSTILE_SITE_KEY = "0x4AAAAAAC_GXOmwB_iSkRvM";

// Destination email - assembled at runtime, never in HTML.
// Split across multiple variables to defeat simple scrapers.
(function buildFormTarget() {
  const _u   = "emails";
  const _at  = "\x40";          // @ (hex encoded)
  const _d   = "beehta";
  const _tld = "\x2ecom";       // .com (hex encoded)
  const _addr = _u + _at + _d + _tld;
  const form  = document.getElementById("contactForm");
  if (form) {
    form.action = "https://formsubmit.co/" + _addr;

    // FormSubmit requires _next to be an absolute URL.
    // A relative value would be resolved against formsubmit.co's own
    // domain and cause a "Form should POST" error on redirect.
    // new URL() resolves it correctly against the current page URL.
    const nextField = form.querySelector('[name="_next"]');
    if (nextField) {
      nextField.value = new URL("contact.html?sent=1", window.location.href).href;
    }
  }
})();

/* ── Turnstile Render ───────────────────────────────────── */

/**
 * Called automatically by the Turnstile script once it has
 * fully loaded (triggered by the ?onload= param in the script
 * tag in contact.html). Renders the widget into #turnstileWidget.
 */
function onloadTurnstileCallback() {   // eslint-disable-line no-unused-vars
  turnstile.render("#turnstileWidget", {
    sitekey:           TURNSTILE_SITE_KEY,
    callback:          onTurnstileSuccess,
    "expired-callback": onTurnstileExpired,
    "error-callback":   onTurnstileError,
    theme:             "light",
    size:              "normal"
  });
}

/* ── Turnstile Callbacks (called by Cloudflare widget) ──── */

/**
 * Called when Turnstile verification succeeds.
 * Enables the submit button.
 */
function onTurnstileSuccess(token) {    // eslint-disable-line no-unused-vars
  const btn = document.getElementById("submitBtn");
  if (btn) {
    btn.disabled = false;
    btn.classList.add("ready");
  }
  const hint = document.getElementById("submitHint");
  if (hint) hint.textContent = "Verification passed. You can now send your message.";
}

/**
 * Called when Turnstile verification expires or errors.
 * Disables the submit button again.
 */
function onTurnstileError() {          // eslint-disable-line no-unused-vars
  const btn = document.getElementById("submitBtn");
  if (btn) {
    btn.disabled = true;
    btn.classList.remove("ready");
  }
  const hint = document.getElementById("submitHint");
  if (hint) hint.textContent = "Verification failed. Please try again.";
}

function onTurnstileExpired() {        // eslint-disable-line no-unused-vars
  onTurnstileError();
}

/* ── Form Submit Handler ────────────────────────────────── */
(function attachFormHandler() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    const btn = document.getElementById("submitBtn");
    if (btn) {
      btn.classList.add("loading");
      btn.disabled = true;
    }
    // Allow native form submission to proceed to FormSubmit
    // The browser will navigate to _next URL on success.
    // No e.preventDefault() - let it submit normally.
  });
})();

/* ── Footer Year ────────────────────────────────────────── */
(function setYear() {
  const el = document.getElementById("footerYear");
  if (el) el.textContent = new Date().getFullYear();
})();
