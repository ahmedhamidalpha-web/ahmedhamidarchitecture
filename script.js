/*==================================================
    AHMED HAMID ARCHITECTURE
    MAIN JAVASCRIPT
==================================================*/



/*==================================================
    SUPABASE CONFIGURATION
==================================================*/


const SUPABASE_URL =
"https://fzlpqsvcicuvldaxgvcz.supabase.co";



const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bHBxc3ZjaWN1dmxkYXhndmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3OTM1NjksImV4cCI6MjA5OTM2OTU2OX0.4YTOUuAv9RP5yGz_OF0Sh6ocZLMJa86HrVgAor97Lq8";





/*
يجب تحميل مكتبة supabase-js
في صفحات الموقع قبل script.js

*/




let supabaseClient;



if(window.supabase){


supabaseClient =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);



}









/*==================================================
    SUPABASE REQUEST FUNCTION
==================================================*/


async function supabaseRequest(
table,
method="GET",
body=null,
query=""
){



try{



let options={


method:method,


headers:{


"apikey":
SUPABASE_KEY,


"Authorization":
`Bearer ${SUPABASE_KEY}`,



"Content-Type":
"application/json"



}



};







if(body){


options.body =
JSON.stringify(body);


}







let response =
await fetch(
`${SUPABASE_URL}/rest/v1/${table}${query}`,
options
);







let data =
await response.json();





return data;





}catch(error){



console.error(
"Supabase Error:",
error
);



return null;



}




}











/*==================================================
    GOOGLE DRIVE IMAGE CONVERTER
==================================================*/


function convertDriveImage(
image
){



if(!image)
return "assets/logo.png";





/*
إذا كان الرابط جاهز
*/


if(
image.includes(
"googleusercontent.com"
)
){


return image;


}







/*
إذا كان معرف ملف Google Drive
*/


return `https://lh3.googleusercontent.com/d/${image}`;



}









/*==================================================
    GOOGLE DRIVE UPLOAD
==================================================*/


const GOOGLE_SCRIPT_URL =

"https://script.google.com/macros/s/AKfycbwFd_q0GcRNc4qEI1NBlHAJxE_cLlmNzdTRXKJkO1wiPt6TUj05aSUWL76uM1YeD3hJ/exec";








async function uploadImageToDrive(
file
){



return new Promise(
(resolve,reject)=>{



let reader =
new FileReader();





reader.onload =
async function(){





let base64 =
reader.result.split(",")[1];






try{



let response =
await fetch(
GOOGLE_SCRIPT_URL,
{


method:"POST",


body:
JSON.stringify({

file:base64,

name:file.name,

type:file.type


})


}
);






let result =
await response.json();






if(result.status==="success"){


resolve(
result.link
);



}else{


reject(
result.message
);


}



}catch(error){


reject(error);


}




};





reader.readAsDataURL(
file
);




});



}









async function uploadImages(
files
){



let images=[];





for(
let i=0;
i<files.length;
i++
){



let url =
await uploadImageToDrive(
files[i]
);



images.push(
url
);



}






return images;



}
/*==================================================
    LOAD PROJECTS
==================================================*/


async function loadProjects(){


const container =
document.getElementById(
"projects-container"
);



if(!container)
return;





container.innerHTML = `

<div class="loading">

Loading Projects...

</div>

`;







let projects =
await supabaseRequest(
"projects",
"GET",
null,
"?select=*&order=created_at.desc"
);






if(
!projects ||
projects.length===0
){



container.innerHTML = `

<p>
No projects available yet.
</p>

`;

return;


}







container.innerHTML="";







projects.forEach(
(project)=>{



let image =
"assets/logo.png";





if(
project.device_image_ids &&
project.device_image_ids.length>0
){



image =
convertDriveImage(
project.device_image_ids[0]
);



}








container.innerHTML += `


<article class="project-card">



<div class="project-image">


<img src="${image}"
alt="${project.title}">


</div>





<div class="project-content">



<span class="project-category">

Architecture

</span>





<h3>

${project.title}

</h3>





<p>

${project.design_concept || ""}

</p>






<button
class="btn btn-primary open-project"
data-id="${project.id}">


View Project


</button>




</div>




</article>



`;



});








document
.querySelectorAll(
".open-project"
)
.forEach(
(button)=>{



button.onclick =
()=>{


openProject(
button.dataset.id
);



};



});



}









