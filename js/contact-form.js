// Consult request form — the conversion point of the site.
//
// Why a form and not mailto:: clicking "Book a free consult" used to launch the
// visitor's mail client, which on a phone means leaving the site entirely. The
// form keeps them here, and the pain-point field qualifies the lead before any
// conversation starts — which is also what makes the offline stages in
// docs/FUNNEL.md joinable, because the lead_id below travels with the email.
//
// Progressive enhancement: the markup is a real <form> that posts to /api/contact.
// If this file fails to load the form still submits by email rather than
// vanishing, so a broken script can never remove the only way to contact me.

(function () {
  var form = document.getElementById("consult");
  if (!form) return;

  // Three categorical questions, capped. If a fourth is ever added it has to
  // be added here too, which is the point of naming them.
  // Optional since 2026-10-16. They live inside a <details> and are never
  // validated client-side — a visitor who answers only the three required
  // fields must still be able to submit.
  var CATEGORICAL = [];
  var status = document.getElementById("consult-status");
  var submit = form.querySelector("[type=submit]");
  var track = window.akmalTrack || function () {};
  var leadId = window.akmalLeadId || function () { return "unknown"; };

  function say(message, tone) {
    if (!status) return;
    status.textContent = message;
    status.setAttribute("data-tone", tone || "");
    // The panel starts hidden so it costs nothing on load; any message brings
    // it in. Without this the success text is written into a hidden node and the
    // visitor sees the form vanish with no explanation.
    status.hidden = !message;
  }

  function fieldError(name, message) {
    // segment is a fieldset of radios; everything else is a single input. Look
    // for both so the error lands next to the control that caused it.
    var input = form.querySelector("[name=" + name + "]");
    var host = input && input.type === "radio"
      ? input.closest("fieldset") || input
      : input;
    var slot = form.querySelector("[data-error=" + name + "]");
    if (slot) slot.textContent = message || "";
    if (host && host.setAttribute) {
      host.setAttribute("aria-invalid", message ? "true" : "false");
    }
    if (input && !host.classList.contains("consult-segment")) {
      // Move the announcement to the field so a screen reader hears it in place.
      var described = (input.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
      var errId = input.getAttribute("data-error-id");
      if (errId) {
        described = described.filter(function (d) { return d !== errId; });
        if (message) described.push(errId);
      }
      if (described.length) input.setAttribute("aria-describedby", described.join(" "));
    }
  }

  // form_start: the first real interaction, not just focus on the first box.
  // Focusing and leaving is common and is not intent.
  var started = false;
  var startedAt = 0;
  form.addEventListener(
    "input",
    function (event) {
      if (!started) {
        var t = event.target;
        if (!t.name || t.type === "hidden" || t.type === "checkbox") return;
        started = true;
        startedAt = Date.now();
        track("form_start", { form_id: "consult", lead_id: leadId() });
      }
    },
    true
  );

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (submit.disabled) return;

    var id = leadId();
    // Browser autofill and password managers can populate every field instantly,
    // with no keystrokes to observe. That is a real visitor completing the form
    // as fast as the gate allows — not a bot — so `started` is still false at
    // submit. Reporting fill_ms 0 there would look identical to a bot and lose
    // the enquiry. Submit without a timing claim instead: the gate treats a
    // missing value as "cannot judge" and lets it through.
    var fillMs = started ? Date.now() - startedAt : null;
    var payload = { lead_id: id, website: "" };
    if (fillMs !== null) payload.fill_ms = fillMs;
    new FormData(form).forEach(function (value, key) {
      if (key === "lead_id" || key === "website") return;
      payload[key] = typeof value === "string" ? value : "";
    });

    CATEGORICAL.concat(["name", "email", "pain"]).forEach(function (n) { fieldError(n, ""); });
    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");
    var idle = submit.textContent;
    submit.textContent = "Sending…";
    say("Sending your request…", "pending");

    // Hard stop. The endpoint has its own 8s upstream timeout, but a stuck
    // connection, a sleeping phone, or a network that never fails — only hangs —
    // would otherwise leave the button disabled and the visitor with no way to
    // retry. Fifteen seconds is longer than any legitimate response.
    var settled = false;
    var bail = setTimeout(function () {
      if (settled) return;
      settled = true;
      track("form_error", { form_id: "consult", lead_id: id, reason: "timeout" });
      say("That took too long. Email me at akmalariqs@gmail.com and I will pick it up.", "error");
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
      submit.textContent = idle;
    }, 15000);

    function finish(tone, message, reason) {
      if (settled) return;
      settled = true;
      clearTimeout(bail);
      say(message, tone);
      if (reason) track("form_error", { form_id: "consult", lead_id: id, reason: reason });
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
      submit.textContent = idle;
    }

    fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (response) {
        return response.json().then(function (body) {
          return { ok: response.ok, body: body };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          var errs = (result.body && result.body.errors) || {};
          Object.keys(errs).forEach(function (n) { fieldError(n, errs[n]); });
          track("form_error", {
            form_id: "consult",
            lead_id: id,
            reason: Object.keys(errs).join(",") || (result.body && result.body.error) || "unknown",
          });
          var fallback = (result.body && result.body.fallback) || "akmalariqs@gmail.com";
          say("That did not send. Email me at " + fallback + " and I will pick it up.", "error");
          settled = true;
          clearTimeout(bail);
          submit.disabled = false;
          submit.removeAttribute("aria-busy");
          submit.textContent = idle;
          return;
        }
        settled = true;
        clearTimeout(bail);
        track("form_submit", {
          form_id: "consult",
          lead_id: id,
          segment: payload.segment || "unset",
          exports: payload.exports || "unset",
          cadence: payload.cadence || "unset",
        });
        say("Sent. I reply within one business day (Jakarta, UTC+7).", "success");
        form.reset();
        form.hidden = true;
        // The message is now the whole panel; announce it where focus can find it.
        if (status) status.focus();
      })
      .catch(function (error) {
        finish("error", "That did not send. Check your connection, or email akmalariqs@gmail.com.", "network");
      });
  });
})();
