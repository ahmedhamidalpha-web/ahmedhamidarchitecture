/* ==========================================================================
   Admin panel logic.

   ⚠️ IMPORTANT — read this before relying on this in production:
   This is a client-side-only login (no server). The password hash and the
   password-reset code live in the visitor's own browser (localStorage), and
   the "reset code" email is sent by re-using the Formspree contact endpoint,
   which forwards to whatever inbox Formspree is configured with. This is
   fine for a low-stakes single-admin site, but it is NOT real authentication:
   anyone who reads the page source can see how it works, and the check
   happens entirely in the browser. For real security, move to Supabase Auth
   (email+password) with Row Level Security policies on every table — ask
   your developer to wire this up when you're ready to harden it.
   ========================================================================== */

const ADMIN_SESSION_KEY = "ahmed_hamid_admin_session";
const ADMIN_PWD_KEY = "ahmed_hamid_admin_pwd_hash";
const ADMIN_RESET_KEY = "ahmed_hamid_admin_reset";
const DEFAULT_PWD_HASH = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"; // sha256("123456")

async function sha256(text){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
}
function getStoredHash(){ return localStorage.getItem(ADMIN_PWD_KEY) || DEFAULT_PWD_HASH; }
function isLoggedIn(){ return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1"; }
function logout(){ sessionStorage.removeItem(ADMIN_SESSION_KEY); location.reload(); }

/* ---------------- Login view ---------------- */
function renderLogin(mount){
  mount.innerHTML = `
    <div class="login-wrap">
      <div class="eyebrow">Admin Access</div>
      <h1 style="margin-bottom:24px">Sign in</h1>
      <form id="login-form">
        <div class="field"><label>Email</label><input name="email" type="email" required value="ahmedhamidarchitecture@gmail.com"></div>
        <div class="field"><label>Password</label><input name="password" type="password" required></div>
        <button class="btn btn-primary" type="submit" style="width:100%;justify-content:center">Sign In</button>
        <p class="error-text" id="login-error">Incorrect password. Please try again.</p>
      </form>
      <p style="margin-top:16px"><button class="link-btn" id="forgot-link">Forgot password?</button></p>
      <div id="reset-flow" style="display:none;margin-top:20px"></div>
    </div>
  `;
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = fd.get("email").trim().toLowerCase();
    const pwd = fd.get("password");
    const errorEl = document.getElementById("login-error");
    errorEl.style.display = "none";
    const hash = await sha256(pwd);
    if(email === CONFIG.adminEmail.toLowerCase() && hash === getStoredHash()){
      sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
      renderApp();
    } else {
      errorEl.style.display = "block";
    }
  });
  document.getElementById("forgot-link").addEventListener("click", () => renderForgotStep1());
}

function renderForgotStep1(){
  const box = document.getElementById("reset-flow");
  box.style.display = "block";
  box.innerHTML = `
    <div class="field"><label>Confirm your email</label><input id="reset-email" type="email" required></div>
    <button class="btn btn-ghost" id="send-code-btn">Send reset code</button>
    <p class="error-text" id="reset-error1">This email is not registered.</p>
    <p class="form-note" id="reset-sent" style="display:none;color:var(--indigo-2)">A reset code has been sent — check the admin inbox.</p>
  `;
  document.getElementById("send-code-btn").addEventListener("click", async () => {
    const email = document.getElementById("reset-email").value.trim().toLowerCase();
    const err = document.getElementById("reset-error1");
    if(email !== CONFIG.adminEmail.toLowerCase()){ err.style.display = "block"; return; }
    err.style.display = "none";
    const code = Math.floor(100000 + Math.random()*900000).toString();
    localStorage.setItem(ADMIN_RESET_KEY, JSON.stringify({ code, expires: Date.now() + 10*60*1000 }));
    try{
      const fd = new FormData();
      fd.append("subject", "Admin panel password reset code");
      fd.append("message", `Your password reset code for the Ahmed Hamid Architecture admin panel is: ${code} (valid 10 minutes).`);
      fd.append("email", email);
      await fetch(CONFIG.formspreeEndpoint, { method: "POST", headers: { "Accept": "application/json" }, body: fd });
    }catch(e){ /* still show the step below even if email sending failed */ }
    document.getElementById("reset-sent").style.display = "block";
    setTimeout(renderForgotStep2, 600);
  });
}