/*==================================================
    OPEN PROJECT DETAILS
==================================================*/


async function openProject(
id
){



let modal =
document.getElementById(
"project-modal"
);





if(!modal)
return;






let data =
await supabaseRequest(
"projects",
"GET",
null,
`?id=eq.${id}`
);






if(
!data ||
!data.length
)
return;





let project =
data[0];






document.getElementById(
"modal-title"
).innerHTML =
project.title;









document.getElementById(
"modal-info"
).innerHTML = `


<div class="project-details">


<p>

<strong>
Location:
</strong>

${project.location || "-"}

</p>



<p>

<strong>
Plot Area:
</strong>

${project.plot_area || "-"}

</p>




<p>

<strong>
Components:
</strong>

${project.components || "-"}

</p>




<p>

<strong>
Design Concept:
</strong>

${project.design_concept || "-"}

</p>




<p>

<strong>
Challenges:
</strong>

${project.challenges || "-"}

</p>




<p>

<strong>
Result:
</strong>

${project.result || "-"}

</p>



</div>


`;









let gallery =
document.getElementById(
"modal-gallery"
);







gallery.innerHTML="";








if(
project.device_image_ids
&&
project.device_image_ids.length
){



project.device_image_ids.forEach(
(image)=>{



gallery.innerHTML += `


<img src="${convertDriveImage(image)}"
alt="${project.title}">



`;



});



}








modal.classList.add(
"active"
);








loadComments(
project.id
);



}









/*==================================================
    CLOSE PROJECT MODAL
==================================================*/


document.addEventListener(
"click",
function(e){



if(
e.target.id === "close-modal"
||
e.target.closest(
"#close-modal"
)
){



let modal =
document.getElementById(
"project-modal"
);



if(modal)
modal.classList.remove(
"active"
);



}



});
/*==================================================
    COMMENTS SYSTEM
==================================================*/


async function loadComments(
projectId
){



let container =
document.getElementById(
"comments-container"
);



if(!container)
return;







let comments =
await supabaseRequest(
"comments",
"GET",
null,
`?project=eq.${projectId}&order=created_at.desc`
);






container.innerHTML="";







if(
!comments ||
comments.length===0
){



container.innerHTML = `

<p class="no-comments">

No comments yet.

</p>

`;

return;


}








comments.forEach(
(comment)=>{



container.innerHTML += `


<div class="comment-card">


<div class="comment-header">


<strong>

${comment.username || "Visitor"}

</strong>


<span>

${new Date(
comment.created_at
)
.toLocaleDateString()
}

</span>


</div>



<p>

${comment.comment}

</p>



</div>



`;



});





}









/*==================================================
    ADD COMMENT
==================================================*/


function initComments(){



let form =
document.getElementById(
"comment-form"
);





if(!form)
return;






form.addEventListener(
"submit",
async function(e){



e.preventDefault();






let text =
document.getElementById(
"comment-text"
);







if(
!text ||
text.value.trim()===""
)
return;









let projectId =
new URLSearchParams(
window.location.search
)
.get("id");







/*
اسم المستخدم:
حالياً يتم توليده تلقائياً
بدون طلب إدخال من الزائر

لاحقاً يمكن ربطه
بـ Supabase Auth
*/


let username =
localStorage.getItem(
"visitor_name"
);







if(!username){



username =
"Guest_" +
Math.floor(
Math.random()*9000+1000
);



localStorage.setItem(
"visitor_name",
username
);



}








await supabaseRequest(
"comments",
"POST",
{


project:
projectId,


username:
username,


comment:
text.value.trim()



}

);







text.value="";








loadComments(
projectId
);




});



}









