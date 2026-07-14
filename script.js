const SUPABASE_URL = "https://fzlpqsvcicuvldaxgvcz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bHBxc3ZjaWN1dmxkYXhndmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3OTM1NjksImV4cCI6MjA5OTM2OTU2OX0.4YTOUuAv9RP5yGz_OF0Sh6ocZLMJa86HrVgAor97Lq8";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwFd_q0GcRNc4qEI1NBlHAJxE_cLlmNzdTRXKJkO1wiPt6TUj05aSUWL76uM1YeD3hJ/exec";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    // عرض المشاريع
    const latest = document.getElementById('latest-projects');
    if(latest){
        supabase.from('projects').select('*').order('created_at',{ascending:false}).limit(3).then(({data})=>{
            latest.innerHTML = data?.map(p=>`
                <div class="card">
                    <img src="${p.images[0]}" style="width:100%;height:220px;object-fit:cover;border-radius:8px;margin-bottom:15px">
                    <h3>${p.title}</h3><p style="color:var(--gray)">${p.location}</p>
                </div>`).join('') || "<p>لا توجد مشاريع</p>";
        });
    }

    // فورم التواصل يرسل ايميل + يحفظ
    const form = document.getElementById('clientRequestForm');
    if(form){
        form.addEventListener('submit', async (e)=>{
            e.preventDefault();
            document.getElementById('submitBtn').innerText = "جاري الارسال...";
            const data = {
                name:clientName.value,email:clientEmail.value,phone:clientPhone.value,details:clientDetails.value,
                to:"ahmedhamidarchitecture@gmail.com"
            };
            await supabase.from('client_requests').insert([data]);
            await fetch(APPS_SCRIPT_URL,{method:'POST',body:JSON.stringify(data)});
            document.getElementById('formStatus').innerText = "تم الارسال بنجاح";
            document.getElementById('formStatus').style.color = "var(--gold)";
            form.reset();
            document.getElementById('submitBtn').innerText = "ارسال";
        });
    }
});