function renderForgotStep2(){
  const box = document.getElementById("reset-flow");
  box.innerHTML = `
    <div class="field"><label>Reset code</label><input id="reset-code" required></div>
    <div class="field"><label>New password</label><input id="reset-newpwd" type="password" required></div>
    <button class="btn btn-primary" id="confirm-reset-btn">Set new password</button>
    <p class="error-text" id="reset-error2">Invalid or expired code.</p>
  `;
  document.getElementById("confirm-reset-btn").addEventListener("click", async () => {
    const stored = JSON.parse(localStorage.getItem(ADMIN_RESET_KEY) || "{}");
    const code = document.getElementById("reset-code").value.trim();
    const newpwd = document.getElementById("reset-newpwd").value;
    const err = document.getElementById("reset-error2");
    if(!stored.code || code !== stored.code || Date.now() > stored.expires){
      err.style.display = "block"; return;
    }
    localStorage.setItem(ADMIN_PWD_KEY, await sha256(newpwd));
    localStorage.removeItem(ADMIN_RESET_KEY);
    alert("Password updated. Please sign in.");
    location.reload();
  });
}

/* ---------------- Dashboard shell ---------------- */
const SECTIONS = ["overview","home","about","services","projects","blog"];

function renderApp(){
  const mount = document.getElementById("admin-mount");
  mount.innerHTML = `
    <div class="admin-shell">
      <aside class="admin-side">
        <a data-sec="overview" class="active">Overview</a>
        <a data-sec="home">Home Page</a>
        <a data-sec="about">About Us</a>
        <a data-sec="services">Services</a>
        <a data-sec="projects">Projects</a>
        <a data-sec="blog">Blog</a>
        <a href="#" id="logout-link" style="margin-top:20px;color:#B4243C">Sign out</a>
      </aside>
      <main class="admin-main" id="admin-content"></main>
    </div>
  `;
  mount.querySelectorAll(".admin-side a[data-sec]").forEach(a => {
    a.addEventListener("click", () => {
      mount.querySelectorAll(".admin-side a[data-sec]").forEach(x => x.classList.remove("active"));
      a.classList.add("active");
      renderSection(a.dataset.sec);
    });
  });
  document.getElementById("logout-link").addEventListener("click", (e) => { e.preventDefault(); logout(); });
  renderSection("overview");
}

function renderSection(name){
  const content = document.getElementById("admin-content");
  content.innerHTML = "<p style='color:var(--gray)'>Loading…</p>";
  const fns = { overview: sectionOverview, home: sectionHome, about: sectionAbout, services: sectionServices, projects: sectionProjects, blog: sectionBlog };
  fns[name](content);
}

