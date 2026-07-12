const SUPABASE_URL = "https://fzlpqsvcicuvldaxgvcz.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bHBxc3ZjaWN1dmxkYXhndmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3OTM1NjksImV4cCI6MjA5OTM2OTU2OX0.4YTOUuAv9RP5yGz_OF0Sh6ocZLMJa86HrVgAor97Lq8"
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwFd_q0GcRNc4qEI1NBlHAJxE_cLlmNzdTRXKJkO1wiPt6TUj05aSUWL76uM1YeD3hJ/exec";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. جلب وعرض المشاريع + القلب + التعليقات
async function renderProjects() {
  const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  const container = document.getElementById('posts-feed-container');
  container.innerHTML = data.map(p => `
    <div class="post-card">
      <h3>${p.title}</h3>
      <div class="project-gallery">${p.images ? p.images.map(img => `<img src="${img}">`).join('') : ''}</div>
      <div class="project-details-grid">
        <div><strong>📍 الموقع:</strong> ${p.location}</div>
        <div><strong>📐 المساحة:</strong> ${p.area}</div>
      </div>
      <p><strong>الفكرة:</strong> ${p.concept}</p>
      <button onclick="likeProject(${p.id}, ${p.likes})" class="btn-like">❤️ ${p.likes}</button>
      <div class="comments-section">
        <input type="text" id="comment-${p.id}" placeholder="اضف تعليق...">
        <button onclick="addComment(${p.id})">ارسال</button>
      </div>
    </div>
  `).join('');
}

// 2. ارسال طلب العميل للايميل عبر Apps Script
document.getElementById('clientRequestForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    name: clientName.value, phone: clientPhone.value, email: clientEmail.value,
    location: projectLocation.value, area: projectArea.value, details: clientDetails.value, type: 'client_request'
  };
  await fetch(APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify(data) });
  alert("تم استلام طلبك. سنتواصل معك قريبا");
  e.target.reset();
});

// 3. تسجيل الدخول للادمن
document.getElementById('submitLoginBtn').addEventListener('click', () => {
    if(loginUsername.value === "ahmed" && loginPassword.value === "123"){
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        document.getElementById('adminPanelSection').style.display = 'block';
        document.getElementById('loginFormSection').style.display = 'none';
    }
});

renderProjects();
