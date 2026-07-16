/*==================================================
    AHMED HAMID ARCHITECTURE
    MAIN SCRIPT
==================================================*/



/*==================================================
    CONFIGURATION
==================================================*/


const SUPABASE_URL =
"https://fzlpqsvcicuvldaxgvcz.supabase.co/rest/v1";


const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bHBx c3ZjaWN1dmxkYXhndmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3OTM1NjksImV4cCI6MjA5OTM2OTU2OX0.4YTOUuAv9RP5yGz_OF0Sh6ocZLMJa86HrVgAor97Lq8"
.replace(" ","");


const GOOGLE_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbwFd_q0GcRNc4qEI1NBlHAJxE_cLlmNzdTRXKJkO1wiPt6TUj05aSUWL76uM1YeD3hJ/exec";







/*==================================================
    SUPABASE REQUEST SYSTEM
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
"Bearer "+SUPABASE_KEY,


"Content-Type":
"application/json",


"Prefer":
"return=representation"


}


};




if(body){

options.body =
JSON.stringify(body);

}





let response =
await fetch(
`${SUPABASE_URL}/${table}${query}`,
options
);





if(!response.ok){

console.error(
await response.text()
);


return null;

}




let data =
await response.json();



return data;



}

catch(error){


console.error(error);


return null;


}



}









/*==================================================
    GOOGLE DRIVE IMAGE SYSTEM
==================================================*/


function convertDriveImage(
url
){


if(!url)
return "";




if(
url.includes(
"googleusercontent.com"
)
){

return url;

}





if(
url.includes(
"drive.google.com"
)
){


let id =
url.match(
/[-\w]{25,}/
);



if(id){

return 
"https://lh3.googleusercontent.com/d/"+id[0];

}



}



return url;



}









function createImage(
src,
alt=""
){


let img =
document.createElement(
"img"
);



img.src =
convertDriveImage(src);



img.alt =
alt;



img.loading =
"lazy";



return img;



}











/*==================================================
    GOOGLE DRIVE UPLOAD
==================================================*/


function fileToBase64(
file
){


return new Promise(
(resolve,reject)=>{


let reader =
new FileReader();



reader.onload =
()=>{


resolve(
reader.result.split(",")[1]
);


};



reader.onerror =
reject;



reader.readAsDataURL(file);



});

}









async function uploadImageToDrive(
file
){



let base64 =
await fileToBase64(file);




let response =
await fetch(
GOOGLE_SCRIPT_URL,
{

method:"POST",

body:JSON.stringify({

file:base64,

name:file.name,

type:file.type

})

}

);




let result =
await response.json();




if(
result.status==="success"
){


return result.link;


}



return null;


}









async function uploadImages(
files
){


let links=[];



for(
let file of files
){


let link =
await uploadImageToDrive(file);



if(link)
links.push(link);



}



return links;



}









/*==================================================
    MOBILE NAVIGATION
==================================================*/


document.addEventListener(
"DOMContentLoaded",
()=>{


let menu =
document.querySelector(
".menu-toggle"
);



let nav =
document.querySelector(
".nav-menu"
);




if(menu && nav){


menu.onclick =
()=>{


nav.classList.toggle(
"active"
);



};



}




});
/*==================================================
    ADMIN AUTH SYSTEM
==================================================*/


async function adminLogin(){


let email =
document.getElementById(
"admin-email"
);


let password =
document.getElementById(
"admin-password"
);



if(!email || !password)
return;



let message =
document.getElementById(
"login-message"
);



/*
ملاحظة:
Supabase Auth يحتاج مكتبة supabase-js
وسيتم تحميلها في login.html
*/


const { data, error } =
await window.supabaseClient.auth.signInWithPassword({

email:
email.value,

password:
password.value

});




if(error){


if(message)
message.innerHTML =
"Invalid email or password";


return;


}



localStorage.setItem(
"adminLogged",
"true"
);



window.location.href =
"dashboard.html";



}









document.addEventListener(
"DOMContentLoaded",
()=>{


let loginForm =
document.getElementById(
"login-form"
);



if(loginForm){


loginForm.addEventListener(
"submit",
(e)=>{


e.preventDefault();


adminLogin();



});


}




});









/*==================================================
    ADMIN PROTECTION
==================================================*/


function protectAdmin(){


let path =
window.location.pathname;



if(
path.includes("/admin/")
&&
!path.includes("login.html")
){



let logged =
localStorage.getItem(
"adminLogged"
);



if(logged !== "true"){


window.location.href =
"login.html";


}



}



}