/* ---------------- Overview / visits ---------------- */
async function sectionOverview(content){
  content.innerHTML = `
    <h2>Visits Overview</h2>
    <p class="form-note">Real traffic totals live in your Google Analytics property (ID <code>${CONFIG.gaId}</code>) — open
      <a href="https://analytics.google.com" target="_blank" rel="noopener">analytics.google.com</a> for the full report.
      The chart below tracks visits recorded directly in Supabase (table <code>page_views</code>) so you get a quick daily/weekly/monthly read without leaving this panel.</p>
    <div class="admin-card">
      <div style="display:flex;gap:10px;margin-bottom:16px">
        <button class="tag-pill active" data-range="day">Daily</button>
        <button class="tag-pill" data-range="week">Weekly</button>
        <button class="tag-pill" data-range="month">Monthly</button>
      </div>
      <canvas id="visits-chart" height="120"></canvas>
    </div>
  `;
  if(!window.Chart){
    await new Promise(r => { const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/chart.js"; s.onload = r; document.head.appendChild(s); });
  }
  let rows = [];
  try{ rows = await SB.select("page_views", "select=created_at&order=created_at.asc"); }catch(e){ rows = []; }
  let chart;
  function draw(range){
    const buckets = {};
    rows.forEach(r => {
      const d = new Date(r.created_at);
      let key;
      if(range === "day") key = d.toISOString().slice(0,10);
      else if(range === "week"){ const onejan = new Date(d.getFullYear(),0,1); const week = Math.ceil((((d-onejan)/86400000)+onejan.getDay()+1)/7); key = `${d.getFullYear()}-W${week}`; }
      else key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      buckets[key] = (buckets[key]||0)+1;
    });
    const labels = Object.keys(buckets).slice(-20);
    const data = labels.map(l => buckets[l]);
    if(chart) chart.destroy();
    chart = new Chart(document.getElementById("visits-chart"), {
      type: "line",
      data: { labels, datasets: [{ label: "Visits", data, borderColor: "#1B1F6B", backgroundColor: "rgba(27,31,107,.08)", fill: true, tension: .3 }] },
      options: { plugins:{legend:{display:false}}, scales:{ y:{ beginAtZero:true } } }
    });
  }
  draw("day");
  content.querySelectorAll("[data-range]").forEach(btn => {
    btn.addEventListener("click", () => {
      content.querySelectorAll("[data-range]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      draw(btn.dataset.range);
    });
  });
}

/* ---------------- Home page editor (announcements + jobs) ---------------- */
async function sectionHome(content){
  let value = {};
  try{ const rows = await SB.select("site_content", "select=value&key=eq.announcements"); value = rows[0]?.value || {}; }catch(e){}
  const items = value.items || [];
  content.innerHTML = `
    <h2>Home Page — Announcements & Job Posts</h2>
    <p class="form-note">Featured projects on the home page pull automatically from the Projects tab — no editing needed here.</p>
    <div class="admin-card">
      <div id="announce-items">
        ${items.map((a,i) => `
          <div class="service-item" data-i="${i}">
            <div><strong>${a.title}</strong><div class="meta">${a.date||''}</div></div>
            <div>${a.body||''} <button class="link-btn" data-remove="${i}">remove</button></div>
          </div>`).join("") || "<p class='form-note'>No items yet.</p>"}
      </div>
      <hr class="hairline" style="margin:20px 0">
      <div class="form-row-2">
        <div class="field"><label>Title</label><input id="a-title" placeholder="e.g. Now Hiring: Site Engineer"></div>
        <div class="field"><label>Date</label><input id="a-date" type="date"></div>
      </div>
      <div class="field"><label>Details</label><textarea id="a-body" rows="3"></textarea></div>
      <button class="btn btn-primary" id="add-announce">Add to Home Page</button>
    </div>
  `;
  content.querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", async () => {
    items.splice(Number(b.dataset.remove),1);
    await saveAnnouncements(items);
    sectionHome(content);
  }));
  document.getElementById("add-announce").addEventListener("click", async () => {
    const title = document.getElementById("a-title").value.trim();
    if(!title) return;
    items.unshift({ title, date: document.getElementById("a-date").value, body: document.getElementById("a-body").value.trim() });
    await saveAnnouncements(items);
    sectionHome(content);
  });
}
async function saveAnnouncements(items){
  try{
    await SB.update("site_content", "key=eq.announcements", { value: { items } });
  }catch(e){
    await SB.insert("site_content", { key: "announcements", value: { items } });
  }
}

