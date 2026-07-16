/*==================================================
    AHMED HAMID ARCHITECTURE
    MAIN JAVASCRIPT
==================================================*/


/*==================================================
    CONFIGURATION
==================================================*/


const SUPABASE_URL =
"https://fzlpqsvcicuvldaxgvcz.supabase.co";


const SUPABASE_KEY =
"YOUR_ANON_KEY";


const GOOGLE_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbwFd_q0GcRNc4qEI1NBlHAJxE_cLlmNzdTRXKJkO1wiPt6TUj05aSUWL76uM1YeD3hJ/exec";



/*==================================================
    GOOGLE ANALYTICS
==================================================*/


(function(){

const GA_ID = "G-S8XNQKS8F3";


let script =
document.createElement("script");


script.async = true;


script.src =
"https://www.googletagmanager.com/gtag/js?id="+GA_ID;


document.head.appendChild(script);



window.dataLayer =
window.dataLayer || [];



function gtag(){

dataLayer.push(arguments);

}



window.gtag = gtag;



gtag(
"js",
new Date()
);



gtag(
"config",
GA_ID
);



})();







/*==================================================
    SUPABASE REQUEST HELPER
==================================================*/


async function supabaseRequest(
table,
method="GET",
body=null,
query=""
){


let options={

method:method,

headers:{

"apikey":SUPABASE_KEY,

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
`${SUPABASE_URL}/rest/v1/${table}${query}`,
options
);



if(!response.ok){

console.error(
"Supabase Error:",
await response.text()
);

return null;

}



return await response.json();



}







/*==================================================
    GOOGLE DRIVE IMAGE HANDLER
==================================================*/


function convertDriveImage(url){


if(!url) return "";



// if already direct link

if(
url.includes("googleusercontent.com")
){

return url;

}




// if google drive normal link

if(
url.includes("drive.google.com")
){


let id =
url.match(/[-\w]{25,}/);



if(id){

return 
"https://lh3.googleusercontent.com/d/"+id[0];

}


}



return url;



}







function createImageElement(
src,
alt=""
){


let img =
document.createElement("img");



img.src =
convertDriveImage(src);



img.alt =
alt;



img.loading =
"lazy";



return img;



}







/*==================================================
    MOBILE MENU
==================================================*/


document.addEventListener(
"DOMContentLoaded",
()=>{


const menuBtn =
document.querySelector(".menu-toggle");


const nav =
document.querySelector(".nav-menu");



if(menuBtn && nav){


menuBtn.onclick =
()=>{


nav.classList.toggle("active");


menuBtn.classList.toggle("active");


};


}




});









/*==================================================
    BACK TO TOP
==================================================*/


const backBtn =
document.getElementById(
"backToTop"
);



if(backBtn){


window.addEventListener(
"scroll",
()=>{


if(window.scrollY > 400){

backBtn.classList.add(
"show"
);

}

else{

backBtn.classList.remove(
"show"
);

}



});





backBtn.onclick =
()=>{


window.scrollTo({

top:0,

behavior:"smooth"

});


};



}









/*==================================================
    SCROLL ANIMATION
==================================================*/


const observer =
new IntersectionObserver(
(entries)=>{


entries.forEach(
(entry)=>{


if(entry.isIntersecting){


entry.target.classList.add(
"visible"
);


}


});


},
{

threshold:.15

}
);



document
.querySelectorAll(
".service-card,.project-card,.why-card,.testimonial-card"
)
.forEach(
(el)=>{


observer.observe(el);


});









/*==================================================
    ADMIN SESSION CHECK
==================================================*/


function checkAdmin(){


let page =
window.location.pathname;



if(
page.includes("/admin/")
&&
!page.includes("login.html")
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



checkAdmin();





/*==================================================
    END PART 1
==================================================*/
/*==================================================
    PROJECTS SYSTEM
==================================================*/



async function loadProjects(
containerId="projects-container"
){


const container =
document.getElementById(containerId);



if(!container) return;



container.innerHTML =
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



if(!projects || projects.length===0){


container.innerHTML =
`
<p>
No projects available.
</p>
`;

return;


}




container.innerHTML="";



projects.forEach(
(project)=>{


let card =
document.createElement("article");



card.className =
"project-card";



card.dataset.category =
project.category || "residential";




let image="assets/logo.png";



if(
project.device_image_ids &&
project.device_image_ids.length
){

image =
convertDriveImage(
project.device_image_ids[0]
);


}





card.innerHTML = `

<div class="project-image">

<img 
src="${image}"
alt="${project.title}">

</div>



<div class="project-content">


<span class="project-category">

${project.location || "Architecture"}

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

`;



container.appendChild(card);



});



}









/*==================================================
    SINGLE PROJECT VIEW
==================================================*/


async function loadSingleProject(){


let params =
new URLSearchParams(
window.location.search
);



let id =
params.get("id");



if(!id) return;



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



if(title){

title.innerHTML =
project.title;

}



let description =
document.getElementById(
"project-description"
);



if(description){


description.innerHTML = `

<p>
<strong>Location:</strong>
${project.location}
</p>


<p>
<strong>Plot Area:</strong>
${project.plot_area}
</p>


<p>
<strong>Components:</strong>
${project.components}
</p>


<p>
<strong>Design Concept:</strong>
${project.design_concept}
</p>


<p>
<strong>Challenges:</strong>
${project.challenges}
</p>


<p>
<strong>Result:</strong>
${project.result}
</p>

`;

}




let gallery =
document.getElementById(
"project-gallery"
);



if(gallery){


gallery.innerHTML="";



project.device_image_ids
.forEach(
(img)=>{


gallery.appendChild(
createImageElement(
img,
project.title
)
);


});


}



loadComments(id);



}









/*==================================================
    PROJECT FILTER
==================================================*/


document.addEventListener(
"click",
function(e){


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
.forEach(btn=>{

btn.classList.remove(
"active"
);

});



e.target.classList.add(
"active"
);



document
.querySelectorAll(
".project-card"
)
.forEach(card=>{


if(
filter==="all"
||
card.dataset.category===filter
){


card.style.display =
"block";


}

else{


card.style.display =
"none";


}


});


}



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



if(!box) return;



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
`
<p>
No comments yet.
</p>
`;

return;

}



comments.forEach(
(item)=>{


box.innerHTML += `

<div class="comment-card">


<h4>

${item.username}

</h4>


<p>

${item.comment}

</p>


<small>

${new Date(
item.created_at
).toLocaleDateString()}

</small>


</div>

`;



});



}








async function addComment(
projectId
){


let input =
document.getElementById(
"comment-text"
);



if(!input)
return;



let text =
input.value.trim();



if(!text)
return;



let username =
"Visitor";



await supabaseRequest(
"comments",
"POST",
{

project:projectId,

username:username,

comment:text

}

);



input.value="";



loadComments(projectId);



}






/*==================================================
    AUTO LOAD
==================================================*/


document.addEventListener(
"DOMContentLoaded",
()=>{


loadProjects();


loadSingleProject();


});
/*==================================================
    GOOGLE DRIVE UPLOAD
==================================================*/


function fileToBase64(file){


return new Promise(
(resolve,reject)=>{


let reader =
new FileReader();



reader.onload =
()=>{


let result =
reader.result
.split(",")[1];


resolve(result);


};



reader.onerror =
reject;



reader.readAsDataURL(file);



});

}







async function uploadImageToDrive(file){


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



console.error(
result.message
);



return null;



}








async function uploadMultipleImages(
files
){


let links=[];



for(
let file of files
){


let link =
await uploadImageToDrive(file);



if(link){

links.push(link);

}



}



return links;


}









/*==================================================
    ADD PROJECT ADMIN
==================================================*/


const projectForm =
document.getElementById(
"project-form"
);



if(projectForm){



projectForm.addEventListener(
"submit",
async function(e){


e.preventDefault();





let files =
document.getElementById(
"project-images"
)
.files;





let imageLinks =
await uploadMultipleImages(
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
"",



components:
"",



design_concept:
document.getElementById(
"project-description"
).value,



challenges:
"",



result:
"",



device_image_ids:
imageLinks


};






let saved =
await supabaseRequest(
"projects",
"POST",
project
);





let message =
document.getElementById(
"project-message"
);



if(saved){


message.innerHTML =
"Project published successfully";



projectForm.reset();



}

else{


message.innerHTML =
"Error saving project";


}



});


}









/*==================================================
    ADMIN PROJECT LIST
==================================================*/


async function loadAdminProjects(){


let list =
document.getElementById(
"admin-projects-list"
);



if(!list)
return;



let projects =
await supabaseRequest(
"projects",
"GET",
null,
"?select=*&order=created_at.desc"
);



list.innerHTML="";



projects.forEach(
(project)=>{


list.innerHTML += `

<div class="admin-project-card">


<h3>

${project.title}

</h3>



<p>

${project.location || ""}

</p>



<button
class="edit-project-btn"
data-id="${project.id}">

Edit

</button>



<button
class="delete-project-btn"
data-id="${project.id}">

Delete

</button>


</div>

`;



});



}








/*==================================================
    DELETE PROJECT
==================================================*/


document.addEventListener(
"click",
async function(e){


if(
e.target.classList.contains(
"delete-project-btn"
)
){


let id =
e.target.dataset.id;



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



loadAdminProjects();



}



});









/*==================================================
    EDIT PROJECT LOAD
==================================================*/


document.addEventListener(
"click",
async function(e){


if(
e.target.classList.contains(
"edit-project-btn"
)
){


let id =
e.target.dataset.id;



let data =
await supabaseRequest(
"projects",
"GET",
null,
`?id=eq.${id}`
);



if(!data)
return;



let project =
data[0];



document.getElementById(
"edit-project-box"
)
.style.display="block";



document.getElementById(
"edit-project-id"
)
.value =
project.id;



document.getElementById(
"edit-title"
)
.value =
project.title;



document.getElementById(
"edit-location"
)
.value =
project.location;



document.getElementById(
"edit-description"
)
.value =
project.design_concept;



}



});









/*==================================================
    UPDATE PROJECT
==================================================*/


const editForm =
document.getElementById(
"edit-project-form"
);



if(editForm){


editForm.addEventListener(
"submit",
async function(e){


e.preventDefault();



let id =
document.getElementById(
"edit-project-id"
).value;



await supabaseRequest(
"projects",
"PATCH",
{


title:
document.getElementById(
"edit-title"
).value,



location:
document.getElementById(
"edit-location"
).value,



design_concept:
document.getElementById(
"edit-description"
).value



},

`?id=eq.${id}`

);




alert(
"Updated successfully"
);



loadAdminProjects();



});



}







document.addEventListener(
"DOMContentLoaded",
()=>{


loadAdminProjects();


});
/*==================================================
    BLOG / POSTS SYSTEM
==================================================*/


async function loadPosts(
containerId="blog-container"
){


const container =
document.getElementById(
containerId
);



if(!container)
return;



container.innerHTML =
`
<div class="loading">
Loading Posts...
</div>
`;



let posts =
await supabaseRequest(
"posts",
"GET",
null,
"?select=*&order=created_at.desc"
);



if(!posts || posts.length===0){


container.innerHTML =
`
<p>
No posts available.
</p>
`;

return;


}



container.innerHTML="";



posts.forEach(
(post)=>{


let image =
"assets/logo.png";



if(
post.image_ids &&
post.image_ids.length
){

image =
convertDriveImage(
post.image_ids[0]
);


}



container.innerHTML += `


<article class="blog-card">


<div class="blog-image">


<img src="${image}"
alt="${post.title}">


</div>



<div class="blog-content">


<span class="blog-type">

${post.type}

</span>



<h3>

${post.title}

</h3>



<p>

${post.content.substring(0,150)}...

</p>



<a href="blog.html?id=${post.id}">

Read More

</a>



</div>


</article>


`;



});



}









/*==================================================
    SINGLE POST
==================================================*/


async function loadSinglePost(){


let params =
new URLSearchParams(
window.location.search
);



let id =
params.get("id");



if(!id)
return;



let post =
await supabaseRequest(
"posts",
"GET",
null,
`?id=eq.${id}`
);



if(!post || !post.length)
return;



let data =
post[0];



let title =
document.getElementById(
"post-title"
);



if(title)
title.innerHTML =
data.title;




let content =
document.getElementById(
"post-content"
);



if(content)
content.innerHTML =
data.content;



}









/*==================================================
    ADD POST ADMIN
==================================================*/


const postForm =
document.getElementById(
"post-form"
);



if(postForm){



postForm.addEventListener(
"submit",
async function(e){


e.preventDefault();



let image =
document.getElementById(
"post-image"
)
.files[0];



let images=[];



if(image){


let link =
await uploadImageToDrive(
image
);


if(link)
images.push(link);


}




let post = {


title:
document.getElementById(
"post-title"
).value,



type:
document.getElementById(
"post-type"
).value,



content:
document.getElementById(
"post-content"
).value,



image_ids:
images,



status:
"published"



};




let result =
await supabaseRequest(
"posts",
"POST",
post
);




if(result){


document.getElementById(
"post-message"
).innerHTML =
"Post published successfully";



postForm.reset();



}

else{


document.getElementById(
"post-message"
).innerHTML =
"Error publishing post";


}



});


}









/*==================================================
    DELETE POST
==================================================*/


document.addEventListener(
"click",
async function(e){


if(
e.target.classList.contains(
"delete-post-btn"
)
){


let id =
e.target.dataset.id;



if(
confirm(
"Delete this post?"
)
){


await supabaseRequest(
"posts",
"DELETE",
null,
`?id=eq.${id}`
);



}



}



});









/*==================================================
    LOAD ADMIN POSTS
==================================================*/


async function loadAdminPosts(){


let box =
document.getElementById(
"posts-list"
);



if(!box)
return;



let posts =
await supabaseRequest(
"posts",
"GET",
null,
"?select=*&order=created_at.desc"
);



box.innerHTML="";



posts.forEach(
(post)=>{


box.innerHTML += `


<div class="admin-project-card">


<h3>

${post.title}

</h3>


<p>

${post.type}

</p>



<button
class="delete-post-btn"
data-id="${post.id}">

Delete

</button>


</div>


`;



});


}









/*==================================================
    ANALYTICS PLACEHOLDER
==================================================*/


async function loadAnalytics(){


/*
Google Analytics Data API
will be connected here later.

Requires:
- Google Cloud Project
- Analytics Data API
- Service Account

*/


}





document.addEventListener(
"DOMContentLoaded",
()=>{


loadPosts();


loadSinglePost();


loadAdminPosts();


loadAnalytics();



});
