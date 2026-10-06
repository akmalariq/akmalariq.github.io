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
  var form = document.getElementById("consult-form");
  if (!form) return;

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
    var input = form.querySelector("[name=" + name + "]");
    var slot = form.querySelector("[data-error=" + name + "]");
    if (slot) slot.textContent = message || "";
    if (input) {
      input.setAttribute("aria-invalid", message ? "true" : "false");
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
  form.addEventListener(
    "input",
    function (event) {
      if (started) return;
      var target = event.target;
      if (!target.name || target.tagName === "INPUT" && target.type === "hidden") return;
      if (target.type === "checkbox") return;
      started = true;
      track("form_start", { form_id: "consult", lead_id: leadId() });
    },
    true
  );

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (submit.disabled) return;

    var id = leadId();
    var payload = { lead_id: id, website: "" };
    new FormData(form).forEach(function (value, key) {
      if (key === "lead_id" || key === "website") return;
      payload[key] = typeof value === "string" ? value : "";
    });

    ["name", "email", "pain"].forEach(function (n) { fieldError(n, ""); });
    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");
    var idle = submit.textContent;
    submit.textContent = "Sending…";
    say("Sending your request…", "pending");

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
          submit.disabled = false;
          submit.removeAttribute("aria-busy");
          submit.textContent = idle;
          return;
        }
        track("form_submit", { form_id: "consult", lead_id: id, has_company: !!payload.company });
        say("Sent. I reply within one business day (Jakarta, UTC+7).", "success");
        form.reset();
        form.hidden = true;
        // The message is now the whole panel; announce it where focus can find it.
        if (status) status.focus();
      })
      .catch(function (error) {
        track("form_error", { form_id: "consult", lead_id: id, reason: "network" });
        say("That did not send. Check your connection, or email akmalariqs@gmail.com.", "error");
        submit.disabled = false;
        submit.removeAttribute("aria-busy");
        submit.textContent = idle;
      });
  });
})();