/*==================================================
    INITIALIZE PAGE FUNCTIONS
==================================================*/


document.addEventListener(
"DOMContentLoaded",
()=>{


loadProjects();


initComments();



});
/*==================================================
    ADMIN - ADD PROJECT
==================================================*/


async function initAddProject(){



let form =
document.getElementById(
"project-form"
);



if(!form)
return;






form.addEventListener(
"submit",
async function(e){



e.preventDefault();







let title =
document.getElementById(
"project-title"
).value;



let location =
document.getElementById(
"project-location"
).value;



let area =
document.getElementById(
"project-area"
).value;



let components =
document.getElementById(
"project-components"
).value;



let concept =
document.getElementById(
"project-description"
).value;



let challenges =
document.getElementById(
"project-challenges"
).value;



let result =
document.getElementById(
"project-result"
).value;








let files =
document.getElementById(
"project-images"
).files;







let imageLinks =
[];







for(
let i=0;
i<files.length;
i++
){



let link =
await uploadImageToDrive(
files[i]
);



imageLinks.push(
link
);



}








let project = {


title:title,


location:location,


plot_area:area,


components:components,


design_concept:concept,


challenges:challenges,


result:result,


device_image_ids:imageLinks



};








let response =
await supabaseRequest(
"projects",
"POST",
project
);









if(response){



alert(
"Project Added Successfully"
);



form.reset();



}else{



alert(
"Error Adding Project"
);



}




});



}









/*==================================================
    ADMIN - LOAD PROJECTS TABLE
==================================================*/


async function loadAdminProjects(){



let table =
document.getElementById(
"admin-projects"
);



if(!table)
return;






let projects =
await supabaseRequest(
"projects",
"GET",
null,
"?select=*&order=id.desc"
);






table.innerHTML="";








projects.forEach(
(project)=>{



table.innerHTML += `



<tr>


<td>

${project.id}

</td>


<td>

${project.title}

</td>


<td>

${project.location || "-"}

</td>



<td>



<button
class="edit-project"
data-id="${project.id}">


Edit


</button>





<button
class="delete-project"
data-id="${project.id}">


Delete


</button>




</td>



</tr>


`;



});








}



(async()=>{


document.addEventListener(
"click",
async function(e){





if(
e.target.classList.contains(
"delete-project"
)
){



let id =
e.target.dataset.id;






if(
confirm(
"Delete Project?"
)
){



await supabaseRequest(
"projects",
"DELETE",
null,
`?id=eq.${id}`
);




loadAdminProjects();



}




}






});



})();
/*==================================================
    ADMIN - EDIT PROJECT
==================================================*/


async function initEditProject(){



let form =
document.getElementById(
"edit-project-form"
);



if(!form)
return;







let id =
new URLSearchParams(
window.location.search
)
.get("id");





if(!id)
return;








let data =
await supabaseRequest(
"projects",
"GET",
null,
`?id=eq.${id}`
);






if(
!data ||
!data.length
)
return;






let project =
data[0];







document.getElementById(
"edit-title"
).value =
project.title || "";




document.getElementById(
"edit-location"
).value =
project.location || "";




document.getElementById(
"edit-area"
).value =
project.plot_area || "";




document.getElementById(
"edit-components"
).value =
project.components || "";




document.getElementById(
"edit-description"
).value =
project.design_concept || "";




document.getElementById(
"edit-challenges"
).value =
project.challenges || "";




document.getElementById(
"edit-result"
).value =
project.result || "";







form.addEventListener(
"submit",
async function(e){



e.preventDefault();







let update = {



title:
document.getElementById(
"edit-title"
).value,



location:
document.getElementById(
"edit-location"
).value,



plot_area:
document.getElementById(
"edit-area"
).value,



components:
document.getElementById(
"edit-components"
).value,



design_concept:
document.getElementById(
"edit-description"
).value,



challenges:
document.getElementById(
"edit-challenges"
).value,



result:
document.getElementById(
"edit-result"
).value



};









await supabaseRequest(
"projects",
"PATCH",
update,
`?id=eq.${id}`
);







alert(
"Project Updated"
);







window.location.href =
"dashboard.html";





});



}









