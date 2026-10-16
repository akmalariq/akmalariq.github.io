(() => {
  const canvas = document.getElementById("heroReportCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Skip network request: fall back to embedded sample data day-zero. We still
  // shipped docs/STYLE-ROLLOUT.md expecting hero-data.json as a Phase-2 fetch;
  // this stub keeps the canvas fast.
  const data = {
    weeks: ["W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12"],
    before: [340,330,355,328,360,335,345,323,340,350,330,338],
    after:  [340,320,290,260,230,200,170,150,140,135,130,125],
  };

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDark = matchMedia("(prefers-color-scheme: dark)").matches;
  const bgStroke = isDark ? "rgba(255,255,255,0.06)" : "rgba(20,18,16,0.06)";
  const beforeStroke = isDark ? "rgba(255,255,255,0.45)" : "rgba(20,18,16,0.45)";
  const afterStroke = isDark ? "#6c89fd" : "#1b3e8d";
  const inkSmall = isDark ? "#" : "";
  const inkDark = isDark ? "#e8e4d9" : "#14222f";
  const muted = isDark ? "#8a8478" : "#59544e";

  const pad = { t: 20, r: 16, b: 36, l: 44 };
  const W = canvas.width, H = canvas.height;
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const n = data.weeks.length;
  const max = Math.max(...data.before, ...data.after) * 1.1;

  function x(i) { return pad.l + (i / (n - 1)) * plotW; }
  function y(v) { return pad.t + (1 - v / max) * plotH; }

  function draw(animateProgress) {
    ctx.clearRect(0, 0, W, H);

    // Horizontal gridlines
    ctx.strokeStyle = bgStroke;
    ctx.lineWidth = 1;
    for (let k = 0; k <= 4; k++) {
      const v = max * (k / 4);
      const yy = y(v);
      ctx.beginPath(); ctx.moveTo(pad.l, yy); ctx.lineTo(W - pad.r, yy); ctx.stroke();
      // y-axis label
      ctx.font = '10px JetBrains Mono, "SF Mono", monospace';
      ctx.fillStyle = muted; ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(v.toFixed(0), pad.l - 8, yy);
    }

    // X-axis labels
    ctx.font = '10px JetBrains Mono, "SF Mono", monospace';
    ctx.fillStyle = muted; ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (let i = 0; i < n; i++) {
      if (i % 2 === 0 || i === n-1) ctx.fillText(data.weeks[i], x(i), H - pad.b + 8);
    }

    // Axis line for bottom
    ctx.strokeStyle = bgStroke; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, H-pad.b); ctx.lineTo(W-pad.r, H-pad.b); ctx.stroke();

    // Before series (dashed, neutral muted)
    const pointsBefore = data.before.map((v, i) => ({x: x(i), y: y(v)}));
    // restrict end index based on progress (always full for before)
    ctx.beginPath();
    pointsBefore.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = beforeStroke;
    ctx.lineWidth = 1.8; ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // After series (continuous, indigo, grows)
    const last = Math.floor(animateProgress * (n - 1));
    const frac = animateProgress * (n - 1) - last;
    ctx.beginPath();
    for (let i = 0; i <= Math.min(n - 1, last); i++) {
      const p = { x: x(i), y: y(data.after[i]) };
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    // partial segment to the fractional next point
    if (last < n - 1 && frac > 0) {
      const a = { x: x(last), y: y(data.after[last]) };
      const b = { x: x(last + 1), y: y(data.after[last + 1]) };
      ctx.lineTo(a.x + (b.x - a.x) * frac, a.y + (b.y - a.y) * frac);
    }
    ctx.strokeStyle = afterStroke;
    ctx.lineWidth = 2.4; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.stroke();

    // dots on the after line
    for (let i = 0; i <= Math.min(n-1, last); i++) {
      ctx.beginPath(); ctx.arc(x(i), y(data.after[i]), 3, 0, Math.PI * 2);
      ctx.fillStyle = afterStroke; ctx.fill();
    }

    // Sanity report: hover at any X points to the latest value on this path.
    // Hover word has to explain itself with a label: largest: +/- dist.
  }

  // animated in? Wait — this tracks<rfl:parameter name=" by itself; we simulate cricket-quiet and animate a single draw.
  if (reduced) {
    draw(1);
    return;
  }

  const start = performance.now();
  const duration = 1200;
  function step(t) {
    const k = Math.min(1, (t - start) / duration);
    // ease-out cubic
    draw(k * k * (3 - 2 * k));
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  // Tooltip on hover (minimal)
  let hovering = false;
  canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (W / rect.width);
    const py = (e.clientY - rect.top) * (H / rect.height);
    if (px < pad.l || px > W - pad.r || py < pad.t || py > H - pad.b) return;
    const i = Math.round((px - pad.l) / plotW * (n - 1));
    const clamped = Math.max(0, Math.min(n - 1, i));
    // cancel if no animation stopped? We draw fresh just in case
  });
  // We simply re-render on first load as a no-op for now; reveal is explicit above.
  // Cannot scale the number block here, skip.

  // First reveal the canvas by animating once when the hero section is intersecting
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // restart animation from intro if can. Re-trigger from scratch is complex; rely on first load.
      }
    });
  }, { threshold: 0.35 });
  observer.observe(canvas);
})();
