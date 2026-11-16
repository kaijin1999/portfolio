// Deep-space backdrop for the landing page: a layered starfield with gentle
// parallax, occasional shooting stars, and a hero heading sized to the screen.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.createElement("canvas");
  canvas.id = "space-sky";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const tints = ["#ffffff", "#dfe9ff", "#cfe0ff", "#ffe9d6", "#e4d9ff", "#bff0ff"];
  let w = 0, h = 0, dpr = 1, stars = [], meteors = [];
  let pointerX = 0, pointerY = 0, easedX = 0, easedY = 0;
  let nextMeteor = performance.now() + 2500;

  function seed() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(700, (w * h) / 2600));
    stars = Array.from({ length: count }, () => {
      const depth = Math.random() ** 2.2; // most stars are far away
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.35 + depth * 1.45,
        depth,
        alpha: 0.35 + depth * 0.6,
        tint: tints[(Math.random() * tints.length) | 0],
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.6,
      };
    });
  }

  function launchMeteor(now) {
    const fromLeft = Math.random() < 0.5;
    meteors.push({
      x: fromLeft ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
      y: Math.random() * h * 0.35,
      vx: (fromLeft ? 1 : -1) * (7 + Math.random() * 5),
      vy: 3 + Math.random() * 2.5,
      life: 0,
      max: 55 + Math.random() * 30,
    });
    nextMeteor = now + 5000 + Math.random() * 7000;
  }

  function draw(now) {
    ctx.clearRect(0, 0, w, h);
    easedX += (pointerX - easedX) * 0.04;
    easedY += (pointerY - easedY) * 0.04;
    const scroll = scrollY;

    for (const s of stars) {
      const shift = 4 + s.depth * 26;
      let x = s.x - easedX * shift;
      let y = s.y - easedY * shift - scroll * (0.02 + s.depth * 0.12);
      x = ((x % w) + w) % w;
      y = ((y % h) + h) % h;
      const twinkle = reduce ? 1 : 0.7 + 0.3 * Math.sin(now * 0.001 * s.speed + s.phase);
      ctx.globalAlpha = s.alpha * twinkle;
      ctx.fillStyle = s.tint;
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.r > 1.45) { // a soft cross-glint on the brightest stars
        ctx.globalAlpha *= 0.35;
        ctx.fillRect(x - s.r * 3, y - 0.3, s.r * 6, 0.6);
        ctx.fillRect(x - 0.3, y - s.r * 3, 0.6, s.r * 6);
      }
    }

    if (!reduce) {
      if (now > nextMeteor) launchMeteor(now);
      meteors = meteors.filter((m) => m.life < m.max);
      for (const m of meteors) {
        m.life++; m.x += m.vx; m.y += m.vy;
        const fade = Math.sin((m.life / m.max) * Math.PI);
        const tail = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 14, m.y - m.vy * 14);
        tail.addColorStop(0, "rgba(220,245,255,0.95)");
        tail.addColorStop(0.3, "rgba(127,227,255,0.45)");
        tail.addColorStop(1, "rgba(123,60,255,0)");
        ctx.globalAlpha = fade;
        ctx.strokeStyle = tail;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 14, m.y - m.vy * 14);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  let frame = 0;
  function loop(now) {
    draw(now);
    frame = requestAnimationFrame(loop);
  }
  function start() {
    cancelAnimationFrame(frame);
    if (reduce) {
      draw(performance.now());
    } else {
      frame = requestAnimationFrame(loop);
    }
  }

  seed();
  start();
  let resizeTimer = 0;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { seed(); start(); fitHeading(); }, 150);
  });
  if (reduce) addEventListener("scroll", () => draw(performance.now()), { passive: true });
  if (matchMedia("(pointer: fine)").matches && !reduce) {
    addEventListener("pointermove", (e) => {
      pointerX = e.clientX / w - 0.5;
      pointerY = e.clientY / h - 0.5;
    }, { passive: true });
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(frame);
    else start();
  });

  // Size "Hi, I'm Jack" to fill the width, whichever font finally loads.
  function fitHeading() {
    const heading = document.querySelector(".hero h1");
    if (!heading) return false;
    heading.style.fontSize = "";
    const base = parseFloat(getComputedStyle(heading).fontSize);
    const target = document.documentElement.clientWidth * 0.94;
    const range = document.createRange();
    range.selectNodeContents(heading);
    const width = range.getBoundingClientRect().width;
    if (!width) return false;
    let size = base * (target / width);
    if (innerWidth >= 1024) size = Math.min(size, innerHeight * 0.24);
    heading.style.fontSize = `${size}px`;
    return true;
  }
  const watcher = new MutationObserver(() => {
    if (fitHeading()) watcher.disconnect();
  });
  if (!fitHeading()) watcher.observe(document.body, { childList: true, subtree: true });
  if (document.fonts) document.fonts.ready.then(fitHeading);
})();
