const SUPABASE_URL = "https://fzlpqsvcicuvldaxgvcz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bHBxc3ZjaWN1dmxkYXhndmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3OTM1NjksImV4cCI6MjA5OTM2OTU2OX0.4YTOUuAv9RP5yGz_OF0Sh6ocZLMJa86HrVgAor97Lq8";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwFd_q0GcRNc4qEI1NBlHAJxE_cLlmNzdTRXKJkO1wiPt6TUj05aSUWL76uM1YeD3hJ/exec";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function uploadFiles(files) {
    if(files.length === 0) return [];
    const formData = new FormData();
    for(let i = 0; i < files.length; i++) { formData.append("files", files[i]); }
    const res = await fetch(APPS_SCRIPT_URL, { method: "POST", body: formData });
    const result = await res.json();
    return result.urls || [];
}

document.addEventListener('DOMContentLoaded', () => {
    // Login
    document.getElementById('submitLoginBtn')?.addEventListener('click', () => {
        if(loginUsername.value === "ahmed" && loginPassword.value === "123"){
            sessionStorage.setItem('isAdminLoggedIn', 'true'); window.location.href = "dashboard.html";
        } else { loginError.innerText = "خطأ في الدخول"; }
    });

    // Dashboard
    if(window.location.pathname.includes('dashboard.html')){
        if(sessionStorage.getItem('isAdminLoggedIn')!== 'true'){ window.location.href = "admin.html"; }
        document.getElementById('logoutBtn')?.addEventListener('click', () => { sessionStorage.removeItem('isAdminLoggedIn'); window.location.href = "admin.html"; });

        document.getElementById('addProjectForm')?.addEventListener('submit', async (e) => {
            e.preventDefault(); uploadStatus.innerText = "جاري الرفع...";
            const urls = await uploadFiles(pImages.files);
            await supabase.from('projects').insert([{ title: pTitle.value, location: pLocation.value, area: pArea.value, concept: pConcept.value, images: urls, likes: 0 }]);
            alert("تم النشر"); e.target.reset(); uploadStatus.innerText = "";
        });

        document.getElementById('addJobForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await supabase.from('jobs').insert([{ title: jTitle.value, location: jLocation.value, description: jDesc.value }]);
            alert("تم نشر الوظيفة"); e.target.reset();
        });
    }

    // Load Data
    async function loadData() {
        const latest = document.getElementById('latest-projects');
        if(latest) {
            const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(3);
            latest.innerHTML = data?.map(p => `<div class="post-card"><img src="${p.images[0]}"><div class="post-content"><h3>${p.title}</h3><p>${p.location}</p></div></div>`).join('') || "";
        }
        const all = document.getElementById('posts-feed-container');
        if(all) {
            const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
            all.innerHTML = data?.map(p => `<div class="post-card">${p.images.map(img=>`<img src="${img}">`).join('')}<div class="post-content"><h3>${p.title}</h3><p>${p.concept}</p></div></div>`).join('') || "";
        }
        const jobs = document.getElementById('jobs-container');
        if(jobs) {
            const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
            jobs.innerHTML = data?.map(j => `<div class="admin-card"><h3>${j.title}</h3><p>${j.description}</p></div>`).join('') || "";
        }
    }
    loadData();
});