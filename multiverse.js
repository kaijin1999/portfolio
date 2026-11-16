// The timeline loom: one prime timeline in amber light, with variant timelines
// branching off it, sparks travelling along them, and the odd nexus flare.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.createElement("canvas");
  canvas.id = "timeline-loom";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const colors = {
    prime: [255, 177, 59],
    hot: [255, 240, 196],
    jade: [94, 230, 168],
    violet: [154, 107, 255],
    ember: [255, 122, 48],
  };
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  let w = 0, h = 0, dpr = 1, strands = [], sparks = [], stars = [], flares = [];
  let nextFlare = performance.now() + 3000;

  const rand = (a, b) => a + Math.random() * (b - a);
  const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const narrow = w < 760;
    const prime = { parent: null, branchAt: 0, spread: 0, color: colors.prime, width: 2.2, alpha: 0.9, seed: rand(0, 99), base: 0.52 };
    strands = [prime];
    const variantColors = [colors.prime, colors.prime, colors.ember, colors.jade, colors.violet];
    const count = narrow ? 9 : 16;
    for (let i = 0; i < count; i++) {
      const parent = i < 6 ? prime : strands[1 + ((Math.random() * Math.min(i, 6)) | 0)];
      strands.push({
        parent,
        branchAt: rand(0.06, 0.88),
        spread: (Math.random() < 0.5 ? -1 : 1) * rand(0.05, 0.3) * h,
        color: variantColors[(Math.random() * variantColors.length) | 0],
        width: rand(0.7, 1.5),
        alpha: rand(0.28, 0.6),
        seed: rand(0, 99),
        length: rand(0.12, 0.3),
      });
    }
    sparks = Array.from({ length: narrow ? 26 : 50 }, () => ({
      strand: (Math.random() * strands.length) | 0,
      t: Math.random(),
      speed: rand(0.0006, 0.0022),
    }));
    stars = Array.from({ length: Math.round((w * h) / 5200) }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: rand(0.3, 1.1), a: rand(0.15, 0.55), p: rand(0, 6.28),
    }));
  }

  // y position of a strand at horizontal fraction t (0..1)
  function yAt(s, t, time) {
    const drift = Math.sin(t * 5.1 + s.seed + time * 0.00018) * h * 0.018
      + Math.sin(t * 13.7 + s.seed * 2 + time * 0.00031) * h * 0.006;
    if (!s.parent) return h * s.base + drift + Math.sin(t * 2.2 + time * 0.0001) * h * 0.04;
    const parentY = yAt(s.parent, t, time);
    const k = smooth((t - s.branchAt) / s.length);
    return parentY + s.spread * k + drift * k;
  }

  function strandPath(s, time, from) {
    ctx.beginPath();
    const steps = 90;
    for (let i = 0; i <= steps; i++) {
      const t = from + (1 - from) * (i / steps);
      const x = t * w, y = yAt(s, t, time);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
  }

  function draw(time) {
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);
    const vignette = ctx.createRadialGradient(w * 0.5, h * 0.52, 0, w * 0.5, h * 0.52, Math.max(w, h) * 0.7);
    vignette.addColorStop(0, "rgba(40,18,6,0.35)");
    vignette.addColorStop(0.5, "rgba(14,8,18,0.15)");
    vignette.addColorStop(1, "rgba(7,5,11,0)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    for (const s of stars) {
      ctx.globalAlpha = s.a * (reduce ? 1 : 0.65 + 0.35 * Math.sin(time * 0.0011 + s.p));
      ctx.fillStyle = "#f5ecdc";
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const s of strands) {
      const from = s.parent ? s.branchAt : 0;
      strandPath(s, time, from);
      ctx.strokeStyle = rgba(s.color, s.alpha * 0.16);
      ctx.lineWidth = s.width * 9;
      ctx.stroke();
      ctx.strokeStyle = rgba(s.color, s.alpha * 0.35);
      ctx.lineWidth = s.width * 3.2;
      ctx.stroke();
      ctx.strokeStyle = rgba(s === strands[0] ? colors.hot : s.color, s.alpha);
      ctx.lineWidth = s.width;
      ctx.stroke();
      if (s.parent) { // the branch point glows like a small nexus
        const bx = s.branchAt * w, by = yAt(s, s.branchAt, time);
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, 10);
        g.addColorStop(0, rgba(colors.hot, 0.55 * s.alpha));
        g.addColorStop(1, rgba(s.color, 0));
        ctx.fillStyle = g;
        ctx.fillRect(bx - 10, by - 10, 20, 20);
      }
    }

    for (const p of sparks) {
      const s = strands[p.strand];
      const from = s.parent ? s.branchAt : 0;
      if (!reduce) p.t += p.speed;
      if (p.t > 1) { p.t = 0; p.strand = (Math.random() * strands.length) | 0; }
      const t = from + (1 - from) * p.t;
      const x = t * w, y = yAt(s, t, time);
      const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
      g.addColorStop(0, rgba(colors.hot, 0.9));
      g.addColorStop(0.4, rgba(s.color, 0.45));
      g.addColorStop(1, rgba(s.color, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x - 7, y - 7, 14, 14);
    }

    if (!reduce) {
      if (time > nextFlare) {
        const s = strands[1 + ((Math.random() * (strands.length - 1)) | 0)];
        flares.push({ s, born: time });
        nextFlare = time + rand(2500, 6000);
      }
      flares = flares.filter((f) => time - f.born < 1600);
      for (const f of flares) {
        const age = (time - f.born) / 1600;
        const x = f.s.branchAt * w, y = yAt(f.s, f.s.branchAt, time);
        ctx.strokeStyle = rgba(colors.hot, 0.7 * (1 - age));
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 6 + age * 60, 0, Math.PI * 2);
        ctx.stroke();
        strandPath(f.s, time, f.s.branchAt);
        ctx.strokeStyle = rgba(f.s.color, 0.5 * (1 - age));
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = "source-over";
  }

  let frame = 0;
  const loop = (time) => { draw(time); frame = requestAnimationFrame(loop); };
  function start() {
    cancelAnimationFrame(frame);
    if (reduce) draw(0);
    else frame = requestAnimationFrame(loop);
  }
  build();
  start();
  let timer = 0;
  addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => { build(); start(); }, 150);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(frame);
    else start();
  });
})();
