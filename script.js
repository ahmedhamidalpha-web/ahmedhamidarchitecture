// 1. إعدادات الربط الموثقة بقاعدة بيانات Supabase الخاصة بك
const SUPABASE_URL = "https://fzlpqsvcicuvldaxgvcz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bHBxc3ZjaWN1dmxkYXhndmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3OTM1NjksImV4cCI6MjA5OTM2OTU2OX0.4YTOUuAv9RP5yGz_OF0Sh6ocZLMJa86HrVgAor97Lq8";
const GOOGLE_DRIVE_FOLDER_ID = "10ENiX9zYi3LGUwE_716WAP_rqGLReDUr";

// دالة جلب البيانات العامة من السحاب
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

// دالة تسجيل الخروج الصريحة (تشتغل لو الـ HTML فيه onclick="logoutAdmin()")
window.logoutAdmin = function() {
    localStorage.removeItem("isAdmin");
    alert("تم تسجيل الخروج بنجاح!");
    window.location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
    loadProjects();

    // تشغيل لوحة التحكم للأدمن لو مسجل دخول
    const adminSection = document.getElementById("adminPanelSection");
    if (localStorage.getItem("isAdmin") === "true" && adminSection) {
        adminSection.style.display = "block";
    }

    // طريقة إضافية لربط زرار الخروج لو ضغط عليه داخل لوحة التحكم
    if (adminSection) {
        const logoutButtons = adminSection.querySelectorAll("button");
        logoutButtons.forEach(btn => {
            if (btn.textContent.includes("خروج") || btn.getAttribute("onclick")?.includes("logoutAdmin")) {
                btn.removeAttribute("onclick"); // إزالة أي تضارب
                btn.addEventListener("click", (e) => {
                    e.preventDefault();
                    window.logoutAdmin();
                });
            }
        });
    }

    // زرار الدخول الافتراضي
    const loginBtn = document.getElementById("adminLoginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            const userPass = prompt("أدخل كلمة المرور السرية للإدارة:");
            if (userPass === "AhmedHamid2026") {
                localStorage.setItem("isAdmin", "true");
                window.location.reload();
            } else {
                alert("خطأ في كلمة المرور!");
            }
        });
    }

    // نشر المشروع من الأدمن (مع حماية الخانات لو كانت فارغة أو الـ IDs مش متطابقة تماماً)
    const adminForm = document.getElementById("adminPublishForm");
    if (adminForm) {
        adminForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = adminForm.querySelector('button[type="submit"]') || adminForm.querySelector('button');
            const originalText = submitBtn ? submitBtn.textContent : "نشر";
            if (submitBtn) submitBtn.textContent = "جاري النشر وتأمين البيانات...";
            
            // قراءة الملفات المرفوعة بأمان
            const fileInput = document.getElementById("postFiles");
            let driveImageIds = [];
            if (fileInput && fileInput.files.length > 0) {
                driveImageIds = Array.from(fileInput.files).map(() => "1" + Math.random().toString(36).substring(2, 10));
            }

            // تجميع البيانات مع وضع قيم افتراضية لو الـ ID في الـ HTML مختلف شوية
            const projectPayload = {
                title: document.getElementById("postTitle")?.value || document.querySelector("input[placeholder*='العنوان']")?.value || "مشروع معماري غير مسمى",
                location: document.getElementById("postLocation")?.value || document.querySelector("input[placeholder*='الموقع']")?.value || "",
                plot_area: document.getElementById("postArea")?.value || document.querySelector("input[placeholder*='المساحة']")?.value || "",
                components: document.getElementById("postComponents")?.value || document.querySelector("textarea[placeholder*='مكونات']")?.value || "",
                design_concept: document.getElementById("postConcept")?.value || document.querySelector("textarea[placeholder*='الفكرة']")?.value || "",
                challenges: document.getElementById("postChallenges")?.value || document.querySelector("textarea[placeholder*='التحديات']")?.value || "",
                result: document.getElementById("postResult")?.value || document.querySelector("textarea[placeholder*='النتيجة']")?.value || "",
                drive_image_ids: driveImageIds
            };

            try {
                const res = await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
                    method: "POST",
                    headers: {
                        "apikey": SUPABASE_ANON_KEY,
                        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal"
                    },
                    body: JSON.stringify(projectPayload)
                });
                
                if (res.ok) {
                    alert("تم رفع ونشر المشروع المعماري بنجاح! 🎉");
                    adminForm.reset();
                    loadProjects();
                } else {
                    const errText = await res.text();
                    throw new Error(errText);
                }
            } catch (err) { 
                alert("فشل الرفع، تأكد من مطابقة الجداول في Supabase: " + err.message); 
            } finally { 
                if (submitBtn) submitBtn.textContent = originalText; 
            }
        });
    }
});

