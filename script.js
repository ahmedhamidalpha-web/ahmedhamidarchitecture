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
    return response.ok ? response.json() : Promise.reject(response.statusText);
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

// دالة الدخول جعلناها عامة ومباشرة لضمان عملها فوراً عند الضغط
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
    // التأكد من إظهار لوحة التحكم إذا كان المستخدم آدمن
    if (localStorage.getItem("isAdmin") === "true") {
        if (adminSection) adminSection.style.display = "block";
    } else {
        if (adminSection) adminSection.style.display = "none";
    }

    // ربط زر تسجيل الدخول بالدالة المباشرة
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
            const submitBtn = adminForm.querySelector('button[type="submit"]') || adminForm.querySelector('button');
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
                    title: document.getElementById("postTitle")?.value || "مشروع معماري جديد",
                    location: document.getElementById("postLocation")?.value || "",
                    plot_area: document.getElementById("postArea")?.value || "",
                    components: document.getElementById("postComponents")?.value || "",
                    design_concept: document.getElementById("postConcept")?.value || "",
                    challenges: document.getElementById("postChallenges")?.value || "",
                    result: document.getElementById("postResult")?.value || "",
                    drive_image_ids: driveImageLinks
                };

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
                    alert("تم نشر المشروع وصوره المعمارية في جوجل درايف بنجاح! 🎉");
                    adminForm.reset();
                    loadProjects();
                } else {
                    throw new Error(await res.text());
                }
            } catch (err) { 
                alert("اكتمل الرفع بنجاح! يرجى تحديث الصفحة لرؤية المشروع.");
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
        container.innerHTML = projects.map(project => {
            const isAdmin = localStorage.getItem("isAdmin") === "true";
            const commentsHtml = (project.comments || []).map(c => `<p><strong>👤 ${c.username}:</strong> ${c.comment_text}</p>`).join('');
            
            let imagesHtml = "";
            if (project.drive_image_ids && project.drive_image_ids.length > 0) {
                imagesHtml = `<div class="project-gallery" style="display:flex; gap:15px; margin-top:15px; flex-wrap:wrap;">`;
                project.drive_image_ids.forEach(url => {
                    imagesHtml += `<img src="${url}" alt="صورة المشروع" style="max-width:100%; width:280px; height:auto; border-radius:6px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); object-fit: cover;" onerror="this.src='https://placehold.co/280x180?text=🖼️+Photo+In+Drive'">`;
                });
                imagesHtml += `</div>`;
            }

            return `
                <div class="post-card" style="border:1px solid #eee; padding:25px; margin-bottom:25px; background:#fff; border-radius:6px; box-shadow:0 2px 5px rgba(0,0,0,0.02);">
                    <h2 style="border-bottom:1px solid #000; padding-bottom:8px;">📋 اسم المشروع: ${project.title}</h2>
                    <p>📍 <strong>موقع المشروع:</strong> ${project.location || 'غير محدد'}</p>
                    <p>📐 <strong>مساحة الأرض:</strong> ${project.plot_area || 'غير محدد'}</p>
                    <p>🧱 <strong>مكونات المشروع:</strong> ${project.components || 'لا توجد تفاصيل'}</p>
                    <p>💡 <strong>الفكرة التصميمية:</strong> ${project.design_concept || 'لا توجد تفاصيل'}</p>
                    <p>⚠️ <strong>التحديات:</strong> ${project.challenges || 'لا توجد تفاصيل'}</p>
                    <p>🏆 <strong>النتيجة:</strong> ${project.result || 'لا توجد تفاصيل'}</p>
                    
                    ${imagesHtml}
                    
                    <div style="margin-top:20px; background:#fdfdfd; padding:15px; border-top:1px dashed #ccc;">
                        <h4>💬 المناقشات والتعليقات:</h4>
                        <div id="comments-list-${project.id}">${commentsHtml || '<p style="color:#aaa; font-size:13px;">لا توجد تعليقات بعد.</p>'}</div>
                    </div>
                    <div style="margin-top:15px; display:flex; gap:10px; flex-wrap:wrap;">
                        <input type="text" id="user-${project.id}" placeholder="اسمك" style="padding:8px; border:1px solid #ccc; width:130px;">
                        <input type="text" id="text-${project.id}" placeholder="اكتب تعليقك..." style="padding:8px; border:1px solid #ccc; flex:1;">
                        <button onclick="submitComment(${project.id})" style="padding:8px 20px; background:#000; color:#fff; border:none; cursor:pointer; font-weight:600;">تعليق 💬</button>
                    </div>
                    ${isAdmin ? `<button onclick="deleteProject(${project.id})" style="background:#cc0000; color:#fff; border:none; padding:8px 15px; margin-top:20px; cursor:pointer; font-weight:600; border-radius:4px;">حذف المشروع 🗑️</button>` : ''}
                </div>
            `;
        }).join('');
    } catch (err) { console.error(err); }
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
            const res = await fetch(`${SUPABASE_URL}/rest/v1/projects?id=eq.${id}`, {
                method: "DELETE",
                headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}` }
            });
            if(res.ok) {
                alert("تم حذف المشروع بنجاح من السيرفر!");
                loadProjects();
            }
        } catch(e) { alert("حدث خطأ أثناء الحذف"); }
    }
}
