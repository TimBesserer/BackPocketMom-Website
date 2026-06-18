/* ============================================================
   BackPocket Mom — pre-launch site behaviour
   No framework. Progressive enhancement only: every form still
   submits via a native POST if this script never runs.
   ============================================================ */

/* ------------------------------------------------------------
   ⬇⬇⬇  THE ONE VALUE YOU NEED TO SET  ⬇⬇⬇
   Paste your Kit (ConvertKit) form POST URL below. It looks like
   https://app.kit.com/forms/1234567/subscriptions
   (Kit dashboard → your form → Embed → "HTML" → copy the <form action="...">.)
   Drop-in alternatives work too — just paste their POST endpoint:
     • Beehiiv, Buttondown, or Formspree  (e.g. https://formspree.io/f/abcdwxyz)
   This same value is ALSO set on each <form action="..."> in the HTML so
   the form still works if JavaScript fails to load. Keep them in sync.
   ------------------------------------------------------------ */
const FORM_ENDPOINT = "https://app.kit.com/forms/9580235/subscriptions"; // Kit/ConvertKit form action; or Beehiiv/Buttondown/Formspree

/* ------------------------------------------------------------ */

(function () {
  "use strict";

  /* ---- header: transparent over hero, solid on scroll ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 24) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- signup forms ---- */
  var forms = document.querySelectorAll("form[data-signup]");

  Array.prototype.forEach.call(forms, function (form) {
    // Wire the configured endpoint into the native form action so the
    // no-JS fallback POSTs to the same place. If left as the placeholder,
    // we leave the markup action untouched (also the placeholder).
    if (FORM_ENDPOINT && FORM_ENDPOINT.indexOf("PASTE_") !== 0) {
      form.setAttribute("action", FORM_ENDPOINT);
    }

    form.addEventListener("submit", function (event) {
      var status = form.parentNode.querySelector("[data-status]");
      var honeypot = form.querySelector("[data-honeypot]");

      // Silently drop bots that filled the hidden field.
      if (honeypot && honeypot.value) {
        event.preventDefault();
        showConfirm(form, status); // act "successful" — give the bot nothing
        return;
      }

      // If the endpoint isn't configured yet, let the native POST happen
      // (or, on the placeholder, just show the warm confirmation locally so
      // the experience is testable before launch).
      if (!FORM_ENDPOINT || FORM_ENDPOINT.indexOf("PASTE_") === 0) {
        event.preventDefault();
        showConfirm(form, status);
        return;
      }

      // Enhanced path: submit via fetch, keep the visitor on the page.
      event.preventDefault();
      var button = form.querySelector("button[type=submit]");
      if (button) { button.disabled = true; button.dataset.label = button.textContent; button.textContent = "sending…"; }

      fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok || res.status === 0) showConfirm(form, status);
          else showRetry(form, status, button);
        })
        .catch(function () {
          showRetry(form, status, button);
        });
    });
  });

  function showConfirm(form, status) {
    if (!status) return;
    status.innerHTML =
      '<p class="confirm" role="status">' +
      checkSvg() +
      "<span>got it — we'll let you know the moment we're ready. nothing's lost.</span>" +
      "</p>";
    form.hidden = true;
    // move focus to the confirmation for screen-reader + keyboard users
    var msg = status.querySelector(".confirm");
    if (msg) { msg.setAttribute("tabindex", "-1"); msg.focus(); }
  }

  function showRetry(form, status, button) {
    if (button) { button.disabled = false; if (button.dataset.label) button.textContent = button.dataset.label; }
    if (!status) return;
    status.innerHTML =
      '<p class="retry">that didn\'t go through just now — no worries. ' +
      'please try once more, or email us at ' +
      '<a href="mailto:hello@backpocketmom.com">hello@backpocketmom.com</a> and we\'ll add you.</p>';
  }

  function checkSvg() {
    return (
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.18"/>' +
      '<path d="M7 12.5l3.2 3.2L17 9" stroke="currentColor" stroke-width="2.4" ' +
      'stroke-linecap="round" stroke-linejoin="round"/></svg>'
    );
  }
})();