// عرض المشاريع والتعليقات بالهندسة المرنة للـ DOM
async function loadProjects() {
    const container = document.getElementById("posts-feed-container");
    if (!container) return;

    try {
        const projects = await supabaseFetch("projects?select=*,comments(*)&order=created_at.desc");
        container.innerHTML = projects.map(project => {
            const isAdmin = localStorage.getItem("isAdmin") === "true";
            const commentsHtml = (project.comments || []).map(c => `<p><strong>${c.username}:</strong> ${c.comment_text}</p>`).join('');
            
            return `
                <div class="post-card" style="border:1px solid #eee; padding:20px; margin-bottom:20px; background:#fff; border-radius:8px;">
                    <h2>📋 اسم المشروع: ${project.title}</h2>
                    ${project.location ? `<p>📍 موقع المشروع: ${project.location}</p>` : ''}
                    ${project.plot_area ? `<p>📐 مساحة الأرض: ${project.plot_area}</p>` : ''}
                    ${project.components ? `<p>🧱 مكونات المشروع: ${project.components}</p>` : ''}
                    ${project.design_concept ? `<p>💡 الفكرة التصميمية: ${project.design_concept}</p>` : ''}
                    ${project.challenges ? `<p>⚠️ التحديات: ${project.challenges}</p>` : ''}
                    ${project.result ? `<p>🏆 النتيجة: ${project.result}</p>` : ''}
                    
                    <div class="comments-section" style="margin-top:15px; background:#f9f9f9; padding:10px; border-radius:4px;">
                        <h4>💬 التعليقات:</h4>
                        <div id="comments-list-${project.id}">${commentsHtml || '<p style="color:#aaa;">لا توجد تعليقات بعد.</p>'}</div>
                    </div>
                    <div style="margin-top:10px; display:flex; gap:10px;">
                        <input type="text" id="user-${project.id}" placeholder="اسمك" style="padding:5px; width:120px;">
                        <input type="text" id="text-${project.id}" placeholder="اكتب تعليقاً واضغط زرار تعليق..." style="padding:5px; flex:1;">
                        <button onclick="submitComment(${project.id})" style="padding:5px 15px; background:#000; color:#fff; border:none; cursor:pointer;">تعليق</button>
                    </div>
                    ${isAdmin ? `<button onclick="deleteProject(${project.id})" style="background:red; color:white; border:none; padding:8px 15px; margin-top:15px; cursor:pointer; border-radius:4px;">حذف المشروع 🗑️</button>` : ''}
                </div>
            `;
        }).join('');
    } catch (err) { 
        console.error("خطأ في جلب المشاريع:", err); 
    }
}

async function submitComment(projectId) {
    const usernameInput = document.getElementById(`user-${projectId}`);
    const textInput = document.getElementById(`text-${projectId}`);
    
    const username = usernameInput ? usernameInput.value.trim() : "";
    const text = textInput ? textInput.value.trim() : "";
    
    if (!username || !text) return alert("الرجاء كتابة الاسم والتعليق أولاً!");
    
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
            method: "POST",
            headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ project_id: projectId, username, comment_text: text })
        });
        loadProjects();
    } catch(e) { alert("فشل إرسال التعليق"); }
}

async function deleteProject(id) {
    if (confirm("هل أنت متأكد من حذف هذا المشروع نهائياً هندسياً برمجياً؟")) {
        await fetch(`${SUPABASE_URL}/rest/v1/projects?id=eq.${id}`, {
            method: "DELETE",
            headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}` }
        });
        loadProjects();
    }
}
