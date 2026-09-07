(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const body = document.body;
  body.classList.add('motion-ready');

  const progress = document.createElement('div');
  progress.className = 'manga-progress';
  progress.innerHTML = '<span></span>';
  body.appendChild(progress);

  const chapterTag = document.createElement('div');
  chapterTag.className = 'chapter-indicator';
  chapterTag.innerHTML = '<small>NOW READING</small><strong>CHAPTER 01</strong>';
  body.appendChild(chapterTag);

  const fxLayer = document.createElement('div');
  fxLayer.className = 'manga-fx-layer';
  fxLayer.setAttribute('aria-hidden', 'true');
  ['ゴゴゴ','ドン','ズン','バキ','ゴゴゴ'].forEach((txt, i) => {
    const s = document.createElement('span');
    s.textContent = txt;
    s.style.setProperty('--i', i);
    fxLayer.appendChild(s);
  });
  body.appendChild(fxLayer);

  if (!reduceMotion) {
    const intro = document.createElement('div');
    intro.className = 'manga-intro';
    intro.innerHTML = '<i></i><b>MANGA PORTFOLIO</b><em>3D CHARACTER ARTIST</em>';
    body.appendChild(intro);
    requestAnimationFrame(() => intro.classList.add('is-leaving'));
    setTimeout(() => intro.remove(), 1500);
  }

  if (finePointer && !reduceMotion) {
    const cursor = document.createElement('div');
    cursor.className = 'ink-cursor';
    cursor.innerHTML = '<span></span>';
    body.appendChild(cursor);
    let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; cursor.classList.add('is-on'); });
    const tick = () => {
      cx += (tx - cx) * .2; cy += (ty - cy) * .2;
      cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      requestAnimationFrame(tick);
    };
    tick();
    document.addEventListener('pointerover', e => cursor.classList.toggle('is-hot', !!e.target.closest('a,button,.card,.reel-card,.charbtn')));
  }

  const hero = document.querySelector('.hero');
  const heroVisual = document.querySelector('.hero__visual');
  const heroTitle = document.querySelector('.hero__title');
  if (hero && heroVisual && heroTitle && finePointer && !reduceMotion) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5;
      const ny = (e.clientY - r.top) / r.height - .5;
      hero.style.setProperty('--mx', nx.toFixed(3));
      hero.style.setProperty('--my', ny.toFixed(3));
      heroVisual.style.transform = `translate3d(${nx * 18}px,${ny * 12}px,0) rotate(${nx * .5}deg)`;
      heroTitle.style.transform = `translate3d(${nx * -7}px,${ny * -4}px,0)`;
    });
    hero.addEventListener('pointerleave', () => {
      heroVisual.style.transform = '';
      heroTitle.style.transform = '';
    });
  }

  document.addEventListener('pointermove', e => {
    const card = e.target.closest('.card,.reel-card');
    if (!card || !finePointer || reduceMotion) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.style.setProperty('--rx', `${(0.5 - y) * 6}deg`);
    card.style.setProperty('--ry', `${(x - 0.5) * 7}deg`);
    card.style.setProperty('--sx', `${x * 100}%`);
    card.style.setProperty('--sy', `${y * 100}%`);
  });
  document.addEventListener('pointerout', e => {
    const card = e.target.closest('.card,.reel-card');
    if (!card || e.relatedTarget?.closest?.('.card,.reel-card') === card) return;
    card.style.removeProperty('--rx');
    card.style.removeProperty('--ry');
  });

  const sections = [...document.querySelectorAll('main > .section')];
  const navLinks = [...document.querySelectorAll('.nav__links a')];
  const chapterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('chapter-live');
      const head = entry.target.querySelector('.section__head[data-chapter]');
      const label = head?.dataset.chapter || entry.target.id.replace('-', ' ').toUpperCase();
      chapterTag.querySelector('strong').textContent = label.split('·')[0].trim();
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-36% 0px -48% 0px', threshold: 0 });
  sections.forEach(section => chapterObserver.observe(section));

  document.addEventListener('click', e => {
    const hit = e.target.closest('.btn,.card,.reel-card,.vbtn,.charbtn');
    if (!hit || reduceMotion) return;
    const ink = document.createElement('i');
    ink.className = 'ink-impact';
    ink.style.left = `${e.clientX}px`;
    ink.style.top = `${e.clientY}px`;
    body.appendChild(ink);
    setTimeout(() => ink.remove(), 650);
  });

  let ticking = false;
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? scrollY / max : 0;
    progress.style.setProperty('--progress', pct.toFixed(4));
    body.style.setProperty('--scroll', scrollY.toFixed(0));
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScroll);
  }, { passive: true });
  updateScroll();

  document.querySelectorAll('.section__title').forEach((title, i) => {
    title.style.setProperty('--title-delay', `${i * 60}ms`);
  });

  const lightbox = document.getElementById('lightbox');
  new MutationObserver(() => body.classList.toggle('lightbox-open', lightbox?.classList.contains('is-open')))
    .observe(lightbox, { attributes: true, attributeFilter: ['class'] });
})();