/* ---------------- About editor ---------------- */
async function sectionAbout(content){
  let v = {};
  try{ const rows = await SB.select("site_content", "select=value&key=eq.about"); v = rows[0]?.value || {}; }catch(e){}
  content.innerHTML = `
    <h2>About Us</h2>
    <div class="admin-card">
      <div class="field"><label>Page title</label><input id="ab-title" value="${v.title||''}"></div>
      <div class="field"><label>Intro paragraph</label><textarea id="ab-intro" rows="3">${v.intro||''}</textarea></div>
      <div class="field"><label>Vision</label><textarea id="ab-vision" rows="2">${v.vision||''}</textarea></div>
      <div class="field"><label>Mission & Goals</label><textarea id="ab-mission" rows="2">${v.mission||''}</textarea></div>
      <div class="field"><label>Departments (one per line: Name | Description)</label>
        <textarea id="ab-depts" rows="4">${(v.departments||[]).map(d=>`${d.name} | ${d.description}`).join("\n")}</textarea>
      </div>
      <div class="field"><label>Experience stats — optional (one per line: Value | Label)</label>
        <textarea id="ab-stats" rows="3">${(v.stats||[]).map(s=>`${s.value} | ${s.label}`).join("\n")}</textarea>
      </div>
      <button class="btn btn-primary" id="save-about">Save Changes</button>
      <p class="form-note" id="about-saved" style="display:none;color:var(--indigo-2)">Saved.</p>
    </div>
  `;
  document.getElementById("save-about").addEventListener("click", async () => {
    const departments = document.getElementById("ab-depts").value.split("\n").filter(Boolean).map(l => { const [name,description] = l.split("|"); return { name:(name||'').trim(), description:(description||'').trim() }; });
    const stats = document.getElementById("ab-stats").value.split("\n").filter(Boolean).map(l => { const [value,label] = l.split("|"); return { value:(value||'').trim(), label:(label||'').trim() }; });
    const payload = {
      title: document.getElementById("ab-title").value.trim(),
      intro: document.getElementById("ab-intro").value.trim(),
      vision: document.getElementById("ab-vision").value.trim(),
      mission: document.getElementById("ab-mission").value.trim(),
      departments, stats
    };
    try{ await SB.update("site_content","key=eq.about",{ value: payload }); }
    catch(e){ await SB.insert("site_content",{ key:"about", value: payload }); }
    document.getElementById("about-saved").style.display = "block";
  });
}

/* ---------------- Services CRUD ---------------- */
async function sectionServices(content){
  let rows = [];
  try{ rows = await SB.select("services", "select=*&order=sort_order.asc"); }catch(e){}
  content.innerHTML = `
    <h2>Services</h2>
    <div class="admin-card">
      <table class="data-table">
        <thead><tr><th>Title</th><th>Description</th><th></th></tr></thead>
        <tbody>${rows.map(s => `<tr><td>${s.title}</td><td>${(s.description||'').slice(0,60)}</td><td><button class="link-btn" data-del="${s.id}">delete</button></td></tr>`).join("") || "<tr><td colspan='3' class='form-note'>No services yet.</td></tr>"}</tbody>
      </table>
      <hr class="hairline" style="margin:20px 0">
      <div class="field"><label>Title</label><input id="sv-title"></div>
      <div class="field"><label>Description</label><textarea id="sv-desc" rows="3"></textarea></div>
      <button class="btn btn-primary" id="add-service">Add Service</button>
    </div>
  `;
  content.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", async () => {
    await SB.remove("services", `id=eq.${b.dataset.del}`);
    sectionServices(content);
  }));
  document.getElementById("add-service").addEventListener("click", async () => {
    const title = document.getElementById("sv-title").value.trim();
    if(!title) return;
    await SB.insert("services", { title, description: document.getElementById("sv-desc").value.trim(), sort_order: rows.length });
    sectionServices(content);
  });
}

