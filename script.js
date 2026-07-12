// -------------------------------------------------------------
// 🔒 Ahmed Hamid Architecture - Secure Control Script (V2.3)
// -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminPanelSection = document.getElementById('adminPanelSection');
    const adminPublishForm = document.getElementById('adminPublishForm');
    const postsFeedContainer = document.getElementById('posts-feed-container');
    const btnLogout = document.querySelector('.btn-logout');

    // 🔑 بيانات الدخول الخاصة بك (تقدر تغيرها من هنا)
    const ADMIN_USERNAME = "ahmed";
    const ADMIN_PASSWORD = "123"; // حط الباسورد العايزه هنا

    // مصفوفة لتخزين المشاريع محلياً
    let projectsList = JSON.parse(localStorage.getItem('architect_projects')) || [];

    // التحقق من حالة تسجيل الدخول عند فتح الصفحة
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        if (adminPanelSection) adminPanelSection.style.display = 'block';
        if (adminLoginBtn) adminLoginBtn.textContent = 'لوحة التحكم مفتوحة ⚙️';
    }

    // 1. زر لوحة التحكم (يطلب الإيميل والباسورد إذا لم يكن مسجلاً)
    if (adminLoginBtn && adminPanelSection) {
        adminLoginBtn.addEventListener('click', () => {
            // إذا كان مسجل دخول مسبقاً، يخفي أو يظهر اللوحة طوالي
            if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
                if (adminPanelSection.style.display === 'none') {
                    adminPanelSection.style.display = 'block';
                    adminPanelSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    adminPanelSection.style.display = 'none';
                }
                return;
            }

            // إذا لم يكن مسجل دخول، يطلب البيانات عبر نافذة (Prompt)
            const inputUser = prompt("الرجاء إدخال اسم المستخدم الخاص بالمهندس أحمد:");
            if (inputUser === null) return; // إلغاء الأمر

            const inputPass = prompt("الرجاء إدخال كلمة المرور:");
            if (inputPass === null) return; // إلغاء الأمر

            // التحقق من صحة البيانات
            if (inputUser.trim() === ADMIN_USERNAME && inputPass === ADMIN_PASSWORD) {
                alert("تم تسجيل الدخول بنجاح يا باشمهندس! 📐");
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                adminPanelSection.style.display = 'block';
                adminLoginBtn.textContent = 'لوحة التحكم مفتوحة ⚙️';
                adminPanelSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                alert("عذراً! البيانات غير صحيحة، لا تملك صلاحية الدخول. ❌");
            }
        });
    }

    // 2. زر تسجيل الخروج (🚪) لحماية اللوحة وإغلاق الجلسة
    if (btnLogout && adminPanelSection) {
        btnLogout.addEventListener('click', () => {
            sessionStorage.removeItem('isAdminLoggedIn');
            adminPanelSection.style.display = 'none';
            if (adminLoginBtn) adminLoginBtn.textContent = 'لوحة التحكم ⚙️';
            alert("تم تسجيل الخروج وقفل لوحة التحكم بنجاح.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 3. دالة عرض كروت المشاريع
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
                    <strong>⚠️ التحديات والحلول المعمارية:</strong>
                    <p>${project.challenges || 'لا توجد تحديات مسجلة.'}</p>
                </div>
                <div class="project-text-block">
                    <strong>🏆 المخرج النهائي للمشروع:</strong>
                    <p>${project.result || 'لا يوجد مخرج مسجل.'}</p>
                </div>
                <div class="project-gallery" id="gallery-${project.id}"></div>
            `;

            postsFeedContainer.appendChild(card);

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

            // تأمين إضافي: التحقق من الدخول قبل النشر
            if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
                alert("خطأ: يجب تسجيل الدخول أولاً لنشر المشاريع!");
                return;
            }

            const title = document.getElementById('postTitle').value;
            const location = document.getElementById('postLocation').value;
            const area = document.getElementById('postArea').value;
            const components = document.getElementById('postComponents').value;
            const concept = document.getElementById('postConcept').value;
            const challenges = document.getElementById('postChallenges').value;
            const result = document.getElementById('postResult').value;
            const fileInput = document.getElementById('postFiles');

            const images = [];

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

            projectsList.unshift(newProject);
            localStorage.setItem('architect_projects', JSON.stringify(projectsList));
            
            adminPublishForm.reset();
            
            renderProjects();
            window.scrollTo({ top: postsFeedContainer.offsetTop - 100, behavior: 'smooth' });
        });
    }

    renderProjects();
});
