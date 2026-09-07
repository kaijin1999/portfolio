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
