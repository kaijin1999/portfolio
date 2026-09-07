/* Gentle chapter motion; respect the visitor's motion preference. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.body.classList.add('motion-ready');
  const sections = document.querySelectorAll('main > .section');
  const links = document.querySelectorAll('.nav__links a');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('chapter-live');
      links.forEach(link => link.classList.toggle('is-active', link.hash === '#' + entry.target.id));
    });
  }, { rootMargin: '-15% 0px -60% 0px' });
  sections.forEach(section => observer.observe(section));
  document.querySelectorAll('.card,.reel-card').forEach(card => {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Open ' + (card.dataset.title || card.querySelector('figcaption')?.textContent.trim() || 'artwork'));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); card.click(); }
    });
  });
  links.forEach(link => link.addEventListener('click', () => document.querySelector('.nav__toggle')?.setAttribute('aria-expanded', 'false')));
  const videos = document.querySelectorAll('.reel-card video');
  const videoObserver = new IntersectionObserver(entries => entries.forEach(({target, isIntersecting}) => {
    if (isIntersecting && !reduced.matches) target.play().catch(() => {});
    else target.pause();
  }), { rootMargin: '100px' });
  videos.forEach(video => { video.removeAttribute('autoplay'); video.pause(); videoObserver.observe(video); });
})();