protectAdmin();









/*==================================================
    LOGOUT
==================================================*/


document.addEventListener(
"click",
(e)=>{


if(
e.target.id==="logout-btn"
){


localStorage.removeItem(
"adminLogged"
);



window.location.href =
"login.html";



}



});









/*==================================================
    PROJECTS LOAD
==================================================*/


async function loadProjects(
container="projects-container"
){



let box =
document.getElementById(
container
);



if(!box)
return;




box.innerHTML =
`
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






if(!projects)
return;




box.innerHTML="";





projects.forEach(
(project)=>{



let image =
"assets/logo.png";



if(
project.device_image_ids
&&
project.device_image_ids.length
){


image =
convertDriveImage(
project.device_image_ids[0]
);


}





box.innerHTML += `


<article class="project-card"
data-category="${project.category || "all"}">


<div class="project-image">


<img src="${image}"
alt="${project.title}">


</div>




<div class="project-content">


<span class="project-category">

${project.category || "Architecture"}

</span>




<h3>

${project.title}

</h3>




<p>

${project.design_concept || ""}

</p>




<a href="projects.html?id=${project.id}">


View Project


<i class="fa-solid fa-arrow-right"></i>


</a>



</div>



</article>



`;



});



}









/*==================================================
    PROJECT DETAILS
==================================================*/


async function loadProjectDetails(){



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





if(!data || !data.length)
return;




let project =
data[0];





let title =
document.getElementById(
"project-title"
);



if(title)
title.innerHTML =
project.title;





let description =
document.getElementById(
"project-description"
);



if(description){


description.innerHTML = `


<p>
<strong>Location:</strong>
${project.location || ""}
</p>



<p>
<strong>Plot Area:</strong>
${project.plot_area || ""}
</p>



<p>
<strong>Components:</strong>
${project.components || ""}
</p>



<p>
<strong>Concept:</strong>
${project.design_concept || ""}
</p>



<p>
<strong>Challenges:</strong>
${project.challenges || ""}
</p>



<p>
<strong>Result:</strong>
${project.result || ""}
</p>



`;



}





let gallery =
document.getElementById(
"project-gallery"
);




if(
gallery &&
project.device_image_ids
){



gallery.innerHTML="";



project.device_image_ids.forEach(
(img)=>{


gallery.appendChild(
createImage(
img,
project.title
)
);



});



}



loadComments(id);



}








document.addEventListener(
"DOMContentLoaded",
()=>{


loadProjects();


loadProjectDetails();


});
/*==================================================
    ADD PROJECT SYSTEM
==================================================*/


async function addProject(){



let form =
document.getElementById(
"project-form"
);



if(!form)
return;





form.addEventListener(
"submit",
async(e)=>{


e.preventDefault();





let message =
document.getElementById(
"project-message"
);





if(message)
message.innerHTML =
"Uploading images...";







let files =
document.getElementById(
"project-images"
).files;





let images =
await uploadImages(
files
);







let project = {


title:
document.getElementById(
"project-title"
).value,



location:
document.getElementById(
"project-location"
).value,



plot_area:
document.getElementById(
"project-area"
).value,



components:
document.getElementById(
"project-components"
).value,



design_concept:
document.getElementById(
"project-description"
).value,



challenges:
document.getElementById(
"project-challenges"
).value,



result:
document.getElementById(
"project-result"
).value,



device_image_ids:
images



};








let result =
await supabaseRequest(
"projects",
"POST",
project
);







if(result){



message.innerHTML =
"Project published successfully";


form.reset();



}else{


message.innerHTML =
"Error uploading project";


}





});



}










/*==================================================
    DELETE PROJECT
==================================================*/


async function deleteProject(
id
){



let confirmDelete =
confirm(
"Delete this project?"
);





if(!confirmDelete)
return;





await supabaseRequest(
"projects",
"DELETE",
null,
`?id=eq.${id}`
);




location.reload();



}









/*==================================================
    EDIT PROJECT LOAD
==================================================*/


async function loadEditProject(){



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





if(!data || !data.length)
return;




let project =
data[0];






document.getElementById(
"edit-project-id"
).value =
project.id;




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






let gallery =
document.getElementById(
"current-images"
);




if(
gallery &&
project.device_image_ids
){


gallery.innerHTML="";



project.device_image_ids.forEach(
(img)=>{


gallery.innerHTML += `

<img src="${convertDriveImage(img)}">

`;



});


}




}












/*==================================================
    UPDATE PROJECT
==================================================*/


async function updateProject(){



let form =
document.getElementById(
"edit-project-form"
);



if(!form)
return;






form.addEventListener(
"submit",
async(e)=>{


e.preventDefault();






let id =
document.getElementById(
"edit-project-id"
).value;







let oldData =
await supabaseRequest(
"projects",
"GET",
null,
`?id=eq.${id}`
);





let images =
oldData[0].device_image_ids || [];









let newFiles =
document.getElementById(
"edit-images"
).files;







if(
newFiles.length
){


let newImages =
await uploadImages(
newFiles
);


images =
[
...images,
...newImages
];


}









let updated = {



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
).value,



device_image_ids:
images



};








await supabaseRequest(
"projects",
"PATCH",
updated,
`?id=eq.${id}`
);







alert(
"Project updated successfully"
);



window.location.href =
"dashboard.html";



});



}









document.addEventListener(
"DOMContentLoaded",
()=>{


addProject();


loadEditProject();


updateProject();



});
/*==================================================
    COMMENTS SYSTEM
==================================================*/


async function loadComments(
projectId
){


let box =
document.getElementById(
"comments-container"
);



if(!box)
return;





let comments =
await supabaseRequest(
"comments",
"GET",
null,
`?project=eq.${projectId}&order=created_at.desc`
);





box.innerHTML="";





if(!comments || !comments.length){


box.innerHTML =
"<p>No comments yet.</p>";


return;


}





comments.forEach(
(comment)=>{


box.innerHTML += `


<div class="comment-card">


<h4>

${comment.username || "Visitor"}

</h4>



<p>

${comment.comment}

</p>



<small>

${new Date(comment.created_at).toLocaleDateString()}

</small>



</div>



`;



});



}









async function addComment(
projectId
){



let form =
document.getElementById(
"comment-form"
);



if(!form)
return;






form.addEventListener(
"submit",
async(e)=>{


e.preventDefault();





let comment =
document.getElementById(
"comment-text"
).value;






await supabaseRequest(
"comments",
"POST",
{


project:
projectId,


username:
"Visitor",


comment:
comment


}

);






form.reset();


loadComments(projectId);



});



}









/*==================================================
    BLOG SYSTEM
==================================================*/


async function loadPosts(){



let box =
document.getElementById(
"blog-container"
);



if(!box)
return;





/*
المستقبل:
إنشاء جدول posts في Supabase
*/


box.innerHTML = `

<div class="blog-card">


<h3>

Welcome To Ahmed Hamid Architecture

</h3>



<p>

Architecture ideas, projects and updates will appear here.

</p>



</div>


`;



}









/*==================================================
    DASHBOARD STATISTICS
==================================================*/


async function loadDashboardStats(){



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
"projects-count"
);



let c =
document.getElementById(
"comments-count"
);





if(p)
p.innerHTML =
projects ?
projects.length :
0;




if(c)
c.innerHTML =
comments ?
comments.length :
0;





}









/*==================================================
    GOOGLE ANALYTICS CHART
==================================================*/


function loadAnalyticsChart(){



let canvas =
document.getElementById(
"visitorChart"
);



if(!canvas)
return;





new Chart(
canvas,
{


type:"line",


data:{


labels:[

"Mon",
"Tue",
"Wed",
"Thu",
"Fri",
"Sat",
"Sun"

],


datasets:[{

label:
"Visitors",


data:[0,0,0,0,0,0,0]

}]


},


options:{


responsive:true,


plugins:{


legend:{


display:true


}


}


}


}

);



}









/*==================================================
    PROJECT FILTER
==================================================*/


document.addEventListener(
"click",
(e)=>{



if(
e.target.classList.contains(
"filter-btn"
)
){



let filter =
e.target.dataset.filter;





document
.querySelectorAll(
".filter-btn"
)
.forEach(
(btn)=>
btn.classList.remove(
"active"
)
);





e.target.classList.add(
"active"
);






document
.querySelectorAll(
".project-card"
)
.forEach(
(card)=>{



if(
filter==="all"
||
card.dataset.category===filter
){


card.style.display =
"block";


}else{


card.style.display =
"none";


}



});



}




});









/*==================================================
    BACK TO TOP
==================================================*/


document.addEventListener(
"DOMContentLoaded",
()=>{



let btn =
document.getElementById(
"backToTop"
);



if(btn){



window.addEventListener(
"scroll",
()=>{


if(
window.scrollY>400
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







loadPosts();


loadDashboardStats();


loadAnalyticsChart();



});