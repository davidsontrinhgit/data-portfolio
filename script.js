function qs(sel, ctx=document){ return ctx.querySelector(sel); }
function qsa(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)); }

function buildTile(p){
  const a = document.createElement('a');
  a.className = 'tile';
  a.href = p.link;
  a.setAttribute('aria-label', p.title);
  a.innerHTML = `
    <img class="thumb" src="${p.thumb}" alt="${p.title} preview">
    <div class="tile-body">
      <h3 class="tile-title">${p.title}</h3>
      <p class="tile-text">${p.summary||''}</p>
    </div>
  `;
  a.addEventListener('pointermove', (e) => {
    const r = a.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = (0.5 - y) * 4;
    const ry = (x - 0.5) * 4;
    a.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px) scale(1.01)`;
  });
  a.addEventListener('pointerleave', () => { a.style.transform = ''; });
  return a;
}

async function loadProjects(){
  try{
    const res = await fetch('projects.json', {cache:'no-store'});
    if(!res.ok) throw new Error('fetch failed');
    return await res.json();
  }catch(e){
    const inline = qs('#inline-projects');
    if(inline){
      try { return JSON.parse(inline.textContent); } catch(_) {}
    }
    return [];
  }
}

function setupTheme(){
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if(saved === 'dark') root.classList.add('dark');
  const toggle = qs('#theme');
  if(toggle){
    toggle.addEventListener('click', ()=>{
      root.classList.toggle('dark');
      localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
    });
  }
}

async function init(){
  const yr = qs('#yr'); if(yr) yr.textContent = new Date().getFullYear();
  setupTheme();

  const grid = qs('#projects-grid');
  if(grid){
    const data = (await loadProjects()).sort((a,b)=> (b.date||'').localeCompare(a.date||''));
    data.forEach(p => grid.appendChild(buildTile(p)));

    const io = new IntersectionObserver((entries)=>{
      for(const e of entries){
        if(e.isIntersecting){ e.target.classList.add('reveal-in'); io.unobserve(e.target); }
      }
    }, {rootMargin:'-50px 0px -10% 0px', threshold:0.02});
    qsa('.tile', grid).forEach(el => io.observe(el));
  }
}

init();
