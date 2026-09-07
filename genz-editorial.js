/* Gen Z Editorial controller v1 */
(() => {
  const body=document.body, reduce=matchMedia('(prefers-reduced-motion: reduce)').matches, fine=matchMedia('(pointer:fine)').matches;
  body.classList.add('genz-editorial');
  const grid=document.createElement('div'); grid.className='genz-grid'; grid.setAttribute('aria-hidden','true'); body.prepend(grid);
  const nav=document.querySelector('.nav');
  const ticker=document.createElement('div'); ticker.className='genz-ticker'; ticker.setAttribute('aria-hidden','true');
  const copy='3D CHARACTER ARTIST // ROBLOX UGC // RIGGING // REAL-TIME // STYLIZED // AVAILABLE FOR WORK //';
  ticker.innerHTML=`<div class="genz-ticker__track"><span>${copy}</span><span>${copy}</span></div>`; nav?.insertAdjacentElement('afterend',ticker);
  const heroInner=document.querySelector('.hero__inner'); if(heroInner){const tags=document.createElement('div');tags.className='genz-hero-tags';tags.innerHTML='<span>Blender Native</span><span>Game Ready</span><span>Realtime Artist</span><span>Thailand / Worldwide</span>';(heroInner.querySelector('.hero__cta')||heroInner).before(tags)}
  const status=document.createElement('div');status.className='genz-status';status.innerHTML='<i></i> portfolio online / open to opportunities';body.appendChild(status);
  document.querySelectorAll('.cat__title').forEach((el,i)=>el.dataset.index=String(i+1).padStart(2,'0'));
  document.querySelectorAll('.card,.reel-card').forEach((el,i)=>el.dataset.genzIndex=String(i+1).padStart(2,'0'));
  if(fine&&!reduce){body.classList.add('genz-tilt');let raf=0;addEventListener('pointermove',e=>{if(raf)return;raf=requestAnimationFrame(()=>{body.style.setProperty('--gx',`${(e.clientX/innerWidth*100).toFixed(1)}%`);body.style.setProperty('--gy',`${(e.clientY/innerHeight*100).toFixed(1)}%`);raf=0})},{passive:true})}
})();
