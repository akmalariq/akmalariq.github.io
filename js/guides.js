/* ==============================================================================
   /guides/ behaviour — checkout, order status, admin.

   One file, switched on <body data-page>. No framework, no build step, because
   this page is deliberately allowed to work from a cold cache on a mid-range
   Android. Every dynamic string that reaches innerHTML goes through esc().
   ============================================================================== */
(() => {
  "use strict";

  const page = document.body.dataset.page;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );

  const fmt = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(Number(n) || 0);
  const pad3 = (n) => String(n).padStart(3, "0");

  const fmtDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(d);
  };

  const fmtClock = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(d) + " WIB";
  };

  const param = (name) => new URLSearchParams(location.search).get(name);

  class ApiError extends Error {
    constructor(message, status, data) {
      super(message);
      this.status = status;
      this.data = data;
    }
  }

  async function api(path, options = {}) {
    const response = await fetch(path, {
      credentials: "same-origin",
      ...options,
      headers: {
        accept: "application/json",
        ...(options.body ? { "content-type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });
    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }
    if (!response.ok) {
      throw new ApiError(data.error || "Permintaan gagal.", response.status, data);
    }
    return data;
  }

  let toastTimer = null;
  function toast(message, isError = false) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("g-toast--error", isError);
    el.classList.add("g-toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("g-toast--show"), 4200);
  }

  const setBusy = (button, busy, label) => {
    if (!button) return;
    button.disabled = busy;
    if (busy) {
      button.dataset.label = button.textContent;
      if (label) button.textContent = label;
    } else if (button.dataset.label) {
      button.textContent = button.dataset.label;
    }
  };

  /* ---------------------------------------------------------------------- hub */

  async function initHub() {
    try {
      const catalog = await api("/api/guides/catalog");
      if (catalog.store?.open) return;
      const hero = $(".g-hero");
      if (!hero) return;

      const banner = document.createElement("div");
      banner.className = "g-note";
      banner.style.marginBottom = "1.5rem";
      banner.innerHTML =
        "<strong>Pratinjau.</strong> Guide final belum dirilis. Sampel gratis sudah bisa dibaca; pembelian dibuka setelah edisi final selesai.";
      hero.prepend(banner);

      $$('a[href^="/guides/checkout/"]').forEach((link) => {
        link.removeAttribute("href");
        link.setAttribute("aria-disabled", "true");
        link.textContent = "Segera dibuka";
      });
    } catch {
      /* the static page still works; checkout is the authority */
    }
  }

  /* ------------------------------------------------------------------ checkout */

  async function initCheckout() {
    const requested = param("p") || "beginner";
    const body = $("#checkout-body");
    const loading = $("#checkout-loading");
    const form = $("#order-form");
    const errorBox = $("#form-error");
    const submit = $("#submit-btn");
    if (!body || !form) return;

    let catalog;
    let product;
    try {
      catalog = await api("/api/guides/catalog");
      product = catalog.products.find((p) => p.id === requested);
    } catch {
      loading.textContent = "Tidak bisa memuat katalog. Periksa koneksi lalu muat ulang halaman.";
      return;
    }

    if (!product) {
      loading.textContent = "Guide tidak ditemukan.";
      return;
    }

    const meta =
      product.kind === "bundle"
        ? `${product.includes_products.length} guide · ${product.pages} halaman · PDF`
        : `Guide ${product.level} · ${product.pages} halaman · PDF`;

    $("#summary-name").textContent = product.name;
    $("#summary-meta").textContent = meta;
    $("#summary-price").textContent = fmt(product.price);
    submit.textContent = `Buat pesanan — ${fmt(product.price)}`;
    loading.hidden = true;
    body.hidden = false;

    if (!catalog.store.open) {
      submit.disabled = true;
      submit.textContent = "Toko sedang tutup";
      errorBox.hidden = false;
      errorBox.textContent = "Pesanan baru sedang ditutup. Coba lagi nanti atau email saya.";
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      errorBox.hidden = true;

      const email = $("#email").value.trim();
      const name = $("#name").value.trim();
      const consent = $("#consent").checked;

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        errorBox.textContent = "Email belum valid. Link unduhan dikirim ke alamat ini.";
        errorBox.hidden = false;
        $("#email").focus();
        return;
      }
      if (!consent) {
        errorBox.textContent = "Centang dulu bahwa kamu paham ini produk digital.";
        errorBox.hidden = false;
        return;
      }

      setBusy(submit, true, "Membuat pesanan…");
      try {
        const payload = {
          product: product.id,
          email,
          name,
          utm_source: param("utm_source") || "",
          utm_campaign: param("utm_campaign") || "",
        };
        const result = await api("/api/guides/orders", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const token = result?.order?.token;
        if (!token) throw new ApiError("Pesanan dibuat tanpa token.", 500);
        location.assign(`/guides/order/?t=${encodeURIComponent(token)}`);
      } catch (error) {
        setBusy(submit, false);
        errorBox.textContent =
          error.message || "Pesanan gagal dibuat. Coba lagi, atau email saya.";
        errorBox.hidden = false;
      }
    });
  }

  /* --------------------------------------------------------------------- order */

  const STATUS_LABEL = {
    pending: "Menunggu pembayaran",
    claimed: "Pembayaran dicek",
    paid: "Terverifikasi",
    rejected: "Ditutup",
    refunded: "Direfund",
    expired: "Kedaluwarsa",
  };

  function setStatus(el, status) {
    if (!el) return;
    el.className = "g-status";
    el.classList.add(`g-status--${status === "paid" ? "paid" : status}`);
    el.textContent = STATUS_LABEL[status] || status;
  }

  function showPanel(name) {
    ["pending", "claimed", "paid", "expired"].forEach((panel) => {
      const el = $(`#panel-${panel}`);
      if (el) el.hidden = panel !== name;
    });
  }

  async function initOrder() {
    const token = param("t") || "";
    const loading = $("#state-loading");
    const errorState = $("#state-error");
    const orderState = $("#state-order");

    const fail = (message) => {
      if (loading) loading.hidden = true;
      if (orderState) orderState.hidden = true;
      if (errorState) errorState.hidden = false;
      if (message) $("#error-message").textContent = message;
    };

    if (!/^[a-f0-9]{32,64}$/.test(token)) {
      fail("Link pesanan tidak lengkap. Buka link dari email konfirmasi, atau mulai pesanan baru.");
      return;
    }

    let pollTimer = null;
    const stopPolling = () => {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = null;
    };

    function render(order) {
      if (!order) return;
      if (loading) loading.hidden = true;
      if (errorState) errorState.hidden = true;
      if (orderState) orderState.hidden = false;

      const status = order.expired && order.status === "pending" ? "expired" : order.status;
      setStatus($("#o-status"), status);
      $("#o-title").textContent = `Pesanan #${order.ref}`;
      $("#o-sub").textContent = `${order.product_name} — ${order.product_title}`;

      if (order.status === "rejected" || order.status === "refunded") {
        fail(
          order.status === "refunded"
            ? "Pembayaran untuk pesanan ini sudah direfund, jadi unduhannya ditutup."
            : order.admin_note
              ? `Pesanan ditutup: ${order.admin_note}`
              : "Pesanan ini ditutup. Email saya kalau kamu sudah transfer.",
        );
        return;
      }

      if (status === "paid") {
        showPanel("paid");
        const downloads = $("#o-downloads");
        downloads.innerHTML = "";
        for (const item of order.downloads || []) {
          const a = document.createElement("a");
          a.className = "g-download";
          a.href = item.url;
          a.setAttribute("download", "");
          a.innerHTML = `<span><span class="g-download__name">${esc(item.name)}</span><span class="g-download__meta">${esc(item.title)} · PDF</span></span><span class="g-download__arrow">Unduh PDF →</span>`;
          downloads.appendChild(a);
        }
        $("#o-email-note").textContent = `Link ini juga dikirim ke emailmu. Simpan halaman ini untuk membuka ulang kapan saja.`;
        stopPolling();
        return;
      }

      if (status === "expired") {
        const retry = document.querySelector('#panel-expired a[href^="/guides/checkout/"]');
        if (retry) retry.href = `/guides/checkout/?p=${encodeURIComponent(order.product)}`;
        showPanel("expired");
        stopPolling();
        return;
      }

      if (status === "claimed") {
        showPanel("claimed");
        $("#claimed-ref").textContent = `#${order.ref}`;
        $("#claimed-amount").textContent = `${fmt(order.amount)} · ${fmtClock(order.claimed_at)}`;
        if (!pollTimer) {
          pollTimer = setInterval(async () => {
            try {
              const fresh = await api(`/api/guides/order?t=${encodeURIComponent(token)}`);
              if (fresh.order && fresh.order.status !== "claimed") render(fresh.order);
            } catch {
              /* keep waiting; the manual check still happens */
            }
          }, 20000);
        }
        return;
      }

      showPanel("pending");
      stopPolling();

      $("#o-amount").textContent = fmt(order.amount);
      $("#o-break").innerHTML = `Harga guide ${esc(fmt(order.amount - order.code))} + kode pesanan <strong>${esc(pad3(order.code))}</strong>`;
      $("#o-expires").textContent = `Bayar sebelum ${fmtClock(order.expires_at)}. Kalau lewat, pesanan kedaluwarsa dan kode ini tidak dipakai lagi.`;

      const qrisBox = $("#qris-box");
      const warning = $("#qris-warning");
      const paygrid = $(".g-paygrid");
      if (order.store?.qris_live) {
        paygrid?.classList.remove("g-paygrid--wide");
        if (qrisBox) qrisBox.hidden = false;
        if (warning) warning.hidden = true;
        const img = $("#o-qris");
        if (img && order.store.qris_image) img.src = order.store.qris_image;
        const caption = $("#qris-caption");
        if (caption && order.store.merchant) {
          caption.textContent = `Merchant: ${order.store.merchant}. Scan dengan GoPay atau aplikasi QRIS lain.`;
        }
      } else {
        paygrid?.classList.add("g-paygrid--wide");
        if (qrisBox) qrisBox.hidden = true;
        if (warning) warning.hidden = false;
      }

      const claim = $("#claim-form");
      if (claim) claim.hidden = false;
    }

    $("#copy-amount")?.addEventListener("click", async (event) => {
      const amount = $("#o-amount").textContent.replace(/[^\d]/g, "");
      const button = event.currentTarget;
      try {
        await navigator.clipboard.writeText(amount);
        button.textContent = "Tersalin";
        setTimeout(() => (button.textContent = "Salin nominal"), 1800);
      } catch {
        const range = document.createRange();
        range.selectNodeContents($("#o-amount"));
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        button.textContent = "Pilih manual (Ctrl+C)";
      }
    });

    $("#refresh-btn")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      setBusy(button, true, "Mengecek…");
      try {
        const fresh = await api(`/api/guides/order?t=${encodeURIComponent(token)}`);
        render(fresh.order);
        if (fresh.order.status === "claimed") toast("Belum ada perubahan. Masih dicek.");
      } catch {
        toast("Tidak bisa mengecek sekarang. Coba lagi.", true);
      } finally {
        setBusy(button, false);
      }
    });

    $("#claim-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = $("#claim-btn");
      const error = $("#claim-error");
      const payer = $("#payer").value.trim();
      error.hidden = true;

      if (payer.length < 2) {
        error.textContent = "Tulis nama yang muncul di aplikasi pembayaran.";
        error.hidden = false;
        $("#payer").focus();
        return;
      }

      setBusy(button, true, "Mengirim…");
      try {
        const result = await api("/api/guides/order", {
          method: "POST",
          body: JSON.stringify({
            token,
            payer,
            note: $("#claim-note").value.trim(),
          }),
        });
        render(result.order);
        toast("Klaim terkirim. Pembayaran akan dicek.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        error.textContent = err.message || "Klaim gagal dikirim. Coba lagi.";
        error.hidden = false;
        setBusy(button, false);
      }
    });

    try {
      const result = await api(`/api/guides/order?t=${encodeURIComponent(token)}`);
      render(result.order);
    } catch (error) {
      fail(
        error.status === 404
          ? "Pesanan tidak ditemukan. Pastikan linknya lengkap, atau mulai pesanan baru."
          : error.message || "Tidak bisa memuat pesanan.",
      );
    }
  }

  /* --------------------------------------------------------------------- admin */

  async function initAdmin() {
    const loginView = $("#login-view");
    const adminView = $("#admin-view");
    const loginForm = $("#login-form");
    const loginError = $("#login-error");
    const loginBtn = $("#login-btn");
    const list = $("#orders-list");
    const loading = $("#orders-loading");
    const empty = $("#orders-empty");
    let filter = "open";

    const showLogin = () => {
      if (loginView) loginView.hidden = false;
      if (adminView) adminView.hidden = true;
    };
    const showAdmin = () => {
      if (loginView) loginView.hidden = true;
      if (adminView) adminView.hidden = false;
    };

    function renderStats(stats) {
      const counts = stats?.counts || {};
      const amounts = stats?.amounts || {};
      $("#stat-open").textContent = String((counts.pending || 0) + (counts.claimed || 0));
      $("#stat-claimed").textContent = String(counts.claimed || 0);
      $("#stat-revenue").textContent = fmt(amounts.paid || 0);
      $("#stat-24h").textContent = String(stats?.last24h || 0);
    }

    function row(order) {
      const article = document.createElement("article");
      article.className = "g-order-row";
      if (order.status === "claimed") article.classList.add("g-order-row--claimed");

      const statusLabel =
        order.expired && (order.status === "pending" || order.status === "claimed")
          ? "Kedaluwarsa"
          : STATUS_LABEL[order.status] || order.status;
      const claim =
        order.payer || order.pay_note
          ? `<div class="g-order-row__claim"><strong>Klaim:</strong> ${esc(order.payer || "—")}${
              order.pay_note ? ` — &ldquo;${esc(order.pay_note)}&rdquo;` : ""
            }</div>`
          : "";

      const actions = [];
      actions.push(
        `<a class="g-btn-sm" href="/guides/order/?t=${encodeURIComponent(order.token)}" target="_blank" rel="noopener">Buka</a>`,
      );
      if (["pending", "claimed", "rejected"].includes(order.status)) {
        actions.push(
          `<button class="g-btn-sm g-btn-sm--primary" type="button" data-action="approve" data-id="${order.id}">Setujui</button>`,
        );
      }
      if (["pending", "claimed"].includes(order.status)) {
        actions.push(
          `<button class="g-btn-sm g-btn-sm--danger" type="button" data-action="reject" data-id="${order.id}">Tolak</button>`,
        );
      }
      if (order.status === "paid") {
        actions.push(
          `<button class="g-btn-sm" type="button" data-action="resend" data-id="${order.id}">Kirim ulang email</button>`,
          `<button class="g-btn-sm g-btn-sm--danger" type="button" data-action="refund" data-id="${order.id}">Refund</button>`,
        );
      }

      article.innerHTML = `
        <div class="g-order-row__top">
          <span class="g-order-row__ref">#${esc(order.ref)} · ${esc(order.product_name)}</span>
          <span class="g-order-row__amount">${esc(fmt(order.amount))}</span>
        </div>
        <div class="g-order-row__meta">
          <span><strong>${esc(statusLabel)}</strong></span>
          <span>${esc(order.email || "")}</span>
          <span>${esc(fmtDate(order.created_at))}</span>
          <span>${order.paid_at ? `Dibayar ${esc(fmtDate(order.paid_at))}` : `Berlaku s/d ${esc(fmtDate(order.expires_at))}`}</span>
        </div>
        ${claim}
        <div class="g-actions">${actions.join("")}</div>
      `;

      article.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", () => act(button.dataset.action, Number(button.dataset.id), order, button));
      });
      return article;
    }

    async function loadOrders() {
      loading.hidden = false;
      empty.hidden = true;
      list.innerHTML = "";
      try {
        const data = await api(`/api/guides/admin/orders?status=${encodeURIComponent(filter)}`);
        showAdmin();
        renderStats(data.stats);
        loading.hidden = true;
        const orders = data.orders || [];
        if (!orders.length) {
          empty.hidden = false;
          return;
        }
        for (const order of orders) list.appendChild(row(order));
      } catch (error) {
        loading.hidden = true;
        if (error.status === 401) {
          showLogin();
        } else {
          list.innerHTML = `<p class="g-error">${esc(error.message || "Gagal memuat pesanan.")}</p>`;
        }
      }
    }

    async function act(action, id, order, button) {
      const labels = {
        approve: `Setujui #${order.ref} sebesar ${fmt(order.amount)}? Cocokkan dulu dengan notifikasi GoPay. Unduhan akan terbuka.`,
        reject: "Tolak pesanan ini? Pembeli tidak akan mendapat file.",
        refund: "Tandai sudah direfund? Unduhan akan ditutup.",
        resend: "Kirim ulang email unduhan?",
      };
      if (action !== "resend" && !window.confirm(labels[action])) return;

      button.disabled = true;
      try {
        const result = await api("/api/guides/admin/action", {
          method: "POST",
          body: JSON.stringify({ id, action }),
        });
        if (action === "approve") {
          const mail = result.email;
          toast(
            mail === "sent"
              ? `#${order.ref} disetujui. Email terkirim.`
              : mail === "failed"
                ? `#${order.ref} disetujui, tapi email gagal. Kirim manual.`
                : `#${order.ref} disetujui. Email tidak dikonfigurasi.`,
            mail === "failed",
          );
        } else {
          toast(`#${order.ref}: ${action} selesai.`);
        }
        await loadOrders();
      } catch (error) {
        toast(error.message || "Aksi gagal.", true);
      } finally {
        button.disabled = false;
      }
    }

    loginForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      loginError.hidden = true;
      setBusy(loginBtn, true, "Masuk…");
      try {
        await api("/api/guides/admin/login", {
          method: "POST",
          body: JSON.stringify({ password: $("#password").value }),
        });
        $("#password").value = "";
        await loadOrders();
      } catch (error) {
        loginError.textContent = error.message || "Password salah.";
        loginError.hidden = false;
      } finally {
        setBusy(loginBtn, false);
      }
    });

    $("#logout-btn")?.addEventListener("click", async () => {
      try {
        await api("/api/guides/admin/logout", { method: "POST", body: "{}" });
      } catch {
        /* the cookie may already be gone */
      }
      showLogin();
    });

    $("#reload-btn")?.addEventListener("click", loadOrders);

    $$(".g-filter").forEach((button) => {
      button.addEventListener("click", () => {
        filter = button.dataset.filter;
        $$(".g-filter").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
        loadOrders();
      });
    });

    await loadOrders();
  }

  /* --------------------------------------------------------------------- boot */

  if (page === "guides") initHub();
  if (page === "checkout") initCheckout();
  if (page === "order") initOrder();
  if (page === "admin") initAdmin();
})();
