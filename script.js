// Google Analytics Integration
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-S8XNQKS8F3');

// Supabase Configuration
const SUPABASE_URL = "https://fzlpqsvcicuvldaxgvcz.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bHBxc3ZjaWN1dmxkYXhndmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3OTM1NjksImV4cCI6MjA5OTM2OTU2OX0.4YTOUuAv9RP5yGz_OF0Sh6ocZLMJa86HrVgAor97Lq8";

// Google Drive Apps Script Proxy
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwFd_q0GcRNc4qEI1NBlHAJxE_cLlmNzdTRXKJkO1wiPt6TUj05aSUWL76uM1YeD3hJ/exec";

// Admin Authentication Handler
function handleAdminLogin(event) {
  event.preventDefault();
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;
  const savedPassword = localStorage.getItem('admin_pwd') || '123456';

  if (email === 'ahmedhamidarchitecture@gmail.com' && password === savedPassword) {
    sessionStorage.setItem('isAdminAuthenticated', 'true');
    showDashboard();
  } else {
    document.getElementById('login-error').style.display = 'block';
  }
}

function handleForgotPassword() {
  const email = prompt("أدخل بريدك الإلكتروني لاستلام رمز التأكيد:");
  if (email === 'ahmedhamidarchitecture@gmail.com') {
    const generatedCode = Math.floor(100000 + Math.random() * 900000);
    alert(`تم إرسال رمز التأكيد إلى بريدك الإلكتروني: ${generatedCode}`);
    
    const userCode = prompt("أدخل رمز التأكيد الخاص بك:");
    if (userCode == generatedCode) {
      const newPwd = prompt("أدخل كلمة السر الجديدة:");
      if (newPwd) {
        localStorage.setItem('admin_pwd', newPwd);
        alert("تم تغيير كلمة السر بنجاح! يمكنك الآن تسجيل الدخول.");
      }
    } else {
      alert("رمز التأكيد غير صحيح.");
    }
  } else {
    alert("البريد الإلكتروني غير مسجل لدينا.");
  }
}

// Upload Image File to Google Drive Apps Script Pipeline
async function uploadImageToDrive(fileInput) {
  const file = fileInput.files[0];
  if (!file) return null;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function (e) {
      const base64Data = e.target.result.split(',')[1];
      const payload = {
        filename: file.name,
        mimeType: file.type,
        base64: base64Data
      };

      try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        resolve(result.url || result.fileUrl);
      } catch (err) {
        console.error("Error uploading file:", err);
        reject(err);
      }
    };
    reader.readAsDataURL(file);
  });
}

// Fetch helper for Supabase REST endpoint
async function supabaseFetch(endpoint, method = 'GET', body = null) {
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${SUPABASE_URL}${endpoint}`, options);
  return res.json();
}
