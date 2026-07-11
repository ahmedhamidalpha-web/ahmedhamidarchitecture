// 1. إعدادات الربط الموثقة بقاعدة بيانات Supabase الخاصة بك
const SUPABASE_URL = "https://fzlpqsvcicuvldaxgvcz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bHBxc3ZjaWN1dmxkYXhndmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3OTM1NjksImV4cCI6MjA5OTM2OTU2OX0.4YTOUuAv9RP5yGz_OF0Sh6ocZLMJa86HrVgAor97Lq8";
const GOOGLE_DRIVE_FOLDER_ID = "10ENiX9zYi3LGUwE_716WAP_rqGLReDUr";

const CORPORATE_CONFIG = {
    email: "ahmedhamidarchitecture@gmail.com",
    whatsapp: "249924372845"
};

// دالة جلب البيانات من السحاب
async function supabaseFetch(endpoint, options = {}) {
    const headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        ...options.headers
    };
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, { ...options, headers });
    return response.ok ? response.json() : Promise.reject(response.statusText);
}

document.addEventListener("DOMContentLoaded", () => {
    loadProjects();

    // تشغيل لوحة التحكم للأدمن لو مسجل دخول
    if (localStorage.getItem("isAdmin") === "true") {
        document.getElementById("adminPanelSection").style.display = "block";
    }

    // إصلاح الخروج: ربط زرار تسجيل الخروج بحذف الجلسة وإعادة التحميل
    const logoutBtn = document.querySelector("#adminPanelSection button");
    if (logoutBtn && logoutBtn.textContent.includes("تسجيل خروج")) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("isAdmin");
            window.location.reload();
        });
    }

    document.getElementById("adminLoginBtn").addEventListener("click", () => {
        if (localStorage.getItem("isAdmin") === "true") {
            alert("أنت مسجل الدخول بالفعل كأدمن يا هندسة!");
            return;
        }
        const userPass = prompt("أدخل كلمة المرور السرية للإدارة:");
        if (userPass === "AhmedHamid2026") {
            localStorage.setItem("isAdmin", "true");
            window.location.reload();
        } else {
            alert("خطأ في كلمة المرور!");
        }
    });

    // نشر المشروع من الأدمن
    const adminForm = document.getElementById("adminPublishForm");
    if(adminForm) {
        adminForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = adminForm.querySelector('button[type="submit"]');
            submitBtn.textContent = "جاري النشر...";
            
            const files = document.getElementById("postFiles").files;
            let driveImageIds = Array.from(files).map(() => "1" + Math.random().toString(36).substring(2, 10));

            const projectPayload = {
                title: document.getElementById("postTitle").value,
                location: document.getElementById("postLocation").value,
                plot_area: document.getElementById("postArea").value,
                components: document.getElementById("postComponents").value,
                design_concept: document.getElementById("postConcept").value,
                challenges: document.getElementById("postChallenges").value,
                result: document.getElementById("postResult").value,
                drive_image_ids: driveImageIds
            };

            try {
                await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
                    method: "POST",
                    headers: {
                        "apikey": SUPABASE_ANON_KEY,
                        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal"
                    },
                    body: JSON.stringify(projectPayload)
                });
                alert("تم رفع المشروع بنجاح!");
                adminForm.reset();
                loadProjects();
            } catch (err) { alert("حدث خطأ: " + err); }
            finally { submitBtn.textContent = "نشر المشروع الآن 🚀"; }
        });
    }
});

// عرض المشاريع والتعليقات
async function loadProjects() {
    const container = document.getElementById("posts-feed-container");
    if(!container) return;

    try {
        const projects = await supabaseFetch("projects?select=*,comments(*)&order=created_at.desc");
        container.innerHTML = projects.map(project => {
            const isAdmin = localStorage.getItem("isAdmin") === "true";
            const commentsHtml = project.comments.map(c => `<p><strong>${c.username}:</strong> ${c.comment_text}</p>`).join('');
            
            return `
                <div class="post-card" style="border:1px solid #eee; padding:20px; margin-bottom:20px; background:#fff;">
                    <h2>📋 اسم المشروع: ${project.title}</h2>
                    <p>📍 موقع المشروع: ${project.location}</p>
                    <p>📐 مساحة الأرض: ${project.plot_area}</p>
                    <p>🧱 مكونات المشروع: ${project.components}</p>
                    <p>💡 الفكرة التصميمية: ${project.design_concept}</p>
                    <p>⚠️ التحديات: ${project.challenges}</p>
                    <p>🏆 النتيجة: ${project.result}</p>
                    <div class="comments-section" style="margin-top:15px; background:#f9f9f9; padding:10px;">
                        <h4>💬 التعليقات:</h4>
                        <div id="comments-list-${project.id}">${commentsHtml}</div>
                    </div>
                    <div style="margin-top:10px; display:flex; gap:10px;">
                        <input type="text" id="user-${project.id}" placeholder="اسم المستخدم" style="padding:5px;">
                        <input type="text" id="text-${project.id}" placeholder="اكتب تعليقاً..." style="padding:5px; flex:1;">
                        <button onclick="submitComment(${project.id})" style="padding:5px 15px; background:#000; color:#fff; border:none; cursor:pointer;">تعليق</button>
                    </div>
                    ${isAdmin ? `<button onclick="deleteProject(${project.id})" style="background:red; color:white; border:none; padding:8px 15px; margin-top:15px; cursor:pointer;">حذف المشروع 🗑️</button>` : ''}
                </div>
            `;
        }).join('');
    } catch (err) { console.error(err); }
}

async function submitComment(projectId) {
    const username = document.getElementById(`user-${projectId}`).value;
    const text = document.getElementById(`text-${projectId}`).value;
    if(!username || !text) return alert("املا الخانات أولاً");
    
    await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
        method: "POST",
        headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, username, comment_text: text })
    });
    loadProjects();
}

async function deleteProject(id) {
    if(confirm("هل متأكد من حذف المشروع نهائياً؟")) {
        await fetch(`${SUPABASE_URL}/rest/v1/projects?id=eq.${id}`, {
            method: "DELETE",
            headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}` }
        });
        loadProjects();
    }
}
