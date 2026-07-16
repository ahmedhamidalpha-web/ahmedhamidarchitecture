/*==================================================
    AHMED HAMID ARCHITECTURE
    MAIN JAVASCRIPT - Optimized & Secured
==================================================*/

/*==================================================
    SUPABASE CONFIGURATION
==================================================*/
const SUPABASE_URL = "https://fzlpqsvcicuvldaxgvcz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bHBxc3ZjaWN1dmxkYXhndmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3OTM1NjksImV4cCI6MjA5OTM2OTU2OX0.4YTOUuAv9RP5yGz_OF0Sh6ocZLMJa86HrVgAor97Lq8";

let supabaseClient;
if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

/*==================================================
    SUPABASE REQUEST FUNCTION
==================================================*/
async function supabaseRequest(table, method = "GET", body = null, query = "") {
    try {
        let options = {
            method: method,
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json"
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        let response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Supabase Error:", error);
        return null;
    }
}

/*==================================================
    GOOGLE DRIVE IMAGE CONVERTER & UPLOAD
==================================================*/
function convertDriveImage(image) {
    if (!image) return "assets/logo.png";
    if (image.includes("googleusercontent.com") || image.startsWith("data:image")) {
        return image;
    }
    // تصحيح الرابط الاسترجاعي لملفات قوقل درايف المباشرة
    return `https://lh3.googleusercontent.com/d/${image}`;
}

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwFd_q0GcRNc4qEI1NBlHAJxE_cLlmNzdTRXKJkO1wiPt6TUj05aSUWL76uM1YeD3hJ/exec";

async function uploadImageToDrive(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = async function() {
            let base64 = reader.result.split(",")[1];
            try {
                let response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: "POST",
                    body: JSON.stringify({
                        file: base64,
                        name: file.name,
                        type: file.type
                    })
                });
                let result = await response.json();
                if (result.status === "success") {
                    resolve(result.link);
                } else {
                    reject(result.message);
                }
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsDataURL(file);
    });
}

/*==================================================
    LOAD PROJECTS & DETAILS
==================================================*/
async function loadProjects() {
    const container = document.getElementById("projects-container");
    if (!container) return;

    container.innerHTML = `<div class="loading">Loading Projects...</div>`;

    let projects = await supabaseRequest("projects", "GET", null, "?select=*&order=created_at.desc");

    if (!projects || projects.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--gray);">No projects available yet.</p>`;
        return;
    }

    container.innerHTML = "";
    projects.forEach((project) => {
        let image = "assets/logo.png";
        if (project.device_image_ids && project.device_image_ids.length > 0) {
            image = convertDriveImage(project.device_image_ids[0]);
        }

        container.innerHTML += `
            <article class="project-card">
                <div class="project-image">
                    <img src="${image}" alt="${project.title}">
                </div>
                <div class="project-content">
                    <span class="project-category">Architecture</span>
                    <h3>${project.title}</h3>
                    <p>${project.design_concept ? project.design_concept.substring(0, 100) + '...' : ""}</p>
                    <button class="btn btn-primary open-project" data-id="${project.id}">View Project</button>
                </div>
            </article>
        `;
    });

    document.querySelectorAll(".open-project").forEach((button) => {
        button.onclick = () => {
            openProject(button.dataset.id);
        };
    });
}

let activeProjectIdForComments = null; // تخزين الـ ID محلياً للتعليقات النشطة

async function openProject(id) {
    let modal = document.getElementById("project-modal");
    if (!modal) return;

    let data = await supabaseRequest("projects", "GET", null, `?id=eq.${id}`);
    if (!data || !data.length) return;

    let project = data[0];
    activeProjectIdForComments = project.id; // تعيين الـ ID للتعليق الفوري

    document.getElementById("modal-title").innerHTML = project.title;
    document.getElementById("modal-info").innerHTML = `
        <div class="project-details">
            <p><strong>Location:</strong> ${project.location || "-"}</p>
            <p><strong>Plot Area:</strong> ${project.plot_area || "-"}</p>
            <p><strong>Components:</strong> ${project.components || "-"}</p>
            <p><strong>Design Concept:</strong> ${project.design_concept || "-"}</p>
            <p><strong>Challenges:</strong> ${project.challenges || "-"}</p>
            <p><strong>Result:</strong> ${project.result || "-"}</p>
        </div>
    `;

    let gallery = document.getElementById("modal-gallery");
    gallery.innerHTML = "";

    if (project.device_image_ids && project.device_image_ids.length) {
        project.device_image_ids.forEach((image) => {
            gallery.innerHTML += `<img src="${convertDriveImage(image)}" alt="${project.title}">`;
        });
    }

    modal.classList.add("active", "open");
    loadComments(project.id);
}

