/* AIS Motion — Advanced editorial interactions */
(()=>{
 const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const hover=matchMedia('(hover:hover) and (pointer:fine)').matches;
 const ids=['about','world','academics','life','stories','admissions'];
 const labels=['INTRO','AIS WORLD','ACADEMICS','LIFE','STORIES','ADMISSIONS'];
 // Side index
 if(innerWidth>900){
  const rail=document.createElement('aside'); rail.className='ais-side-index';
  ids.forEach((id,i)=>{const b=document.createElement('button');b.dataset.target=id;b.innerHTML=`<span>${labels[i]}</span>`;b.addEventListener('click',()=>document.getElementById(id)?.scrollIntoView({behavior:reduce?'auto':'smooth'}));rail.appendChild(b)});document.body.appendChild(rail);
  const obs=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;$$('.ais-side-index button').forEach(b=>b.classList.toggle('active',b.dataset.target===e.target.id))}),{rootMargin:'-40% 0px -45% 0px'});ids.map(id=>document.getElementById(id)).filter(Boolean).forEach(s=>obs.observe(s));
 }
 // Cursor
 if(hover&&!reduce){
  const c=document.createElement('div');c.className='ais-cursor';const d=document.createElement('div');d.className='ais-cursor-dot';document.body.append(c,d);
  let x=0,y=0,tx=0,ty=0;addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY});
  const loop=()=>{x+=(tx-x)*.18;y+=(ty-y)*.18;c.style.left=x+'px';c.style.top=y+'px';d.style.left=tx+'px';d.style.top=ty+'px';requestAnimationFrame(loop)};loop();
  $$('a,button,.gallery-card,.experience-card,.world-node,.hotspot').forEach(el=>{el.addEventListener('mouseenter',()=>c.classList.add('is-hover'));el.addEventListener('mouseleave',()=>c.classList.remove('is-hover'))});
 }
 // Scroll hint
 if(innerWidth>900){const hint=document.createElement('div');hint.className='ais-scroll-hint';hint.textContent='SCROLL';document.body.appendChild(hint)}
 // Editorial section transitions
 if(!reduce){
  const cards=$$('.experience-card,.story-card,.gallery-card');
  const cardObs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.style.setProperty('--enter','1');cardObs.unobserve(e.target)}}),{threshold:.12});cards.forEach(c=>cardObs.observe(c));
  addEventListener('scroll',()=>{const vh=innerHeight; $$('.journey-image,.campus-view,.hero-media').forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom>0&&r.top<vh){const p=(r.top-vh)/(vh+r.height);el.style.setProperty('--editorial-shift',(p*18).toFixed(2)+'px')}})},{passive:true});
 }
 // Make the values band pause while touched/hovered, useful on mobile and desktop
 $$('.value-track,.statement-track,.ticker-track').forEach(track=>{track.addEventListener('pointerenter',()=>track.style.animationPlayState='paused');track.addEventListener('pointerleave',()=>track.style.animationPlayState='running')});
 // Keyboard-friendly story cards
 $$('.story-card').forEach(card=>{card.tabIndex=0;card.addEventListener('keydown',e=>{if(e.key==='Enter'){card.querySelector('a')?.click()}})});
 // Add image loading polish
 $$('img').forEach(img=>{if(!img.hasAttribute('loading')&&!img.closest('.hero'))img.setAttribute('loading','lazy');img.addEventListener('load',()=>img.classList.add('is-loaded'),{once:true})});
})();
