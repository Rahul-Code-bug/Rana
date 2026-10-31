const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,$=s=>document.querySelector(s);
const ic=(p)=>`<svg viewBox="0 0 48 48" fill="none" stroke="#22d3ee" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const skills=[["HTML5",95],["CSS3",90],["JavaScript",88],["React.js",85],["Bootstrap",90],["Tailwind CSS",82],["Node.js",75],["Express.js",75],["MySQL",70],["Git & GitHub",85]];
$('#skillGrid').innerHTML=skills.map(([n,v])=>`<div class="col-6 col-md-3"><div class="glass tile" data-tilt>${ic('<path d="M16 14L6 24l10 10M32 14l10 10-10 10M27 10l-6 28"/>')}<h3 class="h6 mt-2">${n}</h3><div class="bar" role="img" aria-label="${n} ${v}%"><i data-w="${v}"></i></div></div></div>`).join('');
const projects=[["Food Ordering Website","HTML,CSS,JS,Node","#7c3aed,#ec4899"],["E-Commerce Website","React,Express,MySQL","#2563eb,#22d3ee"],["Personal Portfolio","HTML,GSAP,Three.js","#6d28d9,#22d3ee"],["React Dashboard","React,Charts,Tailwind","#0ea5e9,#8b5cf6"],["Full Stack Web Application","React,Node,MySQL","#4f46e5,#06b6d4"],["Business Website","Bootstrap,JS","#9333ea,#3b82f6"]];
$('#projectGrid').innerHTML=projects.map(([n,t,g])=>`<div class="col-md-6 col-lg-4"><article class="glass proj" data-tilt><div class="pv" style="--g:linear-gradient(135deg,${g})" role="img" aria-label="${n} preview"></div><div class="b"><h3 class="h5">${n}</h3><div>${t.split(',').map(x=>`<span class="badge-t">${x}</span>`).join('')}</div><a href="#" target="_blank" rel="noopener">Live Demo</a> &nbsp; <a href="https://github.com/" target="_blank" rel="noopener">GitHub</a></div></article></div>`).join('');
const svc=[["Web Development",'<rect x="6" y="9" width="36" height="26" rx="3"/><path d="M16 42h16"/>'],["Frontend Development",'<path d="M16 14L6 24l10 10M32 14l10 10-10 10"/>'],["React Development",'<ellipse cx="24" cy="24" rx="18" ry="7"/><ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(120 24 24)"/>'],["Responsive Website Design",'<rect x="4" y="10" width="28" height="20" rx="2"/><rect x="28" y="18" width="14" height="22" rx="2"/>'],["Full Stack Development",'<path d="M8 12h32M8 24h32M8 36h32"/><circle cx="14" cy="12" r="2"/><circle cx="14" cy="24" r="2"/><circle cx="14" cy="36" r="2"/>'],["UI/UX Implementation",'<path d="M8 40l6-16 22-18 6 6-18 22z"/>']];
$('#serviceGrid').innerHTML=svc.map(([n,p],i)=>`<div class="col-md-6 col-lg-4"><div class="glass svc" style="animation-delay:${-i}s">${ic(p)}<h3 class="h5">${n}</h3><p class="mb-0 text-secondary">Clean, accessible and fast, built to your goals.</p></div></div>`).join('');
const tl=[["2025 – Present","Freelance Web Developer","Building React and full stack products for small businesses."],["2024","Frontend Developer Intern","Shipped responsive UI components with React and Bootstrap."],["2022 – 2025","B.Tech / BCA in Computer Science","Focused on web technologies and databases."]];
$('#timeline').innerHTML=tl.map(([d,t,x])=>`<li><small>${d}</small><h3 class="h5">${t}</h3><p>${x}</p></li>`).join('');
// typing roles
const roles=["Creative Web Developer","Frontend Developer","React.js Developer","Full Stack Developer"];let ri=0,ci=0,del=false;
function type(){const w=roles[ri],el=$('#typed');el.textContent=w.slice(0,ci);
 if(!del&&ci++===w.length){del=true;return setTimeout(type,1400)}
 if(del&&--ci<0){del=false;ci=0;ri=(ri+1)%roles.length}
 setTimeout(type,del?35:70)}
if(reduce)$('#typed').textContent=roles[0];else{ci=0;type()}
// mouse glow
const g=$('.glow');addEventListener('pointermove',e=>{g.style.transform=`translate(${e.clientX-210}px,${e.clientY-210}px)`});
// tilt
document.querySelectorAll('[data-tilt]').forEach(c=>{if(reduce)return;
 c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(700px) rotateY(${x*14}deg) rotateX(${-y*14}deg)`});
 c.addEventListener('pointerleave',()=>c.style.transform='')});
