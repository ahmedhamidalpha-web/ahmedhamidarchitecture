// استبدل دالة loadProjects القديمة في ملف script.js بهذه النسخة
async function loadProjects() {
    const container = document.getElementById("posts-feed-container");
    if (!container) return;

    try {
        const projects = await supabaseFetch("projects?select=*,comments(*)&order=created_at.desc");
        if (!projects || projects.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#64748b; margin-top:30px; font-size:0.95rem;">لم يتم رفع أو توثيق أي مشاريع معمارية بعد.</p>';
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
                    imagesHtml += `<img src="${url}" alt="مخطط ورندر المشروع" onerror="this.src='https://placehold.co/600x400?text=🖼️+Photo+In+Drive'">`;
                });
                imagesHtml += `</div>`;
            }

            return `
                <div class="post-card">
                    <h2>📋 ${project.title}</h2>
                    
                    <div class="project-details-grid">
                        <div class="detail-item">📍 <strong>الموقع الجغرافي:</strong> ${project.location || 'غير محدد'}</div>
                        <div class="detail-item">📐 <strong>مساحة المسطح:</strong> ${project.plot_area || 'غير محدد'}</div>
                        <div class="detail-item">🧱 <strong>عناصر المشروع:</strong> ${project.components || 'لا توجد تفاصيل'}</div>
                    </div>
                    
                    <div class="project-text-block"><strong>💡 الفكرة التصميمية (Concept):</strong> ${project.design_concept || 'لا توجد تفاصيل'}</div>
                    <div class="project-text-block"><strong>⚠️ التحديات والحلول الإنشائية:</strong> ${project.challenges || 'لا توجد تفاصيل'}</div>
                    <div class="project-text-block"><strong>🏆 المخرج المعماري النهائي:</strong> ${project.result || 'لا توجد تفاصيل'}</div>
                    
                    ${imagesHtml}
                    
                    <div class="comments-section">
                        <h4>💬 المناقشات والاستفسارات على المخطط:</h4>
                        <div class="comments-list" id="comments-list-${project.id}">
                            ${commentsHtml || '<p style="color:#aaa; font-size:13px; padding:5px;">لا توجد مناقشات بعد.</p>'}
                        </div>
                        <div class="comment-form">
                            <input type="text" id="user-${project.id}" class="input-name" placeholder="الاسم">
                            <input type="text" id="text-${project.id}" class="input-text" placeholder="أضف استفسار أو ملحوظة هندسية...">
                            <button onclick="submitComment(${project.id})" class="btn-comment">تعليق 💬</button>
                        </div>
                    </div>
                    
                    ${isAdmin ? `<button onclick="deleteProject(${project.id})" class="btn-delete">حذف المشروع 🗑️</button>` : ''}
                </div>
            `;
        }).join('');
    } catch (err) { 
        container.innerHTML = '<p style="text-align:center; color:#ef4444;">حدث خطأ أثناء الاتصال بقاعدة البيانات وسحب المشاريع.</p>';
    }
}
