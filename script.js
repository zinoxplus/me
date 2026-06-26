
"use strict";

/* ==========================================
   Mouse Light
========================================== */

const mouseLight = document.querySelector(".mouse-light");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let currentX = mouseX;
let currentY = mouseY;

document.addEventListener("mousemove", (e) => {

    mouseX = e.clientX;
    mouseY = e.clientY;

});

function animateMouseLight(){

    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;

    mouseLight.style.left = currentX + "px";
    mouseLight.style.top = currentY + "px";

    requestAnimationFrame(animateMouseLight);

}

animateMouseLight();

/* ==========================================
   Card Hover Tilt
========================================== */

const cards = document.querySelectorAll(".stat-card");

cards.forEach(card=>{

card.addEventListener("mousemove",(e)=>{

const rect=card.getBoundingClientRect();

const x=e.clientX-rect.left;

const y=e.clientY-rect.top;

const rotateY=((x/rect.width)-0.5)*10;

const rotateX=((y/rect.height)-0.5)*-10;

card.style.transform=

`
perspective(900px)
rotateX(${rotateX}deg)
rotateY(${rotateY}deg)
translateY(-6px)
`;

});

card.addEventListener("mouseleave",()=>{

card.style.transform="";

});

});

/* ==========================================
   Steam Button Ripple
========================================== */

const steamBtn=document.querySelector(".steam-btn");

steamBtn.addEventListener("click",(e)=>{

const ripple=document.createElement("span");

const rect=steamBtn.getBoundingClientRect();

const size=Math.max(rect.width,rect.height);

ripple.style.width=size+"px";

ripple.style.height=size+"px";

ripple.style.left=e.clientX-rect.left-size/2+"px";

ripple.style.top=e.clientY-rect.top-size/2+"px";

ripple.className="ripple";

steamBtn.appendChild(ripple);

setTimeout(()=>{

ripple.remove();

},700);

});

/* ==========================================
   Fade On Load
========================================== */

window.addEventListener("load",()=>{

document.body.classList.add("loaded");

});



/*==================================================
    Floating Particles
==================================================*/

const particleContainer = document.getElementById("particles");

const PARTICLE_COUNT = 28;

function random(min,max){

return Math.random()*(max-min)+min;

}

function createParticle(){

const p=document.createElement("span");

p.className="particle";

const size=random(2,6);

p.style.width=size+"px";

p.style.height=size+"px";

p.style.left=random(0,100)+"vw";

p.style.top=random(100,120)+"vh";

p.style.animationDuration=random(10,18)+"s";

p.style.animationDelay=random(0,6)+"s";

particleContainer.appendChild(p);

}

for(let i=0;i<PARTICLE_COUNT;i++){

createParticle();

}

/*==================================================
    Panel Parallax
==================================================*/

const panel=document.querySelector(".profile-panel");

document.addEventListener("mousemove",(e)=>{

const x=(e.clientX/window.innerWidth-.5)*8;

const y=(e.clientY/window.innerHeight-.5)*8;

panel.style.transform=

`translate(${x}px,${y}px)`;

});

/*==================================================
    Glow Cards
==================================================*/

cards.forEach(card=>{

card.addEventListener("mousemove",(e)=>{

const rect=card.getBoundingClientRect();

const x=e.clientX-rect.left;

const y=e.clientY-rect.top;

card.style.background=

`

radial-gradient(

circle at ${x}px ${y}px,

rgba(255,160,40,.18),

rgba(35,35,40,.92) 55%

)

`;

});

card.addEventListener("mouseleave",()=>{

card.style.background="";

});

});

/*==================================================
    Random Flicker
==================================================*/

setInterval(()=>{

document.documentElement.style.setProperty(

"--accent-opacity",

Math.random()*.15+.85

);

},1200);

/*==================================================
    FPS Optimizer
==================================================*/

let ticking=false;

window.addEventListener("scroll",()=>{

if(!ticking){

requestAnimationFrame(()=>{

ticking=false;

});

ticking=true;

}

});
