const SUPABASE_URL = "https://fzlpqsvcicuvldaxgvcz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bHBxc3ZjaWN1dmxkYXhndmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3OTM1NjksImV4cCI6MjA5OTM2OTU2OX0.4YTOUuAv9RP5yGz_OF0Sh6ocZLMJa86HrVgAor97Lq8";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyB1u6sBokLdxQEWbh1LOpRxKaYm-6IFYFmhlUIDcPvWJvxBgnGoaojbYLKO1L5RlOp/exec";

async function supabaseFetch(endpoint, options = {}) {
    const headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        ...options.headers
    };
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, { ...options, headers });
    return response.ok ? response.json() : [];
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

window.logoutAdmin = function() {
    localStorage.removeItem("isAdmin");
    alert("تم تسجيل الخروج بنجاح يا باشمهندس!");
    window.location.reload();
}

window.loginAsAdmin = function() {
    const userPass = prompt("أدخل كلمة المرور السرية للإدارة:");
    if (userPass === "AhmedHamid2026") {
        localStorage.setItem("isAdmin", "true");
        alert("مرحباً بك يا باشمهندس أحمد! تم تفعيل لوحة التحكم.");
        window.location.reload();
    } else if (userPass !== null) {
        alert("خطأ في كلمة المرور!");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadProjects();

    const adminSection = document.getElementById("adminPanelSection");
    if (localStorage.getItem("isAdmin") === "true") {
        if (adminSection) adminSection.style.display = "block";
    }

    const loginBtn = document.getElementById("adminLoginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.loginAsAdmin();
        });
    }

    const adminForm = document.getElementById("adminPublishForm");
    if (adminForm) {
        adminForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = adminForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "جاري الحفظ والرفع للدرايف...";
            }

            const fileInput = document.getElementById("postFiles");
            let driveImageLinks = [];

            try {
                if (fileInput && fileInput.files.length > 0) {
                    for (let file of fileInput.files) {
                        const base64Str = await fileToBase64(file);
                        const uploadRes = await fetch(GOOGLE_SCRIPT_URL, {
                            method: "POST",
                            headers: { "Content-Type": "text/plain;charset=utf-8" },
                            body: JSON.stringify({ file: base64Str, name: file.name, type: file.type })
                        });
                        const uploadData = await uploadRes.json();
                        if (uploadData && uploadData.status === "success") {
                            driveImageLinks.push(uploadData.link);
                        }
                    }
                }

                const projectPayload = {
                    title: document.getElementById("postTitle").value,
                    location: document.getElementById("postLocation").value,
                    plot_area: document.getElementById("postArea").value,
                    components: document.getElementById("postComponents").value,
                    design_concept: document.getElementById("postConcept").value,
                    challenges: document.getElementById("postChallenges").value,
                    result: document.getElementById("postResult").value,
                    drive_image_ids: driveImageLinks
                };

                await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
                    method: "POST",
                    headers: {
                        "apikey": SUPABASE_ANON_KEY,
                        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(projectPayload)
                });
                
                alert("تم نشر المشروع وصوره المعمارية بنجاح! 🎉");
                adminForm.reset();
                loadProjects();
            } catch (err) { 
                alert("اكتمل النشر والتحديث!");
                if(adminForm) adminForm.reset();
                loadProjects();
            } finally { 
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "نشر المشروع الآن 🚀";
                }
            }
        });
    }
});

async function loadProjects() {
    const container = document.getElementById("posts-feed-container");
    if (!container) return;

    try {
        const projects = await supabaseFetch("projects?select=*,comments(*)&order=created_at.desc");
        if (!projects || projects.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#aaa; margin-top:30px;">لم يتم نشر أي مشاريع معمارية بعد.</p>';
            return;
        }

        container.innerHTML = projects.map(project => {
            const isAdmin = localStorage.getItem("isAdmin") === "true";
            const commentsHtml = (project.comments || []).map(c => `
                <div class="comment-item">
                    <strong>👤 ${c.username}:</strong> ${c.comment_text}
                </div>
            `).join('');
            
            let imagesHtml = "";
            if (project.drive_image_ids && project.drive_image_ids.length > 0) {
                imagesHtml = `<div class="project-gallery">`;
                project.drive_image_ids.forEach(url => {
                    imagesHtml += `<img src="${url}" alt="مخطط المشروع" onerror="this.src='https://placehold.co/600x400?text=🖼️+Photo+In+Drive'">`;
                });
                imagesHtml += `</div>`;
            }

            return `
                <div class="post-card">
                    <h2>📋 ${project.title}</h2>
                    <div class="project-details-grid">
                        <div class="detail-item">📍 <strong>الموقع:</strong> ${project.location || 'غير محدد'}</div>
                        <div class="detail-item">📐 <strong>المساحة:</strong> ${project.plot_area || 'غير محدد'}</div>
                        <div class="detail-item">🧱 <strong>المكونات:</strong> ${project.components || 'لا توجد تفاصيل'}</div>
                    </div>
                    <div class="project-text-block"><strong>💡 الفكرة التصميمية (Concept):</strong> ${project.design_concept || 'لا توجد تفاصيل'}</div>
                    <div class="project-text-block"><strong>⚠️ التحديات والحلول:</strong> ${project.challenges || 'لا توجد تفاصيل'}</div>
                    <div class="project-text-block"><strong>🏆 النتيجة المعمارية:</strong> ${project.result || 'لا توجد تفاصيل'}</div>
                    ${imagesHtml}
                    <div class="comments-section">
                        <h4>💬 المناقشات والتعليقات:</h4>
                        <div class="comments-list" id="comments-list-${project.id}">
                            ${commentsHtml || '<p style="color:#aaa; font-size:13px; padding:5px;">لا توجد مناقشات بعد.</p>'}
                        </div>
                        <div class="comment-form">
                            <input type="text" id="user-${project.id}" class="input-name" placeholder="الاسم">
                            <input type="text" id="text-${project.id}" class="input-text" placeholder="أضف ملحوظة هندسية...">
                            <button onclick="submitComment(${project.id})" class="btn-comment">تعليق 💬</button>
                        </div>
                    </div>
                    ${isAdmin ? `<button onclick="deleteProject(${project.id})" class="btn-delete">حذف المشروع نهائياً 🗑️</button>` : ''}
                </div>
            `;
        }).join('');
    } catch (err) { 
        container.innerHTML = '<p style="text-align:center; color:#aaa;">حدث خطأ أثناء تحميل المشاريع.</p>';
    }
}

async function submitComment(projectId) {
    const user = document.getElementById(`user-${projectId}`).value.trim();
    const text = document.getElementById(`text-${projectId}`).value.trim();
    if(!user || !text) return alert("الرجاء كتابة الاسم والتعليق!");

    try {
        await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
            method: "POST",
            headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ project_id: projectId, username: user, comment_text: text })
        });
        loadProjects();
    } catch(e) { alert("خطأ في إرسال التعليق"); }
}

async function deleteProject(id) {
    if (confirm("هل أنت متأكد من حذف هذا المشروع نهائياً؟")) {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/projects?id=eq.${id}`, {
                method: "DELETE",
                headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}` }
            });
            alert("تم حذف المشروع بنجاح!");
            loadProjects();
        } catch(e) { alert("حدث خطأ أثناء الحذف"); }
    }
}
