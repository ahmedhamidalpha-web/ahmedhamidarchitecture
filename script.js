/* ==========================================================================
   Ahmed Hamid Architecture — Shared Config & Components
   This file is loaded on every page. It renders the header/footer (so they
   never drift out of sync across pages), wires up the mobile nav, and
   exposes small helpers for talking to Supabase.
   ========================================================================== */

/* ---------------- CONFIG — edit these in one place ---------------- */
const CONFIG = {
  siteUrl: "https://ahmedhamidarchitecture.vercel.app",
  supabaseUrl: "https://fzlpqsvcicuvldaxgvcz.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bHBxc3ZjaWN1dmxkYXhndmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3OTM1NjksImV4cCI6MjA5OTM2OTU2OX0.4YTOUuAv9RP5yGz_OF0Sh6ocZLMJa86HrVgAor97Lq8",
  formspreeEndpoint: "https://formspree.io/f/mzdnpevq",
  driveUploadScript: "https://script.google.com/macros/s/AKfycbwFd_q0GcRNc4qEI1NBlHAJxE_cLlmNzdTRXKJkO1wiPt6TUj05aSUWL76uM1YeD3hJ/exec",
  gaId: "G-S8XNQKS8F3",
  adminEmail: "ahmedhamidarchitecture@gmail.com",
  whatsapp: "+249924372845",
  social: {
    facebook: "https://www.facebook.com/ahmedhamidarchitecture",
    instagram: "https://www.instagram.com/ahmed_hamid_architecture?igsh=MXd1ZDlyaHlpdzB5NA==",
    tiktok: "https://vm.tiktok.com/ZS9MCb1KJoBdN-iZvTF/",
    linkedin: "https://www.linkedin.com/in/ahmed-hamid-architecture-9b9372260?utm_source=share_via&utm_content=profile&utm_medium=member_android"
  }
};

/* ---------------- Google Analytics (gtag) ---------------- */
(function loadGA(){
  const s1 = document.createElement('script');
  s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.gaId}`;
  document.head.appendChild(s1);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', CONFIG.gaId);
})();

/* ---------------- Header / Footer templates ---------------- */
const NAV_ITEMS = [
  { label: "Home", href: "index.html" },
  { label: "About Us", href: "about.html" },
  { label: "Services", href: "services.html" },
  { label: "Projects", href: "projects.html" },
  { label: "Blog", href: "blog.html" },
  { label: "Contact", href: "contact.html" },
  { label: "Admin", href: "admin.html" }
];

function currentPage(){
  const p = location.pathname.split("/").pop() || "index.html";
  return p;
}

function renderHeader(){
  const mount = document.getElementById("site-header");
  if(!mount) return;
  const page = currentPage();
  const links = NAV_ITEMS.map(item => {
    const isProjectDetail = page === "project.html" && item.href === "projects.html";
    const active = (page === item.href || isProjectDetail) ? "active" : "";
    return `<a href="${item.href}" class="${active}">${item.label}</a>`;
  }).join("");

  mount.innerHTML = `
    <div class="header-inner">
      <a href="index.html" class="brand">
        <img src="assets/logo.png" alt="Ahmed Hamid Architecture logo">
        <span class="brand-text">
          <span class="name">Ahmed Hamid Architecture</span>
          <span class="tag">Modern Design | Innovative Space</span>
        </span>
      </a>
      <nav class="main-nav" id="main-nav">${links}</nav>
      <button id="nav-toggle" aria-label="Toggle menu"><span></span><span></span><span></span></button>
    </div>
  `;
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
}

function renderFooter(){
  const mount = document.getElementById("site-footer");
  if(!mount) return;
  mount.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">
            <img src="assets/logo.png" alt="logo">
            <strong style="color:#fff;font-family:'Space Grotesk'">Ahmed Hamid Architecture</strong>
          </div>
          <p style="max-width:320px;color:#9AA0C9">Architectural design, quantity take-offs and facade renovation — modern design, innovative space.</p>
          <div class="social-row">
            <a href="${CONFIG.social.facebook}" target="_blank" rel="noopener" aria-label="Facebook">f</a>
            <a href="${CONFIG.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">ig</a>
            <a href="${CONFIG.social.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">tk</a>
            <a href="${CONFIG.social.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">in</a>
          </div>
        </div>
        <div>
          <h4>Navigate</h4>
          <ul class="footer-links">
            <li><a href="about.html">About Us</a></li>
            <li><a href="services.html">Services</a></li>
            <li><a href="projects.html">Projects</a></li>
            <li><a href="blog.html">Blog</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul class="footer-links">
            <li>WhatsApp: <a href="https://wa.me/${CONFIG.whatsapp.replace('+','')}" target="_blank" rel="noopener">${CONFIG.whatsapp}</a></li>
            <li>Email: <a href="mailto:${CONFIG.adminEmail}">${CONFIG.adminEmail}</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <span id="year"></span> Ahmed Hamid Architecture. All rights reserved.</span>
        <span>Architectural Design & 3D Visualization</span>
      </div>
    </div>
  `;
  document.getElementById("year").textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  trackPageView();
});

