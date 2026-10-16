/* =============================================================================
   SAMPLE OPS DASHBOARD
   ------------------------------------------------------------------------------
   A real, filterable dashboard over synthetic retail data. It exists to answer
   one buyer question in the first ten seconds: "what does the thing I would
   receive actually look like?"

   Why generated rather than shipped as JSON: 84 days x 3 branches x 3 channels
   x 4 categories is ~3,000 rows. As JSON that is roughly 250 KB of payload for a
   component whose entire job is to prove the shape of the output. A seeded
   generator produces the identical dataset in under 400 bytes of source and
   zero network cost, and it stays deterministic: same rows on every load,
   which is what makes the filters feel like a real report rather than a toy.

   The data is synthetic and the UI says so, once, in the caption. Nothing here
   is a client result. See docs/FEEDBACK-LOG.md gap #1.

   No dependencies. No build step. Progressive enhancement: without JS the
   section renders a static summary table from the markup, so the content is
   never JS-only.
   ============================================================================= */
(function () {
  'use strict';

  var root = document.getElementById('opsdash');
  if (!root) return;

  /* ---- deterministic synthetic data ------------------------------------- */

  // mulberry32: small, fast, and stable across engines for a given seed.
  function seeded(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var BRANCHES = [
    { id: 'jakarta', label: 'Jakarta', weight: 0.46 },
    { id: 'bandung', label: 'Bandung', weight: 0.31 },
    { id: 'surabaya', label: 'Surabaya', weight: 0.23 }
  ];

  var CHANNELS = [
    { id: 'shopee', label: 'Shopee', weight: 0.38, refund: 0.031 },
    { id: 'tokopedia', label: 'Tokopedia', weight: 0.34, refund: 0.042 },
    { id: 'offline', label: 'Offline store', weight: 0.28, refund: 0.008 }
  ];

  var CATEGORIES = [
    { id: 'food', label: 'Food & beverage', aov: 78000 },
    { id: 'household', label: 'Household', aov: 145000 },
    { id: 'personal', label: 'Personal care', aov: 96000 },
    { id: 'apparel', label: 'Apparel', aov: 210000 }
  ];

  var DAYS = 84; // 12 weeks

  // A gentle upward trend plus a weekly rhythm, so the chart has a shape worth
  // filtering. Seeded, so the shape is identical on every load.
  function buildRows() {
    var rand = seeded(20260401);
    var rows = [];
    for (var d = 0; d < DAYS; d++) {
      var dow = d % 7;
      // Fri/Sat are the retail peak in Indonesia. Monday is the trough.
      var weekly = dow === 5 || dow === 6 ? 1.34 : dow === 0 ? 0.82 : 1.0;
      var trend = 1 + (d / DAYS) * 0.18;
      for (var b = 0; b < BRANCHES.length; b++) {
        var branch = BRANCHES[b];
        for (var c = 0; c < CHANNELS.length; c++) {
          var channel = CHANNELS[c];
          for (var k = 0; k < CATEGORIES.length; k++) {
            var cat = CATEGORIES[k];
            // Volume scales with branch weight and channel weight.
            var volume = 46 * branch.weight * channel.weight * 4 * weekly * trend;
            volume *= 0.72 + rand() * 0.62;
            var orders = Math.max(1, Math.round(volume));
            var aov = cat.aov * (0.86 + rand() * 0.3);
            var net = Math.round(orders * aov);
            var refunds = Math.round(orders * channel.refund * (0.5 + rand()));
            rows.push({
              day: d,
              branch: branch.id,
              channel: channel.id,
              category: cat.id,
              orders: orders,
              net: net,
              refunds: refunds,
              refundValue: Math.round(refunds * aov)
            });
          }
        }
      }
    }
    return rows;
  }

  var ROWS = buildRows();

  // Day 0 is 84 days back from a fixed date rather than `today`, so the chart
  // does not silently change shape between page loads and screenshots match.
  var DAY_LABELS = (function () {
    var end = new Date('2026-05-29T00:00:00Z');
    var out = [];
    for (var i = DAYS - 1; i >= 0; i--) {
      var dt = new Date(end.getTime() - i * 86400000);
      out.push(dt.toISOString().slice(0, 10));
    }
    return out;
  })();

  /* ---- formatting -------------------------------------------------------- */

  function rupiah(n) {
    // Indonesian convention: thousands separated by a dot.
    return 'Rp ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function rupiahShort(n) {
    if (n >= 1e9) return 'Rp ' + (n / 1e9).toFixed(1).replace('.', ',') + ' M';
    if (n >= 1e6) return 'Rp ' + Math.round(n / 1e6) + ' jt';
    if (n >= 1e3) return 'Rp ' + Math.round(n / 1e3) + ' rb';
    return 'Rp ' + Math.round(n);
  }
  function pct(n) {
    return (n * 100).toFixed(1) + '%';
  }

  var LABELS = {
    branch: { jakarta: 'Jakarta', bandung: 'Bandung', surabaya: 'Surabaya' },
    channel: { shopee: 'Shopee', tokopedia: 'Tokopedia', offline: 'Offline store' },
    category: { food: 'Food & beverage', household: 'Household', personal: 'Personal care', apparel: 'Apparel' }
  };

  /* ---- filter state ------------------------------------------------------ */

  var state = { weeks: 8, branch: 'all', channel: 'all', category: 'all' };

  function filtered() {
    var from = DAYS - state.weeks * 7;
    return ROWS.filter(function (r) {
      if (r.day < from) return false;
      if (state.branch !== 'all' && r.branch !== state.branch) return false;
      if (state.channel !== 'all' && r.channel !== state.channel) return false;
      if (state.category !== 'all' && r.category !== state.category) return false;
      return true;
    });
  }

  function aggregate(rows) {
    var orders = 0, net = 0, refundValue = 0;
    for (var i = 0; i < rows.length; i++) {
      orders += rows[i].orders;
      net += rows[i].net;
      refundValue += rows[i].refundValue;
    }
    return {
      orders: orders,
      net: net,
      aov: orders ? net / orders : 0,
      refundRate: net ? refundValue / net : 0
    };
  }

  /* ---- rendering --------------------------------------------------------- */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var kpiHost = root.querySelector('[data-opsdash-kpis]');
  var chartHost = root.querySelector('[data-opsdash-chart]');
  var tableHost = root.querySelector('[data-opsdash-table]');
  var summary = root.querySelector('[data-opsdash-summary]');

  function renderKpis(a) {
    kpiHost.textContent = '';
    var tiles = [
      { label: 'Net sales', value: rupiahShort(a.net), sub: a.orders.toLocaleString('en-US') + ' orders' },
      { label: 'Average order', value: rupiahShort(a.aov), sub: 'per basket' },
      { label: 'Refund rate', value: pct(a.refundRate), sub: 'of gross value' }
    ];
    tiles.forEach(function (t) {
      var tile = el('div', 'opsdash__kpi');
      tile.appendChild(el('p', 'opsdash__kpi-label', t.label));
      tile.appendChild(el('p', 'opsdash__kpi-value', t.value));
      tile.appendChild(el('p', 'opsdash__kpi-sub', t.sub));
      kpiHost.appendChild(tile);
    });
  }

  function renderChart(rows) {
    // Daily net sales as a bar chart. Drawn as DOM, not canvas: bars stay
    // selectable, searchable, and legible to a screen reader, and they inherit
    // every theme token for free.
    var byDay = new Array(DAYS).fill(0);
    rows.forEach(function (r) { byDay[r.day] += r.net; });

    var from = DAYS - state.weeks * 7;
    var window_ = byDay.slice(from);
    var max = Math.max.apply(null, window_);

    chartHost.textContent = '';
    var plot = el('div', 'opsdash__plot');
    plot.setAttribute('role', 'img');
    plot.setAttribute('aria-label',
      'Bar chart of daily net sales for the last ' + state.weeks + ' weeks. Peak ' +
      rupiahShort(max) + ', average ' + rupiahShort(window_.reduce(function (a, b) { return a + b; }, 0) / window_.length) + '.');

    window_.forEach(function (v, i) {
      var bar = el('div', 'opsdash__bar');
      var h = max ? Math.max(2, Math.round((v / max) * 100)) : 2;
      bar.style.setProperty('--h', h + '%');
      bar.setAttribute('title', DAY_LABELS[from + i] + ' · ' + rupiahShort(v));
      plot.appendChild(bar);
    });
    chartHost.appendChild(plot);
  }

  function renderTable(rows) {
    var byCat = {};
    rows.forEach(function (r) {
      if (!byCat[r.category]) byCat[r.category] = { orders: 0, net: 0, refunds: 0 };
      byCat[r.category].orders += r.orders;
      byCat[r.category].net += r.net;
      byCat[r.category].refunds += r.refundValue;
    });

    var ranked = Object.keys(byCat)
      .map(function (k) { return { id: k, v: byCat[k] }; })
      .sort(function (a, b) { return b.v.net - a.v.net; });

    tableHost.textContent = '';
    var tbody = document.createElement('tbody');
    ranked.forEach(function (r) {
      var tr = document.createElement('tr');
      [
        LABELS.category[r.id],
        r.v.orders.toLocaleString('en-US'),
        rupiah(r.v.net),
        pct(r.v.net ? r.v.refunds / r.v.net : 0)
      ].forEach(function (cell, i) {
        var td = el('td', i === 0 ? 'opsdash__cat' : null, cell);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    tableHost.appendChild(tbody);
  }

  function render() {
    var rows = filtered();
    var a = aggregate(rows);
    renderKpis(a);
    renderChart(rows);
    renderTable(rows);

    var branchLabel = state.branch === 'all' ? 'all branches' : LABELS.branch[state.branch];
    summary.textContent =
      'Sample data · synthetic. ' + a.orders.toLocaleString('en-US') + ' orders across ' +
      branchLabel + ', last ' + state.weeks + ' weeks.';
  }

  /* ---- controls ---------------------------------------------------------- */

  root.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-opsdash-filter]');
    if (!btn) return;
    event.preventDefault();
    var group = btn.getAttribute('data-opsdash-filter');
    var value = btn.getAttribute('data-value');

    if (group === 'weeks') state.weeks = parseInt(value, 10);
    else state[group] = value;

    // aria-pressed, not a class: this is a state the assistive tech reads.
    var siblings = root.querySelectorAll('[data-opsdash-filter="' + group + '"]');
    Array.prototype.forEach.call(siblings, function (s) {
      s.setAttribute('aria-pressed', s === btn ? 'true' : 'false');
    });

    render();
  });

  render();
})();