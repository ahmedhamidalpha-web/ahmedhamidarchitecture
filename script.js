// nav solid on scroll
const nav = document.getElementById('nav');
const navCta = document.getElementById('navCta');
window.addEventListener('scroll', () => {
  const solid = window.scrollY > 60;
  nav.classList.toggle('solid', solid);
  navCta.style.display = solid ? 'inline-flex' : 'none';
});

// reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, {threshold:0.15});
revealEls.forEach(el => io.observe(el));

// burger (mobile) — simple toggle of nav-links as a stacked panel
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav-links');
burger.addEventListener('click', () => {
  const open = navLinks.style.display === 'flex';
  if(open){
    navLinks.style.display = 'none';
  } else {
    navLinks.style.cssText = 'display:flex; position:fixed; top:64px; left:0; right:0; background:#14140F; flex-direction:column; padding:24px 28px; gap:20px;';
  }
});

// project data + blueprint placeholder cards
const projects = [
  {name:'Villa Rania', cat:'residential', label:'Residential', year:'2025'},
  {name:'Nile View Offices', cat:'commercial', label:'Commercial', year:'2025'},
  {name:'Sandstone Residence', cat:'residential', label:'Residential', year:'2024'},
  {name:'Studio Loft Interior', cat:'interior', label:'Interior', year:'2024'},
  {name:'Riverside Masterplan', cat:'planning', label:'Planning', year:'2024'},
  {name:'Courtyard Villa', cat:'residential', label:'Residential', year:'2023'},
];

const grid = document.getElementById('projectGrid');

function planSvg(seed){
  const variants = [
    '<path d="M20 90 L20 20 L60 20 L60 60 L90 60 L90 90 Z"/><line x1="20" y1="60" x2="60" y2="60"/>',
    '<rect x="20" y="20" width="70" height="70"/><line x1="55" y1="20" x2="55" y2="90"/><line x1="20" y1="55" x2="55" y2="55"/>',
    '<path d="M15 85 L15 30 L50 15 L85 30 L85 85 Z"/><line x1="15" y1="55" x2="85" y2="55"/>',
  ];
  return variants[seed % variants.length];
}

function render(filter){
  if(!grid) return;
  grid.innerHTML = '';
  projects.filter(p => filter==='all' || p.cat===filter).forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="plan"><svg viewBox="0 0 100 100">${planSvg(i)}</svg></div>
      <div class="meta">
        <span class="cat mono">${p.label}</span>
        <h4>${p.name}</h4>
        <span class="yr mono">${p.year}</span>
      </div>`;
    grid.appendChild(card);
  });
}

render('all');

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    render(btn.dataset.filter);
  });
});