// counters + bars via IntersectionObserver
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);
 const el=e.target;if(el.dataset.n){const n=+el.dataset.n;if(reduce)el.textContent=n;else gsap.to({v:0},{v:n,duration:1.6,onUpdate(){el.textContent=Math.round(this.targets()[0].v)}})}
 if(el.dataset.w)el.style.cssText=`width:${el.dataset.w}%;transition:width 1.2s`}),{threshold:.4});
document.querySelectorAll('[data-n],[data-w]').forEach(el=>io.observe(el));
// GSAP scroll effects
if(!reduce&&window.gsap){gsap.registerPlugin(ScrollTrigger);
 gsap.from('h1,.role,.btn-glow',{y:40,opacity:0,stagger:.12,duration:.9,ease:'power3.out'});
 gsap.from('.timeline li',{x:-30,opacity:0,stagger:.2,scrollTrigger:{trigger:'#timeline',start:'top 80%'}});
 gsap.fromTo('#timeline',{'--p':0},{'--p':1,ease:'none',scrollTrigger:{trigger:'#timeline',start:'top 70%',end:'bottom 70%',scrub:true}});
 gsap.to('#scene',{yPercent:25,ease:'none',scrollTrigger:{trigger:'#home',scrub:true,start:'top top',end:'bottom top'}})}
// Three.js hero
(function(){const cv=$('#scene');if(reduce||!window.THREE)return;
 const r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});r.setPixelRatio(Math.min(devicePixelRatio,1.5));
 const s=new THREE.Scene(),cam=new THREE.PerspectiveCamera(55,1,.1,100);cam.position.z=9;
 const mk=(geo,c,x,y,z)=>{const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:c,wireframe:true}));m.position.set(x,y,z);s.add(m);return m};
 const objs=[mk(new THREE.IcosahedronGeometry(2,1),0x8b5cf6,3.2,.4,0),mk(new THREE.BoxGeometry(1.4,1.4,1.4),0x22d3ee,-4,2,-1),mk(new THREE.TorusKnotGeometry(.8,.25,80,10),0x3b82f6,-3,-2.2,0),mk(new THREE.SphereGeometry(.7,16,12),0xa78bfa,5.5,-2.5,-1)];
 const pts=new Float32Array(900);for(let i=0;i<900;i++)pts[i]=(Math.random()-.5)*26;
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pts,3));
 const P=new THREE.Points(pg,new THREE.PointsMaterial({color:0x22d3ee,size:.04}));s.add(P);
 let mx=0,my=0;addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
 const size=()=>{const h=cv.parentElement.clientHeight;r.setSize(innerWidth,h,false);cam.aspect=innerWidth/h;cam.updateProjectionMatrix()};size();addEventListener('resize',size);
 let vis=true;new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(cv);
 (function loop(){requestAnimationFrame(loop);if(!vis)return;objs.forEach((o,i)=>{o.rotation.x+=.003*(i+1);o.rotation.y+=.004});P.rotation.y+=.0008;cam.position.x+=(mx*2-cam.position.x)*.04;cam.position.y+=(-my*2-cam.position.y)*.04;cam.lookAt(0,0,0);r.render(s,cam)})()})();
// contact form (opens mail client)
$('#form').addEventListener('submit',e=>{e.preventDefault();const f=e.target,st=$('#status');
 if(!f.checkValidity()){st.textContent='Please fill in every field with a valid email.';return}
 const d=new FormData(f);location.href=`mailto:you@example.com?subject=${encodeURIComponent(d.get('subject'))}&body=${encodeURIComponent(d.get('message')+'\n\n'+d.get('name')+' <'+d.get('email')+'>')}`;st.textContent='Opening your email app to send the message.'});