/* ---------------- Projects CRUD ---------------- */
async function sectionProjects(content){
  let rows = [];
  try{ rows = await SB.select("projects", "select=id,title,location&order=id.desc"); }catch(e){}
  content.innerHTML = `
    <h2>Projects</h2>
    <div class="admin-card">
      <table class="data-table">
        <thead><tr><th>Title</th><th>Location</th><th></th></tr></thead>
        <tbody>${rows.map(p => `<tr><td>${p.title}</td><td>${p.location||''}</td><td>
          <button class="link-btn" data-edit="${p.id}">edit</button>
          <button class="link-btn" data-del="${p.id}">delete</button>
        </td></tr>`).join("") || "<tr><td colspan='3' class='form-note'>No projects yet.</td></tr>"}</tbody>
      </table>
      <hr class="hairline" style="margin:20px 0">
      <button class="btn btn-primary" id="new-project">+ New Project</button>
    </div>
    <div id="project-editor"></div>
  `;
  content.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", async () => {
    if(!confirm("Delete this project?")) return;
    await SB.remove("projects", `id=eq.${b.dataset.del}`);
    sectionProjects(content);
  }));
  content.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", async () => {
    const r = await SB.select("projects", `select=*&id=eq.${b.dataset.edit}`);
    renderProjectForm(document.getElementById("project-editor"), r[0]);
  }));
  document.getElementById("new-project").addEventListener("click", () => {
    renderProjectForm(document.getElementById("project-editor"), null);
  });
}

function renderProjectForm(mount, p){
  p = p || { title:"",location:"",land_area:"",built_area:"",structure_system:"",concept:"",challenges:"",solutions:"",cover_image:"",gallery:[] };
  mount.innerHTML = `
    <div class="admin-card">
      <h3>${p.id ? "Edit Project" : "New Project"}</h3>
      <div class="form-row-2">
        <div class="field"><label>Title</label><input id="pr-title" value="${p.title}"></div>
        <div class="field"><label>Location</label><input id="pr-location" value="${p.location}"></div>
      </div>
      <div class="form-row-2">
        <div class="field"><label>Land area</label><input id="pr-land" value="${p.land_area}"></div>
        <div class="field"><label>Built area</label><input id="pr-built" value="${p.built_area}"></div>
      </div>
      <div class="field"><label>Structural system</label><input id="pr-structure" value="${p.structure_system}"></div>
      <div class="field"><label>Design concept</label><textarea id="pr-concept" rows="3">${p.concept}</textarea></div>
      <div class="field"><label>Challenges</label><textarea id="pr-challenges" rows="2">${p.challenges}</textarea></div>
      <div class="field"><label>Solutions</label><textarea id="pr-solutions" rows="2">${p.solutions}</textarea></div>
      <div class="field"><label>Cover image</label><input id="pr-cover" type="file" accept="image/*">
        ${p.cover_image ? `<img src="${p.cover_image}" style="height:60px;margin-top:6px">` : ""}
      </div>
      <div class="field"><label>Gallery images (multiple)</label><input id="pr-gallery" type="file" accept="image/*" multiple></div>
      <button class="btn btn-primary" id="save-project">Save Project</button>
      <p class="form-note" id="pr-status"></p>
    </div>
  `;
  document.getElementById("save-project").addEventListener("click", async () => {
    const status = document.getElementById("pr-status");
    status.textContent = "Uploading images…";
    let cover_image = p.cover_image;
    const coverFile = document.getElementById("pr-cover").files[0];
    if(coverFile) cover_image = await uploadImageToDrive(coverFile);
    let gallery = p.gallery || [];
    const galleryFiles = Array.from(document.getElementById("pr-gallery").files);
    for(const f of galleryFiles){ gallery.push(await uploadImageToDrive(f)); }

    const payload = {
      title: document.getElementById("pr-title").value.trim(),
      location: document.getElementById("pr-location").value.trim(),
      land_area: document.getElementById("pr-land").value.trim(),
      built_area: document.getElementById("pr-built").value.trim(),
      structure_system: document.getElementById("pr-structure").value.trim(),
      concept: document.getElementById("pr-concept").value.trim(),
      challenges: document.getElementById("pr-challenges").value.trim(),
      solutions: document.getElementById("pr-solutions").value.trim(),
      cover_image, gallery
    };
    status.textContent = "Saving…";
    try{
      if(p.id) await SB.update("projects", `id=eq.${p.id}`, payload);
      else await SB.insert("projects", payload);
      status.textContent = "Saved.";
      renderSection("projects");
    }catch(e){ status.textContent = "Could not save — check Supabase connection."; }
  });
}

