// Contact and quote forms: client-side validation, spam checks, and AJAX delivery.
// A success message is shown only when the delivery service confirms success.
(function () {
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var MIN_FILL_MS = 2500;
  var TIMEOUT_MS = 20000;
  var loadedAt = Date.now();

  function fieldError(el) {
    var v = (el.type === "checkbox") ? el.checked : el.value.trim();
    var label = (el.labels && el.labels[0] ? el.labels[0].textContent : el.name).replace(/\s*\*\s*$/, "").trim();
    if (el.required && !v) return el.type === "checkbox" ? "Please tick this box to continue." : label + " is required.";
    if (el.type === "checkbox" || !v) return "";
    if (el.type === "email" && !EMAIL_RE.test(v)) return "Please enter a valid email address.";
    if (el.minLength > 0 && v.length < el.minLength) return label + " must be at least " + el.minLength + " characters.";
    if (el.maxLength > 0 && v.length > el.maxLength) return label + " must be at most " + el.maxLength + " characters.";
    if (el.pattern && !new RegExp("^(?:" + el.pattern + ")$").test(v)) return "Please enter a valid " + label + ".";
    return "";
  }

  function showError(el, msg) {
    var box = document.getElementById(el.id + "-error");
    if (box) box.textContent = msg;
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    if (box) el.setAttribute("aria-describedby", box.id);
  }

  function setStatus(form, kind, html) {
    var s = form.querySelector(".form-status");
    s.className = "form-status " + kind;
    s.innerHTML = html;
    s.hidden = false;
  }

  function init(form) {
    var inputs = Array.prototype.filter.call(form.elements, function (el) {
      return el.id && el.name && el.name !== "_honey" && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT");
    });
    var button = form.querySelector("button[type=submit]");
    var fallback = form.getAttribute("data-fallback");
    var fallbackHtml = 'Please try again, or email us directly at <a href="mailto:' + fallback + '">' + fallback + "</a>.";

    inputs.forEach(function (el) {
      el.addEventListener("blur", function () { showError(el, fieldError(el)); });
      el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true") showError(el, fieldError(el)); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      inputs.forEach(function (el) {
        var msg = fieldError(el);
        showError(el, msg);
        if (msg && !firstBad) firstBad = el;
      });
      if (firstBad) {
        setStatus(form, "error", "Please fix the highlighted fields.");
        firstBad.focus();
        return;
      }
      var honey = form.querySelector("[name=_honey]");
      if ((honey && honey.value) || Date.now() - loadedAt < MIN_FILL_MS) {
        setStatus(form, "error", "Your message could not be sent. " + fallbackHtml);
        return;
      }

      var payload = { _subject: form.getAttribute("data-subject"), _template: "table", _captcha: "false", _honey: "" };
      inputs.forEach(function (el) {
        payload[el.name] = el.type === "checkbox" ? (el.checked ? "yes" : "no") : el.value.trim();
      });
      payload.page = location.pathname;

      button.disabled = true;
      var label = button.textContent;
      button.textContent = "Sending...";
      setStatus(form, "pending", "Sending your message...");

      var ctrl = "AbortController" in window ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);

      fetch(form.getAttribute("data-endpoint"), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          var ok = res.ok && (body.success === true || body.success === "true");
          if (!ok) throw new Error("Delivery not confirmed");
        });
      }).then(function () {
        form.reset();
        inputs.forEach(function (el) { showError(el, ""); });
        setStatus(form, "success", "<strong>Thank you &mdash; your message has been sent.</strong> We&rsquo;ll reply by email, usually within two business days.");
      }).catch(function () {
        setStatus(form, "error", "Sorry, your message could not be sent right now. " + fallbackHtml);
      }).then(function () {
        clearTimeout(timer);
        button.disabled = false;
        button.textContent = label;
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.forEach.call(document.querySelectorAll("form.js-form"), init);
  });
})();
