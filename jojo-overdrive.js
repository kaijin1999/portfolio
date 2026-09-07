/* JOJO-inspired Overdrive controller v1 — original procedural soundtrack */
(() => {
  const body=document.body, reduce=matchMedia('(prefers-reduced-motion: reduce)').matches, fine=matchMedia('(pointer:fine)').matches;
  body.classList.add('jojo-overdrive');
  ['jojo-aura','jojo-speedlines','jojo-vignette'].forEach(c=>{const el=document.createElement('div');el.className=c;el.setAttribute('aria-hidden','true');body.prepend(el)});
  const hero=document.querySelector('.hero'); if(hero){const s=document.createElement('div');s.className='jojo-hero-stamp';s.innerHTML='<i></i> BIZARRE DIMENSION // PORTFOLIO 2026';hero.appendChild(s)}
  const panel=document.createElement('aside'); panel.className='stand-console'; panel.setAttribute('aria-label','Artist power profile');
  panel.innerHTML='<div class="stand-console__head"><b>POLYGON SOUL</b><span>STAND PROFILE</span></div><div class="stand-stat"><span>Modeling</span><i style="--stat:96%"></i><b>A</b></div><div class="stand-stat"><span>Rigging</span><i style="--stat:88%"></i><b>A</b></div><div class="stand-stat"><span>Style</span><i style="--stat:100%"></i><b>∞</b></div>';
  body.appendChild(panel);
  const music=document.createElement('button'); music.className='jojo-music'; music.type='button'; music.setAttribute('aria-pressed','false');
  music.innerHTML='<span class="jojo-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span><b>MUSIC // OFF</b><small>ORIGINAL BIZARRE BATTLE THEME</small></span>';
  body.appendChild(music);
  let raf=0; if(fine&&!reduce)addEventListener('pointermove',e=>{if(raf)return;raf=requestAnimationFrame(()=>{body.style.setProperty('--jx',`${(e.clientX/innerWidth*100).toFixed(1)}%`);body.style.setProperty('--jy',`${(e.clientY/innerHeight*100).toFixed(1)}%`);raf=0})},{passive:true});
  const words=['ゴゴゴ','ドドド','ズキュン','バァン'];
  function impact(x=innerWidth*.5,y=innerHeight*.5){if(reduce)return;body.classList.remove('jojo-impact');void body.offsetWidth;body.classList.add('jojo-impact');setTimeout(()=>body.classList.remove('jojo-impact'),390);const w=document.createElement('b');w.className='jojo-whisper';w.textContent=words[Math.floor(Math.random()*words.length)];w.style.left=`${Math.max(10,Math.min(innerWidth-170,x-45))}px`;w.style.top=`${Math.max(80,Math.min(innerHeight-100,y-40))}px`;body.appendChild(w);setTimeout(()=>w.remove(),1300)}
  document.addEventListener('click',e=>{if(e.target.closest('.card,.reel-card,.btn,.vbtn,.charbtn,.nav__links a')&&!e.target.closest('.jojo-music'))impact(e.clientX,e.clientY)});
  let ctx=null,master=null,timer=null,step=0,noiseBuffer=null; const tempo=138,stepMs=60000/tempo/2;
  const hz=m=>440*Math.pow(2,(m-69)/12);
  function ensureAudio(){if(ctx)return;ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=.55;const comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=18;comp.ratio.value=4;comp.attack.value=.006;comp.release.value=.18;master.connect(comp).connect(ctx.destination);noiseBuffer=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=noiseBuffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  function tone(m,d=.16,w='sawtooth',v=.035,cut=1500){const o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain(),t=ctx.currentTime;o.type=w;o.frequency.value=hz(m);f.type='lowpass';f.frequency.value=cut;f.Q.value=2.2;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(f).connect(g).connect(master);o.start(t);o.stop(t+d+.03)}
  function kick(){const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime;o.type='sine';o.frequency.setValueAtTime(145,t);o.frequency.exponentialRampToValueAtTime(44,t+.17);g.gain.setValueAtTime(.24,t);g.gain.exponentialRampToValueAtTime(.0001,t+.18);o.connect(g).connect(master);o.start(t);o.stop(t+.19);body.classList.add('jojo-beat');setTimeout(()=>body.classList.remove('jojo-beat'),92)}
  function noise(d=.08,v=.028,cut=5000,type='highpass'){const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(),t=ctx.currentTime;s.buffer=noiseBuffer;f.type=type;f.frequency.value=cut;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f).connect(g).connect(master);s.start(t);s.stop(t+d+.01)}
  const bass=[38,38,41,38,36,36,41,43,38,38,45,43,36,36,33,37],arp=[62,65,69,72,65,69,74,72,62,67,70,74,65,69,72,77];
  function musicStep(){if(!ctx)return; if([0,4,8,12].includes(step))kick(); if([4,12].includes(step))noise(.14,.05,900,'bandpass'); noise(.035,step%2?.012:.02,6200,'highpass');tone(bass[step],.2,'square',.028,520);tone(arp[step],.095,step%4===0?'sawtooth':'triangle',.018,2400);if(step===0||step===8){[50,53,57].forEach((n,i)=>setTimeout(()=>tone(n,.55,'sawtooth',.009,900+i*180),i*8))}step=(step+1)%16}
  function setMusicUI(on){music.classList.toggle('is-playing',on);music.setAttribute('aria-pressed',String(on));music.querySelector('b').textContent=on?'MUSIC // ON':'MUSIC // OFF'}
  async function startMusic(){ensureAudio();if(ctx.state==='suspended')await ctx.resume();if(timer)return;step=0;musicStep();timer=setInterval(musicStep,stepMs);setMusicUI(true);impact(innerWidth*.78,innerHeight*.72)}
  function stopMusic(){if(timer){clearInterval(timer);timer=null}if(ctx)master.gain.setTargetAtTime(.0001,ctx.currentTime,.04);setTimeout(()=>{if(master)master.gain.value=.55},120);setMusicUI(false)}
  music.addEventListener('click',()=>timer?stopMusic():startMusic());
  let lastWhisper=0;addEventListener('scroll',()=>{if(reduce)return;const now=performance.now();if(now-lastWhisper<2600)return;const p=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);if(p>.08&&Math.random()>.78){lastWhisper=now;const w=document.createElement('b');w.className='jojo-whisper';w.textContent='ゴゴゴ';w.style.left=`${Math.random()>.5?6:78}%`;w.style.top=`${22+Math.random()*54}%`;body.appendChild(w);setTimeout(()=>w.remove(),1300)}},{passive:true});
  addEventListener('keydown',e=>{if((e.key==='m'||e.key==='M')&&!/INPUT|TEXTAREA/.test(document.activeElement?.tagName||'')){e.preventDefault();timer?stopMusic():startMusic()}});
  addEventListener('load',()=>{if(!reduce)setTimeout(()=>impact(innerWidth*.67,innerHeight*.33),1850)},{once:true});
})();
