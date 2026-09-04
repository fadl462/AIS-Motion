const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];

const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover=window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Opening sequence
const loader=$('#loader');
window.addEventListener('load',()=>setTimeout(()=>loader?.classList.add('done'),reduceMotion?250:1050),{once:true});
setTimeout(()=>loader?.classList.add('done'),3500);

// Navigation: compact state, progress indicator and active section
const nav=$('#nav');
const progress=document.createElement('div');
progress.className='scroll-progress';
document.body.appendChild(progress);
const sections=$$('main > section[id]');
const navLinks=$$('.nav-links a');
function updateNav(){
  const max=document.documentElement.scrollHeight-innerHeight;
  progress.style.setProperty('--progress',max>0?`${Math.min(100,Math.max(0,scrollY/max*100))}%`:'0%');
  nav?.classList.toggle('scrolled',scrollY>55);
}
window.addEventListener('scroll',updateNav,{passive:true});
updateNav();
const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${entry.target.id}`));
}),{rootMargin:'-30% 0px -55% 0px',threshold:0});
sections.forEach(s=>sectionObserver.observe(s));

// Scroll reveals
const io=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
}),{threshold:.12});
$$('.reveal').forEach(el=>io.observe(el));

// Ambient pointer response
if(canHover&&!reduceMotion){
  window.addEventListener('pointermove',e=>{
    const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;
    document.documentElement.style.setProperty('--mx',x.toFixed(3));
    document.documentElement.style.setProperty('--my',y.toFixed(3));
    $$('.ambient').forEach((el,i)=>el.style.transform=`translate(${x*(i+1)*18}px,${y*(i+1)*18}px)`);
  },{passive:true});
}

// Particle field
const particleHost=$('#particles');
const particleCount=canHover&&!reduceMotion?58:24;
if(particleHost){
  for(let i=0;i<particleCount;i++){
    const s=document.createElement('span');
    s.className='particle';
    s.style.setProperty('--x',`${Math.random()*100}%`);
    s.style.setProperty('--y',`${Math.random()*100}%`);
    s.style.setProperty('--size',`${1+Math.random()*2}px`);
    s.style.setProperty('--alpha',`${.12+Math.random()*.42}`);
    s.style.setProperty('--duration',`${8+Math.random()*14}s`);
    s.style.setProperty('--delay',`${-Math.random()*14}s`);
    particleHost.appendChild(s);
  }
}

// Magnetic controls — deliberately excludes the floating admissions card so its own motion stays smooth
if(canHover&&!reduceMotion){
  $$('.magnetic:not(.admission-float)').forEach(b=>{
    b.addEventListener('pointermove',e=>{
      const r=b.getBoundingClientRect();
      const x=(e.clientX-r.left-r.width/2)*.10;
      const y=(e.clientY-r.top-r.height/2)*.10;
      b.style.setProperty('--mag-x',`${x}px`);b.style.setProperty('--mag-y',`${y}px`);
    });
    b.addEventListener('pointerleave',()=>{b.style.setProperty('--mag-x','0px');b.style.setProperty('--mag-y','0px')});
  });
}

// AIS World nodes
const panel=$('#worldPanel');
const data={
  academics:['ACADEMICS','Nursery, KG, Primary and Junior High School — a journey designed to build strong foundations.'],
  life:['SCHOOL LIFE','Sports, clubs, events, culture and student activities create a campus that stays in motion.'],
  character:['CHARACTER','Values, discipline and personal development turn knowledge into confidence and responsibility.'],
  service:['SERVICE','Community, responsibility and contribution connect learning to the world beyond AIS.']
};
$$('.world-node').forEach(n=>n.addEventListener('click',()=>{
  $$('.world-node').forEach(x=>x.classList.remove('active'));
  n.classList.add('active');
  const d=data[n.dataset.panel];
  panel.innerHTML=`<div class="panel-kicker">AIS WORLD / ${n.querySelector('strong').textContent}</div><h3>${d[0]}</h3><p>${d[1]}</p>`;
}));

// Academic journey
const items=$$('.journey-item'),img=$('#journeyImage'),jt=$('#journeyText'),prog=$('.journey-progress span');
let journeyTimer;
function setJourney(i){
  if(!items[i]||!img||!jt)return;
  items.forEach(x=>x.classList.remove('active'));items[i].classList.add('active');
  if(prog)prog.style.width=`${(i/(items.length-1))*100}%`;
  img.classList.add('changing');
  clearTimeout(journeyTimer);
  journeyTimer=setTimeout(()=>{
    img.src=items[i].dataset.img;
    img.alt=`AIS ${items[i].dataset.stage.toLowerCase()} learners`;
    jt.textContent=items[i].dataset.text;
    img.classList.remove('changing');
  },reduceMotion?0:180);
}
items.forEach((x,i)=>x.addEventListener('click',()=>setJourney(i)));

// Campus pan / zoom with bounded movement
const view=$('#campusView'),ci=$('#campusImage');
let scale=1,dx=0,dy=0,drag=false,sx=0,sy=0,ox=0,oy=0;
function clamp(){
  if(!view||!ci)return;
  const maxX=Math.max(0,(ci.offsetWidth*scale-view.clientWidth)/2);
  const maxY=Math.max(0,(ci.offsetHeight*scale-view.clientHeight)/2);
  dx=Math.max(-maxX,Math.min(maxX,dx));dy=Math.max(-maxY,Math.min(maxY,dy));
}
function render(){clamp();if(ci)ci.style.transform=`translate3d(${dx}px,${dy}px,0) scale(${scale})`;view?.classList.toggle('is-zoomed',scale>1.02)}
view?.addEventListener('pointerdown',e=>{
  if(e.target.closest('.hotspot'))return;
  drag=true;sx=e.clientX;sy=e.clientY;ox=dx;oy=dy;view.setPointerCapture(e.pointerId);view.classList.add('dragging');
});
view?.addEventListener('pointermove',e=>{if(!drag)return;dx=ox+(e.clientX-sx);dy=oy+(e.clientY-sy);render()});
view?.addEventListener('pointerup',()=>{drag=false;view.classList.remove('dragging')});
view?.addEventListener('pointercancel',()=>{drag=false;view.classList.remove('dragging')});
$('#zoomIn')?.addEventListener('click',()=>{scale=Math.min(2.35,scale+.15);render()});
$('#zoomOut')?.addEventListener('click',()=>{scale=Math.max(1,scale-.15);render()});
$('#resetView')?.addEventListener('click',()=>{scale=1;dx=0;dy=0;render()});
window.addEventListener('resize',render,{passive:true});

// Campus hotspots
$$('.hotspot').forEach(h=>h.addEventListener('click',e=>{
  e.stopPropagation();
  $$('.hotspot').forEach(x=>x.classList.remove('active'));h.classList.add('active');
  $$('.walk-tags span').forEach(t=>t.classList.toggle('active',t.textContent===h.dataset.label));
}));

// Scroll-linked image depth
if(canHover&&!reduceMotion){
  let ticking=false;
  const depthUpdate=()=>{
    const sy=scrollY;
    $$('[data-parallax]').forEach(el=>el.style.setProperty('--parallax-y',`${sy*parseFloat(el.dataset.parallax)*.06}px`));
    $$('[data-depth]').forEach(el=>{
      const r=el.getBoundingClientRect();const d=parseFloat(el.dataset.depth);
      if(r.top<innerHeight&&r.bottom>0)el.querySelector('img')?.style.setProperty('--depth-y',`${(r.top-innerHeight/2)*d}px`);
    });
    ticking=false;
  };
  window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(depthUpdate);ticking=true}},{passive:true});
}

// Admissions journey interaction
const steps=$$('.admission-steps .step');
steps.forEach((step,i)=>step.addEventListener('click',()=>{
  steps.forEach(s=>s.classList.remove('active'));step.classList.add('active');
  steps.forEach((s,j)=>s.style.setProperty('--step-delay',`${Math.abs(j-i)*40}ms`));
}));

// Mobile navigation
const menu=$('.menu');
let mobileMenu;
function closeMobile(){mobileMenu?.classList.remove('open');document.body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false')}
menu?.setAttribute('aria-expanded','false');
menu?.addEventListener('click',()=>{
  if(!mobileMenu){
    mobileMenu=document.createElement('div');mobileMenu.className='mobile-menu';mobileMenu.innerHTML=`<div class="mobile-menu-head"><span>AIS NAVIGATION</span><button type="button" aria-label="Close navigation">×</button></div><a href="#about">About</a><a href="#world">Academics</a><a href="#life">School Life</a><a href="#admissions">Admissions</a><a href="#stories">Stories</a><a class="mobile-apply" href="#admissions">Apply 2026/27 <b>↗</b></a>`;
    document.body.appendChild(mobileMenu);
    mobileMenu.querySelector('button').addEventListener('click',closeMobile);
    $$('.mobile-menu a').forEach(a=>a.addEventListener('click',closeMobile));
  }
  const open=!mobileMenu.classList.contains('open');mobileMenu.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open));
});
window.addEventListener('keydown',e=>{if(e.key==='Escape')closeMobile()});

// Lightweight gallery lightbox
const galleryImages=$$('.gallery-card img');
if(galleryImages.length){
  const lightbox=document.createElement('div');lightbox.className='lightbox';lightbox.innerHTML=`<button aria-label="Close image">×</button><figure><img alt=""><figcaption></figcaption></figure>`;document.body.appendChild(lightbox);
  const lbImg=lightbox.querySelector('img'),lbCaption=lightbox.querySelector('figcaption');
  const close=()=>lightbox.classList.remove('open');
  lightbox.querySelector('button').addEventListener('click',close);lightbox.addEventListener('click',e=>{if(e.target===lightbox)close()});
  galleryImages.forEach(image=>image.parentElement.addEventListener('click',()=>{lbImg.src=image.src;lbImg.alt=image.alt||'';lbCaption.textContent=image.parentElement.querySelector('span')?.textContent||'AIS';lightbox.classList.add('open')}));
  window.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
}

// Keep placeholder story/app links from jumping to the top
$$('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
