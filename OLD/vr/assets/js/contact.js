const TURNSTILE_SITE_KEY = "0x4AAAAAAC_GXOmwB_iSkRvM";

(function configureForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  // Keep the destination assembled at runtime, following the reference implementation.
  const user = "emails";
  const at = "\x40";
  const domain = "beehta";
  const tld = "\x2ecom";
  form.action = "https://formsubmit.co/" + user + at + domain + tld;

  const next = document.getElementById("nextUrl");
  if (next) next.value = new URL("contact.html?sent=1", window.location.href).href;
})();

function onloadTurnstileCallback() {
  if (!window.turnstile) return;
  window.turnstile.render("#turnstileWidget", {
    sitekey: TURNSTILE_SITE_KEY,
    callback: onTurnstileSuccess,
    "expired-callback": onTurnstileExpired,
    "error-callback": onTurnstileError,
    theme: "light",
    size: "normal"
  });
}

function onTurnstileSuccess() {
  const btn = document.getElementById("submitBtn");
  if (btn) btn.disabled = false;
  const hint = document.getElementById("submitHint");
  if (hint) hint.textContent = "Verification passed. You can now send your message.";
}

function onTurnstileError() {
  const btn = document.getElementById("submitBtn");
  if (btn) btn.disabled = true;
  const hint = document.getElementById("submitHint");
  if (hint) hint.textContent = "Verification failed. Please try again.";
}

function onTurnstileExpired() {
  onTurnstileError();
}

(function initContact() {
  const form = document.getElementById("contactForm");
  const subject = document.getElementById("fieldSubject");
  const hiddenSubject = document.getElementById("emailSubject");
  const btn = document.getElementById("submitBtn");

  if (subject && hiddenSubject) {
    subject.addEventListener("change", () => {
      hiddenSubject.value = "beehta.com - " + subject.value;
    });
  }

  if (form && btn) {
    form.addEventListener("submit", () => {
      btn.disabled = true;
      btn.textContent = "Sending...";
    });
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("sent") === "1") {
    form.hidden = true;
    document.getElementById("successState").hidden = false;
  }

  const year = document.getElementById("footerYear");
  if (year) year.textContent = new Date().getFullYear();
})();
