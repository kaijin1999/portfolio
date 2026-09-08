/* Galaxy Multiverse controller v2.1 — anime spiral galaxy */
(() => {
  const body=document.body, reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas=document.createElement('canvas');canvas.className='cosmos-canvas';canvas.setAttribute('aria-hidden','true');
  const haze=document.createElement('div');haze.className='cosmos-haze';haze.setAttribute('aria-hidden','true');body.prepend(haze);body.prepend(canvas);
  const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});let w=0,h=0,dpr=1,raf=0,last=0,galaxy=[],stars=[],rot=0;
  const palette=['#ffffff','#e8f6ff','#bfe5ff','#8fd5ff','#78efff','#ffd4ae','#ff9d73'];
  function build(){const mobile=w<640,count=mobile?650:w<1100?1100:1800,bgCount=mobile?46:90;galaxy=[];stars=[];
    for(let i=0;i<count;i++){const arm=i%4,p=Math.pow(Math.random(),.86),theta=p*10.9+arm*Math.PI/2+(Math.random()-.5)*(.16+p*.2),rad=p,hot=Math.random()<.045;
      galaxy.push({rad,theta,j:(Math.random()-.5)*(7+rad*18),s:(hot?1.5:.55)+Math.random()*(hot?1.7:1.25),a:.34+Math.random()*.64,c:palette[(Math.random()*palette.length)|0],tw:Math.random()*6.28,hot});}
    for(let i=0;i<bgCount;i++)stars.push({x:Math.random(),y:Math.random(),s:.3+Math.random()*1.1,a:.16+Math.random()*.5,tw:Math.random()*6.28});}
  function resize(){dpr=Math.min(devicePixelRatio||1,1.35);w=innerWidth;h=innerHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);build();}
  function spiralMist(cx,cy,R,sx,sy){ctx.save();ctx.globalCompositeOperation='lighter';for(let arm=0;arm<4;arm++){ctx.beginPath();for(let k=0;k<=100;k++){const p=k/100,a=p*10.9+arm*Math.PI/2+rot,r=p*R,x=cx+Math.cos(a)*r*sx,y=cy+Math.sin(a)*r*sy;k?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=arm%2?'rgba(118,206,255,.065)':'rgba(255,179,126,.045)';ctx.lineWidth=arm%2?9:6;ctx.stroke()}ctx.restore();}
  function core(cx,cy,R){const g=ctx.createRadialGradient(cx,cy,0,cx,cy,R*.19);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.08,'rgba(245,251,255,.96)');g.addColorStop(.25,'rgba(187,224,255,.58)');g.addColorStop(.58,'rgba(78,157,230,.16)');g.addColorStop(1,'rgba(30,80,150,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R*.19,0,Math.PI*2);ctx.fill();}
  function cross(x,y,s,a,c){ctx.globalAlpha=a;ctx.strokeStyle=c;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x-s*3.3,y);ctx.lineTo(x+s*3.3,y);ctx.moveTo(x,y-s*3.3);ctx.lineTo(x,y+s*3.3);ctx.stroke();}
  function draw(ts){if(document.hidden)return;const dt=Math.min(32,ts-last||16);last=ts;if(!reduce)rot+=dt*.00001;ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle='#02060b';ctx.fillRect(0,0,w,h);
    const mobile=w<700,cx=w*(mobile?.64:.43),cy=h*(mobile?.39:.47),R=Math.min(w,h)*(mobile?.78:.78),sx=1.24,sy=.61;
    const wash=ctx.createRadialGradient(cx,cy,R*.03,cx,cy,R*1.05);wash.addColorStop(0,'rgba(27,72,119,.3)');wash.addColorStop(.38,'rgba(6,28,50,.15)');wash.addColorStop(1,'rgba(2,6,11,0)');ctx.fillStyle=wash;ctx.fillRect(0,0,w,h);spiralMist(cx,cy,R,sx,sy);ctx.globalCompositeOperation='lighter';
    for(const s of stars){const tw=.55+.45*Math.sin(ts*.0012+s.tw);ctx.globalAlpha=s.a*tw;ctx.fillStyle='#bfe5ff';ctx.beginPath();ctx.arc(s.x*w,s.y*h,s.s,0,Math.PI*2);ctx.fill()}
    for(const p of galaxy){const a=p.theta+rot,rr=p.rad*R,x=cx+Math.cos(a)*rr*sx+p.j*Math.sin(a),y=cy+Math.sin(a)*rr*sy+p.j*Math.cos(a)*.48,tw=.62+.38*Math.sin(ts*.0015+p.tw);ctx.globalAlpha=p.a*tw*(1-p.rad*.18);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(x,y,p.s*(1.08-p.rad*.15),0,Math.PI*2);ctx.fill();if(p.hot)cross(x,y,p.s,p.a*.48,p.c)}
    core(cx,cy,R);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';raf=requestAnimationFrame(draw)}
  resize();addEventListener('resize',resize,{passive:true});if(reduce){draw(0);cancelAnimationFrame(raf)}else raf=requestAnimationFrame(draw);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!reduce){cancelAnimationFrame(raf);last=0;raf=requestAnimationFrame(draw)}});
  const heroVisual=document.querySelector('.hero__visual');if(heroVisual){const p=document.createElement('div');p.className='multiverse-portal';p.setAttribute('aria-hidden','true');heroVisual.prepend(p)}
  const hero=document.querySelector('.hero');if(hero){const chip=document.createElement('div');chip.className='universe-chip';chip.innerHTML='<i></i> GALAXY // MULTIVERSE';hero.appendChild(chip);const coord=document.createElement('div');coord.className='cosmic-coord';coord.innerHTML='SPIRAL SECTOR // 07-A<br>ANIME COSMIC ARCHIVE';hero.appendChild(coord)}
  const sections=[...document.querySelectorAll('main > .section')];sections.forEach((s,i)=>s.querySelector('.section__head')?.setAttribute('data-universe',String(i+1).padStart(2,'0')));
  const route=document.createElement('div');route.className='galaxy-route';route.setAttribute('aria-hidden','true');sections.forEach(()=>route.appendChild(document.createElement('i')));body.appendChild(route);const bars=[...route.children];
  const obs=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const i=sections.indexOf(e.target);bars.forEach((b,n)=>b.classList.toggle('is-hot',n===i))}),{rootMargin:'-38% 0px -48% 0px'});sections.forEach(s=>obs.observe(s));
})();
