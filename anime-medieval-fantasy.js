/* Anime Medieval Fantasy — lightweight atmosphere */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const layer = document.createElement('div');
  layer.className = 'fantasy-ambient';
  layer.setAttribute('aria-hidden', 'true');
  const count = reduce ? 8 : 24;
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('i');
    const r = (a,b) => a + Math.random() * (b-a);
    spark.style.setProperty('--x', `${r(2,98).toFixed(1)}%`);
    spark.style.setProperty('--y', `${r(15,100).toFixed(1)}%`);
    spark.style.setProperty('--s', `${r(1,2.8).toFixed(1)}px`);
    spark.style.setProperty('--o', r(.18,.55).toFixed(2));
    spark.style.setProperty('--d', `${r(9,19).toFixed(1)}s`);
    spark.style.setProperty('--delay', `${-r(0,18).toFixed(1)}s`);
    spark.style.setProperty('--drift', `${r(-28,28).toFixed(0)}px`);
    layer.appendChild(spark);
  }
  document.body.prepend(layer);
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', e => {
      document.documentElement.style.setProperty('--mx', ((e.clientX / innerWidth)-.5).toFixed(3));
      document.documentElement.style.setProperty('--my', ((e.clientY / innerHeight)-.5).toFixed(3));
    }, {passive:true});
  }
  const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('fantasy-awake'); io.unobserve(e.target); } }), {threshold:.12});
  document.querySelectorAll('.section').forEach(s => io.observe(s));
})();
