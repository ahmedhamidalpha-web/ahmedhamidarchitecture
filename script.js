/* ==========================================================================
   Ahmed Hamid Architecture - Core Application Engine
   Integrations: Supabase REST API, Apps Script, Google Analytics
   ========================================================================== */

const CONFIG = {
  SUPABASE_URL: "https://fzlpqsvcicuvldaxgvcz.supabase.co/rest/v1/",
  SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bHBxc3ZjaWN1dmxkYXhndmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3OTM1NjksImV4cCI6MjA5OTM2OTU2OX0.4YTOUuAv9RP5yGz_OF0Sh6ocZLMJa86HrVgAor97Lq8",
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwFd_q0GcRNc4qEI1NBlHAJxE_cLlmNzdTRXKJkO1wiPt6TUj05aSUWL76uM1YeD3hJ/exec",
  FORMSPREE_URL: "https://formspree.io/f/mzdnpevq"
};

// Generic REST API Helper for Supabase
async function supabaseFetch(endpoint, method = 'GET', body = null) {
  const options = {
    method: method,
    headers: {
      'apikey': CONFIG.SUPABASE_KEY,
      'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal'
    }
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${CONFIG.SUPABASE_URL}${endpoint}`, options);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    if (method === 'DELETE' || response.status === 24) return true;
    return await response.json();
  } catch (error) {
    console.error("Supabase API Error:", error);
    return null;
  }
}

// Convert Base64 File to Google Apps Script Engine
async function uploadToGoogleDrive(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result.split(',')[1];
      const payload = {
        fileName: `${Date.now()}_${file.name}`,
        mimeType: file.type,
        fileData: base64Data
      };
      try {
        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        resolve(result.fileUrl || result.url);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// Admin Authentication Engine
const AUTH_ADMIN_EMAIL = "ahmedhamidarchitecture@gmail.com";

function checkAdminAuth() {
  const session = localStorage.getItem('aha_admin_session');
  return session === 'authenticated';
}

function loginAdmin(email, password) {
  const storedPassword = localStorage.getItem('aha_admin_pwd') || "123456";
  if (email === AUTH_ADMIN_EMAIL && password === storedPassword) {
    localStorage.setItem('aha_admin_session', 'authenticated');
    return { success: true };
  }
  return { success: false, message: "بيانات الدخول غير صحيحة، حاول مجدداً." };
}

function logoutAdmin() {
  localStorage.removeItem('aha_admin_session');
  window.location.href = 'admin.html';
}

function initiatePasswordReset(email) {
  if (email === AUTH_ADMIN_EMAIL) {
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('aha_reset_code', generatedCode);
    alert(`[محاكاة خادم البريد]: تم إرسال رمز التحقق إلى إيميلك: ${generatedCode}`);
    return true;
  }
  return false;
}

function finalizePasswordReset(code, newPassword) {
  const validCode = sessionStorage.getItem('aha_reset_code');
  if (code === validCode) {
    localStorage.setItem('aha_admin_pwd', newPassword);
    sessionStorage.removeItem('aha_reset_code');
    return true;
  }
  return false;
}

// Global UI Rendering Helpers
function generateGlobalFooter() {
  return `
    <footer>
      <div class="footer-content">
        <div class="footer-section">
          <h3>Contact</h3>
          <p>واتساب: <a href="https://wa.me/249924372845" target="_blank" style="color:var(--surface-white); font-family:var(--font-english);">+249924372845</a></p>
          <p>الإيميل: <a href="mailto:ahmedhamidarchitecture@gmail.com" style="color:var(--surface-white); font-family:var(--font-english);">ahmedhamidarchitecture@gmail.com</a></p>
        </div>
        <div class="footer-section">
          <h3>Social Platforms</h3>
          <div class="social-links">
            <a href="https://www.facebook.com/ahmedhamidarchitecture" target="_blank" class="social-icon" title="Facebook">
              <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.instagram.com/ahmed_hamid_architecture?igsh=MXd1ZDlyaHlpdzB5NA==" target="_blank" class="social-icon" title="Instagram">
              <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://vm.tiktok.com/ZS9MCb1KJoBdN-iZvTF/" target="_blank" class="social-icon" title="TikTok">
              <svg viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.34V9.28a8.16 8.16 0 0 0 4.91 1.62V7.46a4.85 4.85 0 0 1-1-.77z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/ahmed-hamid-architecture-9b9372260?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" class="social-icon" title="LinkedIn">
              <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
        </div>
      </div>
      <div class="copyright">
        &copy; 2026 Ahmed Hamid Architecture. جميع الحقوق محفوظة.
      </div>
    </footer>
  `;
}