/* Records a lightweight visit row so the admin overview chart has data,
   in addition to real Google Analytics tracking above. Fails silently if
   the `page_views` table doesn't exist yet. */
async function trackPageView(){
  if(currentPage() === "admin.html") return;
  try{
    await fetch(`${CONFIG.supabaseUrl}/rest/v1/page_views`, {
      method: "POST",
      headers: { "apikey": CONFIG.supabaseAnonKey, "Authorization": `Bearer ${CONFIG.supabaseAnonKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ path: currentPage(), created_at: new Date().toISOString() })
    });
  }catch(e){ /* no-op */ }
}

/* ---------------- Supabase REST helpers ----------------
   Using the REST endpoint directly (no SDK dependency) so every page
   only needs this one script file. Table names expected in Supabase:
     - site_content   (key text primary key, value jsonb)   -> Home/About editable blocks
     - services       (id, title, description, sort_order)
     - projects       (id, title, cover_image, location, land_area, built_area,
                       structure_system, concept, challenges, solutions, gallery jsonb)
     - blog_posts     (id, title, body, cover_image, created_at)
     - blog_comments  (id, post_id, username, body, created_at)
   ---------------------------------------------------------- */
const SB = {
  headers(){
    return {
      "apikey": CONFIG.supabaseAnonKey,
      "Authorization": `Bearer ${CONFIG.supabaseAnonKey}`,
      "Content-Type": "application/json"
    };
  },
  async select(table, query = ""){
    const res = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${table}?${query}`, {
      headers: this.headers()
    });
    if(!res.ok) throw new Error(`Supabase select failed: ${res.status}`);
    return res.json();
  },
  async insert(table, payload){
    const res = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...this.headers(), "Prefer": "return=representation" },
      body: JSON.stringify(payload)
    });
    if(!res.ok) throw new Error(`Supabase insert failed: ${res.status}`);
    return res.json();
  },
  async update(table, match, payload){
    const res = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${table}?${match}`, {
      method: "PATCH",
      headers: { ...this.headers(), "Prefer": "return=representation" },
      body: JSON.stringify(payload)
    });
    if(!res.ok) throw new Error(`Supabase update failed: ${res.status}`);
    return res.json();
  },
  async remove(table, match){
    const res = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${table}?${match}`, {
      method: "DELETE",
      headers: this.headers()
    });
    if(!res.ok) throw new Error(`Supabase delete failed: ${res.status}`);
    return true;
  }
};

/* Upload an image file to the Google Drive folder via the Apps Script
   web app, and get back a viewable URL to store alongside the record. */
async function uploadImageToDrive(file){
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const res = await fetch(CONFIG.driveUploadScript, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, mimeType: file.type, data: base64 })
  });
  if(!res.ok) throw new Error("Drive upload failed");
  const data = await res.json();
  return data.url || data.viewUrl || data.fileUrl;
}
