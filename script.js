// Load Data Functions

async function loadHomeData() {
  const projects = await supabaseFetch('projects?limit=3');
  const container = document.getElementById('home-featured-projects');
  if (container && projects.length) {
    container.innerHTML = projects.map(p => `
      <div class="card">
        <img src="${p.cover_url || 'assets/default-project.jpg'}" alt="${p.title}">
        <div class="card-body">
          <h3>${p.title}</h3>
          <p style="color:var(--text-muted);">${p.location || ''}</p>
          <a href="project-detail.html?id=${p.id}" class="btn" style="margin-top:10px;">عرض التفاصيل</a>
        </div>
      </div>
    `).join('');
  }
}

async function fetchAboutContent() {
  const aboutData = await supabaseFetch('about_content');
  if (aboutData && aboutData.length) {
    const data = aboutData[0];
    if (data.description) document.getElementById('about-description').innerText = data.description;
    if (data.vision) document.getElementById('about-vision').innerText = data.vision;
    if (data.experience) document.getElementById('about-experience').innerText = data.experience;
  }
}

async function loadServices() {
  const services = await supabaseFetch('services');
  const container = document.getElementById('services-list');
  if (container && services.length) {
    container.innerHTML = services.map(s => `
      <div class="card">
        <div class="card-body">
          <h3 style="color:var(--primary-blue);">${s.title}</h3>
          <p style="color:var(--text-muted); margin-top:10px;">${s.description}</p>
        </div>
      </div>
    `).join('');
  }
}

async function loadProjectsList() {
  const projects = await supabaseFetch('projects');
  const container = document.getElementById('projects-container');
  if (container) {
    container.innerHTML = projects.map(p => `
      <div class="card">
        <img src="${p.cover_url || 'assets/default-project.jpg'}" alt="${p.title}">
        <div class="card-body">
          <h3>${p.title}</h3>
          <p>${p.location || ''}</p>
          <a href="project-detail.html?id=${p.id}" class="btn" style="margin-top:10px;">عرض المشروع</a>
        </div>
      </div>
    `).join('');
  }
}

async function loadProjectDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  if (!projectId) return;

  const project = await supabaseFetch(`projects?id=eq.${projectId}`);
  if (project && project.length) {
    const p = project[0];
    document.getElementById('pd-title').innerText = p.title;
    document.getElementById('pd-cover').src = p.cover_url;
    document.getElementById('pd-location').innerText = p.location || '-';
    document.getElementById('pd-land-area').innerText = p.land_area || '-';
    document.getElementById('pd-built-area').innerText = p.built_area || '-';
    document.getElementById('pd-system').innerText = p.structural_system || '-';
    document.getElementById('pd-concept').innerText = p.concept || '';
    document.getElementById('pd-challenges').innerText = p.challenges || '';
  }
}

async function loadBlogPosts() {
  const posts = await supabaseFetch('blog_posts');
  const container = document.getElementById('blog-posts-container');
  if (container && posts.length) {
    container.innerHTML = posts.map(post => `
      <article style="background:#fff; padding:20px; border-radius:8px; margin-bottom:20px;">
        <h3 style="color:var(--primary-blue);">${post.title}</h3>
        <p style="margin:10px 0;">${post.content}</p>
        <hr style="border:0; border-top:1px solid var(--border-color); margin:15px 0;">
        <h4>التعليقات:</h4>
        <div id="comments-${post.id}" style="margin-top:10px;"></div>
        <form onsubmit="submitComment(event, '${post.id}')" style="display:flex; gap:10px; margin-top:10px;">
          <input type="text" placeholder="اكتب تعليقك..." required style="flex:1; padding:8px;">
          <button type="submit" class="btn">تعليق</button>
        </form>
      </article>
    `).join('');
  }
}

async function submitComment(event, postId) {
  event.preventDefault();
  const input = event.target.querySelector('input');
  const commentText = input.value;
  const username = "زائر_" + Math.floor(Math.random() * 8999 + 1000);

  await supabaseFetch('comments', 'POST', {
    post_id: postId,
    username: username,
    comment: commentText
  });
  
  input.value = '';
  alert('تمت إضافة تعليقك بنجاح!');
}
