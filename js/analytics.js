// First-party analytics helper for akmalariq.dev.
//
// Pushes GA4-style events into the GTM data layer. This is deliberately small
// and dependency-free: the site pushes structured events, and Google Tag Manager
// maps them to GA4 tags. Nothing here talks to Google directly, so the site
// keeps working when analytics is not configured.
//
// Event names follow the GA4 recommended e-commerce and engagement schema so the
// data maps cleanly to GA4 reports without custom dimensions everywhere.

(function () {
  window.dataLayer = window.dataLayer || [];

  function track(event, params) {
    try {
      window.dataLayer.push(Object.assign({ event: event }, params || {}));
    } catch (err) {
      /* never let analytics break the page */
    }
  }

  window.akmalTrack = track;

  // ---------------------------------------------------------------- funnel --
  //
  // The sales funnel for a freelance site is: arrive → decide it is worth
  // reading → click → start the form → submit. Everything after the submit is
  // offline (an email thread, a PO) and cannot be measured here, so it is
  // tracked by hand against lead_id — see docs/FUNNEL.md.
  //
  // lead_id is minted client-side when the form is first touched. It travels
  // with the submission email, which is what lets an offline stage be joined
  // back to the visitor who produced it. It is a random UUID, carries nothing
  // personal, and is not a cookie.

  function leadId() {
    if (window.__akmalLeadId) return window.__akmalLeadId;
    var id;
    try {
      id = (crypto.randomUUID && crypto.randomUUID()) ||
        Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    } catch (err) {
      id = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    }
    window.__akmalLeadId = id;
    return id;
  }

  window.akmalLeadId = leadId;

  /**
   * Which part of the page a click came from. Without this, "cta_click" is one
   * undifferentiated number and the page layout cannot be judged — the whole
   * point of a funnel is knowing *where* people drop out.
   */
  function placement(node) {
    var section = node.closest && node.closest("section[id], section[class], footer");
    if (!section) return "other";
    if (section.id) return section.id;
    var cls = (section.className || "").split(/\s+/)[0];
    return cls || "other";
  }

  /**
   * Fire once per section when it first scrolls into view. This is the honest
   * measure of interest: on a 10,000px page, "reached the pricing table" is the
   * signal that the visitor was still reading at the point of decision.
   */
  function watchSections() {
    var targets = document.querySelectorAll("[data-funnel]");
    if (!targets.length || !("IntersectionObserver" in window)) return;

    var seen = {};
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var name = entry.target.getAttribute("data-funnel");
          if (seen[name]) return;
          if (!entry.isIntersecting) return;
          seen[name] = true;
          track("funnel_section", { section: name });
          observer.unobserve(entry.target);
        });
      },
      // threshold 0 on purpose, not a ratio. Featured Projects is 3,182px tall,
      // so 35% of it can never fit in a viewport and it silently never reported
      // — the section a reader is most likely to leave on. Any part visible
      // counts as reached; unobserve keeps it to once.
      { threshold: 0 }
    );
    targets.forEach(function (el) { observer.observe(el); });
  }

  function textOf(node, max) {
    return (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, max || 80);
  }

  function classify(anchor) {
    var href = anchor.getAttribute("href") || "";
    if (href.indexOf("/projects/") !== -1) {
      return {
        event: "select_item",
        params: { item_list_name: "projects", link_url: href, link_text: textOf(anchor) },
      };
    }
    if (/\.pdf(\?|$)/.test(href)) {
      return {
        event: "file_download",
        params: { file_name: href.split("/").pop().split("?")[0], link_url: href },
      };
    }
    if (href.indexOf("mailto:") === 0) {
      return { event: "contact_click", params: { method: "email" } };
    }
    if (href.indexOf("github.com") !== -1 || href.indexOf("linkedin.com") !== -1) {
      return {
        event: "outbound_click",
        params: { link_domain: href.split("/")[2], link_url: href, link_text: textOf(anchor) },
      };
    }
    if (href.indexOf("/blog") === 0) {
      return { event: "select_content", params: { content_type: "blog", link_url: href, link_text: textOf(anchor) } };
    }
    if (anchor.classList.contains("nav-cta")) {
      return { event: "cta_click", params: { link_text: textOf(anchor), link_url: href, placement: "nav" } };
    }
    if (href.indexOf("#contact") !== -1) {
      return {
        event: "cta_click",
        params: { link_text: textOf(anchor), link_url: href, placement: placement(anchor) },
      };
    }
    return null;
  }

  document.addEventListener(
    "click",
    function (event) {
      var anchor = event.target && event.target.closest ? event.target.closest("a") : null;
      if (!anchor) return;
      var hit = classify(anchor);
      if (hit) track(hit.event, hit.params);
    },
    true
  );

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.getElementById("themeToggle") || document.getElementById("themeToggleMobile");
    if (toggle) {
      toggle.addEventListener("click", function () {
        track("ui_toggle", { control: "theme" });
      });
    }
    watchSections();
  });
})();
