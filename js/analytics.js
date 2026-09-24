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
    if (anchor.classList.contains("nav-cta") || href.indexOf("#contact") !== -1) {
      return { event: "cta_click", params: { link_text: textOf(anchor), link_url: href } };
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
  });
})();