// إغلاق النافذة المنبثقة
document.addEventListener("click", function(e) {
    if (e.target.id === "close-modal" || e.target.closest("#close-modal")) {
        let modal = document.getElementById("project-modal");
        if (modal) modal.classList.remove("active", "open");
        activeProjectIdForComments = null;
    }
});

/*==================================================
    COMMENTS SYSTEM
==================================================*/
async function loadComments(projectId) {
    let container = document.getElementById("comments-container");
    if (!container) return;

    let comments = await supabaseRequest("comments", "GET", null, `?project=eq.${projectId}&order=created_at.desc`);
    container.innerHTML = "";

    if (!comments || comments.length === 0) {
        container.innerHTML = `<p class="no-comments">No comments yet.</p>`;
        return;
    }

    comments.forEach((comment) => {
        container.innerHTML += `
            <div class="comment-card">
                <div class="comment-header">
                    <strong>${comment.username || "Visitor"}</strong>
                    <span>${new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <p>${comment.comment}</p>
            </div>
        `;
    });
}

function initComments() {
    let form = document.getElementById("comment-form");
    if (!form) return;

    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        let text = document.getElementById("comment-text");
        if (!text || text.value.trim() === "") return;

        // التحقق من وجود المعرف المباشر أو استخراجه من الروابط
        let projectId = activeProjectIdForComments || new URLSearchParams(window.location.search).get("id");
        if (!projectId) {
            alert("Error: Project reference not found!");
            return;
        }

        let username = localStorage.getItem("visitor_name");
        if (!username) {
            username = "Guest_" + Math.floor(Math.random() * 9000 + 1000);
            localStorage.setItem("visitor_name", username);
        }

        let response = await supabaseRequest("comments", "POST", {
            project: projectId,
            username: username,
            comment: text.value.trim()
        });

        text.value = "";
        loadComments(projectId);
    });
}

/*==================================================
    ADMIN AREA - ADD, EDIT & DELETE PROJECTS
==================================================*/
async function initAddProject() {
    let form = document.getElementById("project-form");
    if (!form) return;

    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        let submitBtn = form.querySelector("button[type='submit']");
        submitBtn.disabled = true;
        submitBtn.innerText = "Publishing Project...";

        let files = document.getElementById("project-images").files;
        let imageLinks = [];

        for (let i = 0; i < files.length; i++) {
            try {
                let link = await uploadImageToDrive(files[i]);
                imageLinks.push(link);
            } catch (error) {
                console.error("Image upload error:", error);
                alert("Failed uploading image: " + files[i].name);
                submitBtn.disabled = false;
                submitBtn.innerText = "Publish Post";
                return;
            }
        }

        let project = {
            title: document.getElementById("project-title").value.trim(),
            location: document.getElementById("project-location").value.trim(),
            plot_area: document.getElementById("project-area").value.trim(),
            components: document.getElementById("project-components").value.trim(),
            design_concept: document.getElementById("project-description").value.trim(),
            challenges: document.getElementById("project-challenges").value.trim(),
            result: document.getElementById("project-result").value.trim(),
            device_image_ids: imageLinks
        };

        let response = await supabaseRequest("projects", "POST", project);
        submitBtn.disabled = false;
        submitBtn.innerText = "Publish Post";

        if (response) {
            alert("Project Added Successfully");
            form.reset();
        } else {
            alert("Error Adding Project");
        }
    });
}

async function loadAdminProjects() {
    let table = document.getElementById("admin-projects");
    if (!table) return;

    let projects = await supabaseRequest("projects", "GET", null, "?select=*&order=id.desc");
    table.innerHTML = "";

    if (!projects) return;

    projects.forEach((project) => {
        table.innerHTML += `
            <tr>
                <td>${project.id}</td>
                <td>${project.title}</td>
                <td>${project.location || "-"}</td>
                <td>
                    <button class="edit-project" onclick="window.location.href='edit-project.html?id=${project.id}'">Edit</button>
                    <button class="delete-project" data-id="${project.id}">Delete</button>
                </td>
            </tr>
        `;
    });

    // ربط الحذف الفوري بالأزرار
    document.querySelectorAll(".delete-project").forEach(btn => {
        btn.onclick = async () => {
            let id = btn.dataset.id;
            if (confirm("Are you sure you want to delete this project permanently?")) {
                await supabaseRequest("projects", "DELETE", null, `?id=eq.${id}`);
                loadAdminProjects();
            }
        };
    });
}

