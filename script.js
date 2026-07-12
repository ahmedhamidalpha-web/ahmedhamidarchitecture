// -------------------------------------------------------------
// ⚙️ Ahmed Hamid Architecture - Official Control Script (V2.2)
// -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminPanelSection = document.getElementById('adminPanelSection');
    const adminPublishForm = document.getElementById('adminPublishForm');
    const postsFeedContainer = document.getElementById('posts-feed-container');
    const btnLogout = document.querySelector('.btn-logout');

    // مصفوفة لتخزين المشاريع (تشتغل محلياً في المتصفح للحفظ المؤقت)
    let projectsList = JSON.parse(localStorage.getItem('architect_projects')) || [];

    // 1. فتح وإغلاق لوحة التحكم عند الضغط على الزر العلوي
    if (adminLoginBtn && adminPanelSection) {
        adminLoginBtn.addEventListener('click', () => {
            if (adminPanelSection.style.display === 'none') {
                adminPanelSection.style.display = 'block';
                adminPanelSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                adminPanelSection.style.display = 'none';
            }
        });
    }

    // 2. زر الخروج داخل لوحة التحكم لإخفائها
    if (btnLogout && adminPanelSection) {
        btnLogout.addEventListener('click', () => {
            adminPanelSection.style.display = 'none';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 3. دالة لعرض كروت المشاريع ديناميكياً في الصفحة
    function renderProjects() {
        if (!postsFeedContainer) return;
        postsFeedContainer.innerHTML = '';

        if (projectsList.length === 0) {
            postsFeedContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #64748b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <p style="font-size: 1.1rem; font-weight: 600;">مرحباً بك في المعرض الهندسي</p>
                    <p style="font-size: 0.85rem; margin-top: 5px;">لم يتم نشر أي مشاريع معمارية حتى الآن.</p>
                </div>
            `;
            return;
        }

        projectsList.forEach((project) => {
            const card = document.createElement('article');
            card.className = 'post-card';

            card.innerHTML = `
                <h2>${project.title}</h2>
                <div class="project-details-grid">
                    <div class="detail-item"><strong>📍 الموقع:</strong> ${project.location || 'غير محدد'}</div>
                    <div class="detail-item"><strong>📐 المساحة:</strong> ${project.area || 'غير محدد'}</div>
                    <div class="detail-item"><strong>🧱 المكونات:</strong> ${project.components || 'غير محدد'}</div>
                </div>
                <div class="project-text-block">
                    <strong>💡 الفكرة التصميمية (Concept):</strong>
                    <p>${project.concept || 'لا يوجد شرح متاح.'}</p>
                </div>
                <div class="project-text-block">
                    <strong>⚠️ التحديات الحلول المعمارية:</strong>
                    <p>${project.challenges || 'لا توجد تحديات مسجلة.'}</p>
                </div>
                <div class="project-text-block">
                    <strong>🏆 المخرج النهائي للمشروع:</strong>
                    <p>${project.result || 'لا يوجد مخرج مسجل.'}</p>
                </div>
                <div class="project-gallery" id="gallery-${project.id}">
                    </div>
            `;

            postsFeedContainer.appendChild(card);

            // عرض الصور إذا كانت مرفقة كـ Base64
            const galleryDiv = document.getElementById(`gallery-${project.id}`);
            if (galleryDiv && project.images && project.images.length > 0) {
                project.images.forEach(imgData => {
                    const img = document.createElement('img');
                    img.src = imgData;
                    img.alt = project.title;
                    galleryDiv.appendChild(img);
                });
            } else if (galleryDiv) {
                galleryDiv.style.display = 'none';
            }
        });
    }

    // 4. معالجة نموذج نشر مشروع جديد
    if (adminPublishForm) {
        adminPublishForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('postTitle').value;
            const location = document.getElementById('postLocation').value;
            const area = document.getElementById('postArea').value;
            const components = document.getElementById('postComponents').value;
            const concept = document.getElementById('postConcept').value;
            const challenges = document.getElementById('postChallenges').value;
            const result = document.getElementById('postResult').value;
            const fileInput = document.getElementById('postFiles');

            const images = [];

            // قراءة الملفات المرفقة وتحويلها لصيغة يمكن عرضها محلياً
            if (fileInput && fileInput.files.length > 0) {
                const readFilesPromises = Array.from(fileInput.files).map(file => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            images.push(event.target.result);
                            resolve();
                        };
                        reader.readAsDataURL(file);
                    });
                });
                await Promise.all(readFilesPromises);
            }

            // إنشاء كائن المشروع الجديد
            const newProject = {
                id: Date.now(),
                title,
                location,
                area,
                components,
                concept,
                challenges,
                result,
                images
            };

            // الحفظ والتحديث
            projectsList.unshift(newProject);
            localStorage.setItem('architect_projects', JSON.stringify(projectsList));
            
            // إعادة تعيين الفورم وإخفاء اللوحة
            adminPublishForm.reset();
            if (adminPanelSection) adminPanelSection.style.display = 'none';
            
            // تحديث العرض المعماري فوراً
            renderProjects();
            window.scrollTo({ top: document.getElementById('posts-feed-container').offsetTop - 100, behavior: 'smooth' });
        });
    }

    // تشغيل العرض الأولي للمشاريع عند فتح الصفحة
    renderProjects();
});