/*==================================================
    ADMIN AUTH CHECK
==================================================*/


function checkAdmin(){



let page =
window.location.pathname;






if(
page.includes(
"/admin/"
)
&&
!page.includes(
"login.html"
)
){





let admin =
localStorage.getItem(
"admin"
);






if(
admin !== "true"
){



window.location.href =
"login.html";



}





}



}









/*==================================================
    ADMIN LOGOUT
==================================================*/


function logout(){



localStorage.removeItem(
"admin"
);



window.location.href =
"login.html";



}









/*==================================================
    DASHBOARD STATISTICS
==================================================*/


async function dashboardStats(){



let projects =
await supabaseRequest(
"projects",
"GET",
null,
"?select=id"
);






let comments =
await supabaseRequest(
"comments",
"GET",
null,
"?select=id"
);







let p =
document.getElementById(
"projects-number"
);



let c =
document.getElementById(
"comments-number"
);







if(p)
p.innerHTML =
projects.length;






if(c)
c.innerHTML =
comments.length;






}









/*==================================================
    INITIALIZE ADMIN
==================================================*/


document.addEventListener(
"DOMContentLoaded",
()=>{



checkAdmin();


initAddProject();


initEditProject();


loadAdminProjects();


dashboardStats();



});
/*==================================================
    BLOG SYSTEM
==================================================*/


async function loadBlogPosts(){



let container =
document.getElementById(
"blog-container"
);



if(!container)
return;





/*
ملاحظة:
جدول blog_posts يجب إنشاؤه في Supabase
لأنك قلت إنه غير موجود حالياً
*/


let posts =
await supabaseRequest(
"blog_posts",
"GET",
null,
"?select=*&order=created_at.desc"
);







if(
!posts ||
posts.length===0
){


container.innerHTML = `

<div class="blog-card">


<h3>
Welcome To Ahmed Hamid Architecture
</h3>


<p>
News, articles and announcements will appear here.
</p>



</div>


`;


return;


}








container.innerHTML="";








posts.forEach(
(post)=>{



container.innerHTML += `



<article class="blog-card">


<div class="blog-image">


<img src="${post.image || "assets/logo.png"}"
alt="${post.title}">


</div>





<div class="blog-content">


<h3>

${post.title}

</h3>



<p>

${post.content}

</p>



<small>

${new Date(
post.created_at
)
.toLocaleDateString()}

</small>



</div>



</article>



`;



});



}









/*==================================================
    BACK TO TOP
==================================================*/


function initBackToTop(){



let btn =
document.getElementById(
"backToTop"
);





if(!btn)
return;







window.addEventListener(
"scroll",
()=>{



if(
window.scrollY > 400
){


btn.classList.add(
"show"
);



}else{


btn.classList.remove(
"show"
);



}



});









btn.onclick =
()=>{


window.scrollTo({

top:0,

behavior:"smooth"

});


};




}









/*==================================================
    MOBILE MENU
==================================================*/


function initMobileMenu(){



let toggle =
document.querySelector(
".menu-toggle"
);



let nav =
document.querySelector(
".nav-menu"
);







if(
toggle &&
nav
){



toggle.onclick =
()=>{


nav.classList.toggle(
"active"
);



};



}



}









/*==================================================
    PROJECT IMAGE LAZY LOAD
==================================================*/


function lazyImages(){



let images =
document.querySelectorAll(
"img"
);







images.forEach(
(img)=>{



img.loading =
"lazy";



});



}









/*==================================================
    START WEBSITE
==================================================*/


document.addEventListener(
"DOMContentLoaded",
()=>{



loadBlogPosts();


initBackToTop();


initMobileMenu();


lazyImages();



});