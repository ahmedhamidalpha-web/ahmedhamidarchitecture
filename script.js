// Local Database initialized with default Projects
let projects = JSON.parse(localStorage.getItem('ahmed_hamid_projects')) || [
    {
        id: 1,
        title: "فيلا سكنية مودرن",
        location: "الخرطوم",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
        desc: "تصميم فيلا سكنية حديثة بتنسيق مساحات استثنائي واستهلاك ذكي للإضاءة."
    },
    {
        id: 2,
        title: "تعديل واجهة تجارية",
        location: "أم درمان",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600",
        desc: "تطوير واجهة مركز تجاري باستعمال خام الألومنيوم والزجاج العصري."
    }
];

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) targetPage.classList.add('active');

    if (pageId === 'home' || pageId === 'projects') {
        renderProjects();
    }
}

// Render Projects to HTML
function renderProjects() {
    const homeList = document.getElementById('home-projects-list');
    const allList = document.getElementById('all-projects-list');

    const html = projects.map(p => `
        <div class="card">
            <img src="${p.image}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/400x200?text=Architecture+Project'">
            <h3>${p.title}</h3>
            <p><i class="fa-solid fa-location-dot"></i> ${p.location}</p>
            <p>${p.desc}</p>
        </div>
    `).join('');

    if (homeList) homeList.innerHTML = html;
    if (allList) allList.innerHTML = html;
}

// Admin Logic
function loginAdmin() {
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;

    if (email === "ahmedhamidarchitecture@gmail.com" && pass === "123456") {
        document.getElementById('admin-login-box').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        renderAdminProjects();
    } else {
        alert("كلمة السر أو البريد غير صحيح! (كلمة السر الافتراضية: 123456)");
    }
}

function logoutAdmin() {
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('admin-login-box').classList.remove('hidden');
}

function saveProject(e) {
    e.preventDefault();
    const title = document.getElementById('p-title').value;
    const location = document.getElementById('p-location').value;
    const image = document.getElementById('p-image').value;
    const desc = document.getElementById('p-desc').value;

    const newProject = {
        id: Date.now(),
        title,
        location,
        image,
        desc
    };

    projects.unshift(newProject);
    localStorage.setItem('ahmed_hamid_projects', JSON.stringify(projects));
    
    alert("تم حفظ المشروع بنجاح!");
    document.getElementById('add-project-form').reset();
    renderAdminProjects();
    renderProjects();
}

function deleteProject(id) {
    if (confirm("هل تريد حذف هذا المشروع؟")) {
        projects = projects.filter(p => p.id !== id);
        localStorage.setItem('ahmed_hamid_projects', JSON.stringify(projects));
        renderAdminProjects();
        renderProjects();
    }
}

function renderAdminProjects() {
    const container = document.getElementById('admin-projects-list');
    if (!container) return;

    if (projects.length === 0) {
        container.innerHTML = "<p>لا توجد مشاريع حالياً.</p>";
        return;
    }

    container.innerHTML = projects.map(p => `
        <div class="admin-item">
            <span><strong>${p.title}</strong> (${p.location})</span>
            <button onclick="deleteProject(${p.id})" class="btn-danger">حذف</button>
        </div>
    `).join('');
}

// Contact Form Interception
document.getElementById('contact-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const form = this;
    fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
    }).then(res => {
        if (res.ok) {
            form.classList.add('hidden');
            document.getElementById('contact-success').classList.remove('hidden');
        } else {
            alert("حدث خطأ أثناء الإرسال، يرجى المحاولة لاحقاً.");
        }
    }).catch(() => alert("تعذر الاتصال بالشبكة."));
});

// Initializing home view
showPage('home');