async function initEditProject() {
    let form = document.getElementById("edit-project-form");
    if (!form) return;

    let id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;

    let data = await supabaseRequest("projects", "GET", null, `?id=eq.${id}`);
    if (!data || !data.length) return;

    let project = data[0];

    document.getElementById("edit-title").value = project.title || "";
    document.getElementById("edit-location").value = project.location || "";
    document.getElementById("edit-area").value = project.plot_area || "";
    document.getElementById("edit-components").value = project.components || "";
    document.getElementById("edit-description").value = project.design_concept || "";
    document.getElementById("edit-challenges").value = project.challenges || "";
    document.getElementById("edit-result").value = project.result || "";

    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        let update = {
            title: document.getElementById("edit-title").value.trim(),
            location: document.getElementById("edit-location").value.trim(),
            plot_area: document.getElementById("edit-area").value.trim(),
            components: document.getElementById("edit-components").value.trim(),
            design_concept: document.getElementById("edit-description").value.trim(),
            challenges: document.getElementById("edit-challenges").value.trim(),
            result: document.getElementById("edit-result").value.trim()
        };

        await supabaseRequest("projects", "PATCH", update, `?id=eq.${id}`);
        alert("Project Updated Successfully!");
        window.location.href = "dashboard.html";
    });
}

/*==================================================
    ADMIN AUTH & STATS
==================================================*/
function checkAdmin() {
    let page = window.location.pathname;
    if (page.includes("/admin/") && !page.includes("login.html")) {
        let admin = localStorage.getItem("admin");
        if (admin !== "true") {
            window.location.href = "login.html";
        }
    }
}

function logout() {
    localStorage.removeItem("admin");
    window.location.href = "login.html";
}

async function dashboardStats() {
    let pCount = document.getElementById("projects-number");
    let cCount = document.getElementById("comments-number");

    if (pCount) {
        let projects = await supabaseRequest("projects", "GET", null, "?select=id");
        pCount.innerHTML = projects ? projects.length : 0;
    }
    if (cCount) {
        let comments = await supabaseRequest("comments", "GET", null, "?select=id");
        cCount.innerHTML = comments ? comments.length : 0;
    }
}

/*==================================================
    BLOG & CLIENT FEATURES
==================================================*/
async function loadBlogPosts() {
    let container = document.getElementById("blog-container");
    if (!container) return;

    let posts = await supabaseRequest("blog_posts", "GET", null, "?select=*&order=created_at.desc");

    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="blog-card" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <h3>Welcome To Ahmed Hamid Architecture</h3>
                <p>News, articles and announcements will appear here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = "";
    posts.forEach((post) => {
        container.innerHTML += `
            <article class="blog-card">
                <div class="blog-image">
                    <img src="${post.image || "assets/logo.png"}" alt="${post.title}">
                </div>
                <div class="blog-content">
                    <h3>${post.title}</h3>
                    <p>${post.content}</p>
                    <small>Published on: ${new Date(post.created_at).toLocaleDateString()}</small>
                </div>
            </article>
        `;
    });
}

function initBackToTop() {
    let btn = document.getElementById("backToTop");
    if (!btn) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
            btn.classList.add("show");
            btn.style.display = "block";
        } else {
            btn.classList.remove("show");
            btn.style.display = "none";
        }
    });

    btn.onclick = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
}

function initMobileMenu() {
    let toggle = document.querySelector(".menu-toggle");
    let nav = document.querySelector(".nav-menu");
    if (toggle && nav) {
        toggle.onclick = () => {
            nav.classList.toggle("active");
        };
    }
}

function lazyImages() {
    document.querySelectorAll("img").forEach((img) => {
        img.loading = "lazy";
    });
}

/*==================================================
    INITIALIZATION BOOTSTRAP
==================================================*/
document.addEventListener("DOMContentLoaded", () => {
    // تشغيل دوال العرض والواجهات العامة
    loadProjects();
    initComments();
    loadBlogPosts();
    initBackToTop();
    initMobileMenu();
    lazyImages();

    // تشغيل دوال الأدمن والإحصائيات
    checkAdmin();
    initAddProject();
    initEditProject();
    loadAdminProjects();
    dashboardStats();
});
