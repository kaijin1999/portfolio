/* Geometric ink fractures: no layout movement or continuous JS render loop. */
(() => {
  const hero = document.querySelector('.hero__visual');
  if (!hero) return;
  const ns = 'http://www.w3.org/2000/svg';
  const layer = document.createElement('div');
  layer.className = 'rift-scene'; layer.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 600 700'); svg.setAttribute('preserveAspectRatio', 'none');
  const paths = ['M310 350 L258 291 L276 246 L212 191 L231 145 L157 72 L170 0','M310 350 L361 300 L352 259 L420 223 L407 163 L489 117 L510 0','M310 350 L380 369 L416 345 L489 393 L550 367 L600 406','M310 350 L277 406 L297 452 L222 511 L244 559 L153 623 L137 700','M310 350 L367 424 L355 482 L437 533 L419 603 L487 700','M310 350 L229 366 L193 337 L129 386 L91 368 L0 422','M212 191 L166 207 L129 166 L61 177','M420 223 L467 250 L511 219 L600 250','M222 511 L162 496 L136 546 L60 566','M437 533 L488 514 L531 560 L600 546','M258 291 L213 267 L161 283','M367 424 L420 450 L466 435'];
  paths.forEach((d, i) => { const path = document.createElementNS(ns, 'path'); path.setAttribute('d', d); path.setAttribute('pathLength', '1'); path.style.setProperty('--delay', (i * .065) + 's'); svg.appendChild(path); });
  layer.appendChild(svg);
  for (let i=0; i<14; i++) { const shard=document.createElement('i'); shard.className='rift-fragment'; const a=i*2.399; shard.style.cssText='--x:'+ (50+Math.cos(a)*48)+'%;--y:'+(50+Math.sin(a)*45)+'%;--angle:'+(i*39)+'deg;--delay:'+(-i*.71)+'s;--size:'+(18+i%4*12)+'px'; layer.appendChild(shard); }
  hero.prepend(layer);
  const lines=document.createElement('div'); lines.className='ink-speedlines'; lines.setAttribute('aria-hidden','true'); hero.prepend(lines);
  const control=document.createElement('button'); control.type='button'; control.className='motion-control'; control.textContent='Motion: On'; control.setAttribute('aria-label','Toggle decorative animation'); document.body.appendChild(control);
  const media=matchMedia('(prefers-reduced-motion: reduce)'); let enabled=!media.matches;
  const apply=()=>{document.body.classList.toggle('rift-paused',!enabled);control.textContent='Motion: '+(enabled?'On':'Off');control.setAttribute('aria-pressed',String(enabled));};
  control.addEventListener('click',()=>{enabled=!enabled;apply();}); media.addEventListener('change',()=>{enabled=!media.matches;apply();}); apply();
  requestAnimationFrame(()=>document.body.classList.add('rift-ready'));
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('ink-arrived');observer.unobserve(entry.target);}}),{threshold:.12});
  document.querySelectorAll('.section__head,.dio-feature').forEach(el=>{el.classList.add('ink-chapter');observer.observe(el);});
  const visibility=new IntersectionObserver(entries=>entries.forEach(entry=>hero.classList.toggle('rift-offscreen',!entry.isIntersecting)));
  visibility.observe(hero);
  document.addEventListener('visibilitychange',()=>document.body.classList.toggle('rift-hidden',document.hidden));
})();