/* ---------------- Blog CRUD ---------------- */
async function sectionBlog(content){
  let rows = [];
  try{ rows = await SB.select("blog_posts", "select=id,title,created_at&order=created_at.desc"); }catch(e){}
  content.innerHTML = `
    <h2>Blog</h2>
    <div class="admin-card">
      <table class="data-table">
        <thead><tr><th>Title</th><th>Date</th><th></th></tr></thead>
        <tbody>${rows.map(b => `<tr><td>${b.title}</td><td>${new Date(b.created_at).toLocaleDateString()}</td><td>
          <button class="link-btn" data-edit="${b.id}">edit</button>
          <button class="link-btn" data-del="${b.id}">delete</button>
        </td></tr>`).join("") || "<tr><td colspan='3' class='form-note'>No posts yet.</td></tr>"}</tbody>
      </table>
      <hr class="hairline" style="margin:20px 0">
      <button class="btn btn-primary" id="new-post">+ New Post</button>
    </div>
    <div id="post-editor"></div>
  `;
  content.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", async () => {
    if(!confirm("Delete this post and its comments?")) return;
    await SB.remove("blog_comments", `post_id=eq.${b.dataset.del}`);
    await SB.remove("blog_posts", `id=eq.${b.dataset.del}`);
    sectionBlog(content);
  }));
  content.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", async () => {
    const r = await SB.select("blog_posts", `select=*&id=eq.${b.dataset.edit}`);
    renderPostForm(document.getElementById("post-editor"), r[0]);
  }));
  document.getElementById("new-post").addEventListener("click", () => renderPostForm(document.getElementById("post-editor"), null));
}

function renderPostForm(mount, post){
  post = post || { title:"", body:"", cover_image:"" };
  mount.innerHTML = `
    <div class="admin-card">
      <h3>${post.id ? "Edit Post" : "New Post"}</h3>
      <div class="field"><label>Title</label><input id="bp-title" value="${post.title}"></div>
      <div class="field"><label>Cover image</label><input id="bp-cover" type="file" accept="image/*">
        ${post.cover_image ? `<img src="${post.cover_image}" style="height:60px;margin-top:6px">` : ""}
      </div>
      <div class="field"><label>Body</label><textarea id="bp-body" rows="6">${post.body}</textarea></div>
      <button class="btn btn-primary" id="save-post">Publish</button>
      <p class="form-note" id="bp-status"></p>
    </div>
  `;
  document.getElementById("save-post").addEventListener("click", async () => {
    const status = document.getElementById("bp-status");
    let cover_image = post.cover_image;
    const f = document.getElementById("bp-cover").files[0];
    if(f){ status.textContent = "Uploading image…"; cover_image = await uploadImageToDrive(f); }
    const payload = { title: document.getElementById("bp-title").value.trim(), body: document.getElementById("bp-body").value.trim(), cover_image };
    status.textContent = "Saving…";
    try{
      if(post.id) await SB.update("blog_posts", `id=eq.${post.id}`, payload);
      else await SB.insert("blog_posts", { ...payload, created_at: new Date().toISOString() });
      status.textContent = "Published.";
      renderSection("blog");
    }catch(e){ status.textContent = "Could not save — check Supabase connection."; }
  });
}

/* ---------------- Boot ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("admin-mount");
  if(isLoggedIn()) renderApp(); else renderLogin(mount);
});