/* Secondary manga-panel choreography */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.card').forEach((el, i) => {
    el.style.setProperty('--stagger', `${(i % 6) * 45}ms`);
  });
  const reels = [...document.querySelectorAll('.reel-card')];
  reels.forEach((el, i) => {
    el.classList.add('manga-pending');
    el.style.setProperty('--stagger', `${(i % 6) * 55}ms`);
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('manga-in');
      observer.unobserve(entry.target);
    });
  }, { threshold: .14 });
  reels.forEach(el => observer.observe(el));
})();

/* Scroll fallback for narrow/mobile layouts */
(() => {
  const reels = [...document.querySelectorAll('.reel-card.manga-pending')];
  if (!reels.length) return;
  const revealVisible = () => {
    const h = window.innerHeight;
    reels.forEach(el => {
      if (el.classList.contains('manga-in')) return;
      const r = el.getBoundingClientRect();
      if (r.top < h * .94 && r.bottom > 0) el.classList.add('manga-in');
    });
  };
  addEventListener('scroll', revealVisible, { passive: true });
  addEventListener('resize', revealVisible, { passive: true });
  requestAnimationFrame(revealVisible);
})();

/* Shattered Dimension controller v13 */
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;
  const world = document.createElement('div');
  world.className = 'dimension-world';
  world.setAttribute('aria-hidden', 'true');
  world.innerHTML = `
    <svg class="dimension-cracks" viewBox="0 0 1440 900" preserveAspectRatio="none">
      <path pathLength="1" class="c1" d="M1370 -20 L1260 92 L1288 156 L1190 244 L1218 322 L1090 425 L1130 514 L1010 618 L1048 705 L920 920"/>
      <path pathLength="1" class="c1" d="M80 920 L176 806 L146 738 L252 626 L224 554 L345 448 L314 370 L438 252 L409 178 L515 -20"/>
      <path pathLength="1" class="c2" d="M1260 92 L1170 72 L1122 18 M1190 244 L1098 211 L1032 232 M1090 425 L1010 388 L962 340 M1130 514 L1205 548 L1268 532"/>
      <path pathLength="1" class="c2" d="M176 806 L250 828 L314 806 M252 626 L334 650 L390 620 M345 448 L418 416 L472 438 M438 252 L520 278 L576 244"/>
      <path pathLength="1" class="c3" d="M720 -20 L690 104 L742 188 L704 286 L762 372 L716 468 L778 568 L730 676 L790 920"/>
    </svg>`;
  document.body.prepend(world);
  const glyphs = ['バキッ', 'メキッ', 'ズズズ', 'ドォン'];
  const riftMarkup = `
    <svg viewBox="0 0 300 300" aria-hidden="true">
      <path pathLength="1" class="r-main" d="M150 150 L140 120 L128 105 L135 82 L112 61 L120 36 M150 150 L168 132 L180 108 L204 101 L218 78 L250 65 M150 150 L135 169 L110 179 L97 205 L65 220 M150 150 L171 170 L192 184 L202 216 L230 239"/>
      <path pathLength="1" class="r-violet" d="M140 120 L116 112 L100 93 M135 82 L154 65 L160 42 M180 108 L174 83 L190 62 M204 101 L231 111 L252 102 M110 179 L82 171 L59 184 M97 205 L113 232 L106 256 M192 184 L220 173 L244 183 M202 216 L184 240 L190 266"/>
      <path pathLength="1" class="r-red" d="M150 150 L157 112 L150 90 M150 150 L121 145 L98 132 M150 150 L163 193 L154 219"/>
      <path pathLength="1" class="r-gold" d="M150 150 L192 145 L224 132 M150 150 L126 191 L124 231"/>
    </svg>`;

  function burstRift(x, y, scale = 1, glyph = '') {
    if (scale > .65) {
      document.body.classList.remove('dimension-shock');
      void document.body.offsetWidth;
      document.body.classList.add('dimension-shock');
      setTimeout(() => document.body.classList.remove('dimension-shock'), 430);
    }
    const rift = document.createElement('div');
    rift.className = 'dimension-break';
    rift.style.setProperty('--rift-x', `${x}px`);
    rift.style.setProperty('--rift-y', `${y}px`);
    rift.style.setProperty('--rift-scale', scale);
    rift.innerHTML = riftMarkup;
    const shardCount = innerWidth < 640 ? 6 : 11;
    for (let i = 0; i < shardCount; i++) {
      const shard = document.createElement('i');
      shard.className = 'dimension-shard';
      const angle = (Math.PI * 2 * i / shardCount) + (Math.random() - .5) * .45;
      const dist = 70 + Math.random() * 105;
      shard.style.setProperty('--sx', `${Math.cos(angle) * dist}px`);
      shard.style.setProperty('--sy', `${Math.sin(angle) * dist}px`);
      shard.style.setProperty('--spin', `${(Math.random() * 260 - 130).toFixed(0)}deg`);
      shard.style.setProperty('--sr', `${(Math.random() * 100 - 50).toFixed(0)}deg`);
      shard.style.setProperty('--sw', `${10 + Math.random() * 18}px`);
      shard.style.setProperty('--sh', `${20 + Math.random() * 34}px`);
      shard.style.setProperty('--sd', `${Math.random() * 90}ms`);
      rift.appendChild(shard);
    }
    const fx = document.createElement('b');
    fx.className = 'dimension-glyph';
    fx.textContent = glyph || glyphs[Math.floor(Math.random() * glyphs.length)];
    rift.appendChild(fx);
    const flash = document.createElement('i');
    flash.className = 'dimension-flash';
    flash.style.setProperty('--fx', `${x}px`);
    flash.style.setProperty('--fy', `${y}px`);
    document.body.append(flash, rift);
    setTimeout(() => flash.remove(), 520);
    setTimeout(() => rift.remove(), 1700);
  }

  window.__burstRift = burstRift;
  const triggered = new WeakSet();
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || triggered.has(entry.target)) return;
      triggered.add(entry.target);
      const y = innerHeight * (.28 + Math.random() * .38);
      const x = innerWidth * (innerWidth < 700 ? .78 : .84);
      setTimeout(() => burstRift(x, y, innerWidth < 700 ? .7 : .95), 120);
    });
  }, { threshold: .28, rootMargin: '-8% 0px -20% 0px' });
  // Chapter bursts are synchronized below with the existing chapter-live state.
  let worldTicking = false;
  addEventListener('scroll', () => {
    if (worldTicking) return;
    worldTicking = true;
    requestAnimationFrame(() => {
      world.style.transform = `translate3d(0,${(-scrollY * .018).toFixed(1)}px,0)`;
      worldTicking = false;
    });
  }, { passive: true });

  document.addEventListener('click', e => {
    const hit = e.target.closest('.btn,.vbtn,.charbtn,.social a');
    if (!hit) return;
    burstRift(e.clientX, e.clientY, innerWidth < 700 ? .42 : .52, 'メキッ');
  });

  addEventListener('load', () => {
    setTimeout(() => burstRift(innerWidth * .74, innerHeight * .38, innerWidth < 700 ? .62 : .88, 'バキッ'), 1550);
  }, { once: true });
})();

/* Sync dimension breaks to the active manga chapter. */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || typeof window.__burstRift !== 'function') return;
  const lastBurst = new WeakMap();
  const fireFor = section => {
    const now = performance.now();
    if (now - (lastBurst.get(section) || 0) < 2400) return;
    lastBurst.set(section, now);
    const head = section.querySelector('.section__head') || section;
    const rect = head.getBoundingClientRect();
    const y = Math.max(155, Math.min(innerHeight - 155, rect.top + Math.min(rect.height * .72, 220)));
    const x = innerWidth * (innerWidth < 700 ? .78 : .84);
    window.__burstRift(x, y, innerWidth < 700 ? .68 : .92);
  };
  const chapterMutation = new MutationObserver(records => {
    records.forEach(record => {
      const section = record.target;
      if (section.classList.contains('chapter-live')) fireFor(section);
    });
  });
  document.querySelectorAll('.section').forEach(section => {
    chapterMutation.observe(section, { attributes: true, attributeFilter: ['class'] });
    if (section.classList.contains('chapter-live')) fireFor(section);
  });
})();
