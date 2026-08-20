const gallery = [

    {
        image: "1.jpg",
        title: "",
        subtitle: "",
        featured: true
    },

    {
        image: "17.jpg",
        title: "at National Ranking meet",
        subtitle: ""
    },

    {
        image: "16.jpg",
        title: "",
        subtitle: ""
    },

    {
        image: "15.jpg",
        title: "",
        subtitle: ""
    },

    {
        image: "14.jpg",
        title: "",
        subtitle: ""
    },

    {
        image: "13.jpg",
        title: "",
        subtitle: ""
    },

    {
        image: "12.jpg",
        title: "",
        subtitle: ""
    },

    {
        image: "11.jpg",
        title: "",
        subtitle: ""
    },

    {
        image: "10.jpg",
        title: "",
        subtitle: ""
    },

    {
        image: "9.jpg",
        title: "",
        subtitle: ""
    },

    {
        image: "8.jpg",
        title: "",
        subtitle: ""
    },

    {
        image: "7.jpg",
        title: "",
        subtitle: ""
    },

    {
        image: "6.jpg",
        title: "",
        subtitle: ""
    },

    {
        image: "5.jpg",
        title: "",
        subtitle: ""
    },

    {
        image: "3.jpg",
        title: "",
        subtitle: ""
    },

    {
        image: "2.jpg",
        title: "",
        subtitle: ""
    }

];


/* ==========================================
   VIDEOS

   Merged from the former swim.js and race.js, which lived on separate
   pages reached through watch.html. Order is frozen: SWIM then RACE,
   matching the order the old collection cards used.
========================================== */

const R2 = "https://pub-214e94a3a6cb4f28be70b88cfa1b2d80.r2.dev/";

const videos = [

    {
        group:"SWIM",
        number:"SWIM 001",
        title:"DIVE TECHNIQUE",
        meet:"Session with SWIMPLE",
        details:"Bangalore, India",
        video:R2 + "swim1-web.mp4"
    },

    {
        group:"SWIM",
        number:"SWIM 002",
        title:"100M Butterfly drone shot",
        meet:"Senior state 2024",
        details:"First time swimming sub 55 in 100 fly",
        video:R2 + "swim2-web.mp4"
    },

    {
        group:"RACE",
        number:"RACE 001",
        title:"100M Freestyle",
        meet:"78th Senior State Aquatic Championships",
        details:"Chennai \u2022 2024 \u2022 PB 51.62",
        video:R2 + "race1-web.mp4"
    },

    {
        group:"RACE",
        number:"RACE 002",
        title:"50M Freestyle",
        meet:"1st All India Invitational Senior Nationals",
        details:"Bangalore \u2022 2021 \u2022 PB 23.68",
        video:R2 + "race2-web.mp4"
    },

    {
        group:"RACE",
        number:"RACE 003",
        title:"50M Butterfly",
        meet:"77th Senior National Aquatic Championships",
        details:"Mangalore \u2022 2026 \u2022 PB 24.59",
        video:R2 + "race3-web.mp4"
    },

    {
        group:"RACE",
        number:"RACE 004",
        title:"100M Freestyle",
        meet:"79th Senior National Aquatic Championships",
        details:"Ahmedabad \u2022 2026 \u2022 PB 51.15",
        video:R2 + "race4-web.mp4"
    }

];


const featuredContainer = document.querySelector("#featured-photo");

const grid = document.querySelector("#gallery-grid");

gallery.forEach(photo => {

    const card = document.createElement("div");

    card.className = photo.featured ? "featured-photo" : "gallery-item";

    /* The grid shows a 640px thumbnail; the lightbox swaps in the full
       2000px file on demand. Loading full-size files into 120-400px
       tiles meant the archive decoded ~190MB of bitmap at once. */

    card.innerHTML = `
        <img src="assets/images/gallery/thumb/${photo.image}"
             alt="${photo.title}" loading="lazy" decoding="async">
    `;

    card.dataset.full = "assets/images/gallery/" + photo.image;

    card.dataset.title = photo.title;

    card.dataset.subtitle = photo.subtitle;

    /* index.html links straight here, as gallery.html#p-17 */

    card.id = "p-" + photo.image.replace(".jpg","");

    if(photo.featured){

        featuredContainer.appendChild(card);

    }else{

        grid.appendChild(card);

    }

});

// ==============================
// LIGHTBOX
// ==============================

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");

const lightboxTitle = document.querySelector(".lightbox-info h2");
const lightboxSubtitle = document.querySelector(".lightbox-info p");

const closeBtn = document.querySelector(".lightbox-close");
const nextBtn = document.querySelector(".lightbox-next");
const prevBtn = document.querySelector(".lightbox-prev");

// Get ALL generated images
const cards = document.querySelectorAll(".featured-photo, .gallery-item");

let currentIndex = 0;

// Open Image
cards.forEach((card,index)=>{

    card.addEventListener("click",()=>{

        currentIndex=index;

        showImage();

    });

});

function showImage(){

    const card = cards[currentIndex];

    const img = card.querySelector("img");

    /* Full-resolution file for the lightbox, thumbnail in the grid. */

    lightboxImage.src = card.dataset.full || img.src;

    lightboxTitle.textContent = card.dataset.title;

    lightboxSubtitle.textContent = card.dataset.subtitle;

    lightbox.classList.add("active");

}

// Close

closeBtn.addEventListener("click",()=>{

    lightbox.classList.remove("active");

});

// Next

nextBtn.addEventListener("click",()=>{

    currentIndex++;

    if(currentIndex>=cards.length){

        currentIndex=0;

    }

    showImage();

});

// Previous

prevBtn.addEventListener("click",()=>{

    currentIndex--;

    if(currentIndex<0){

        currentIndex=cards.length-1;

    }

    showImage();

});

// ESC

document.addEventListener("keydown",(e)=>{

    if(!lightbox.classList.contains("active")) return;

    if(e.key==="Escape"){

        lightbox.classList.remove("active");

    }

    if(e.key==="ArrowRight"){

        nextBtn.click();

    }

    if(e.key==="ArrowLeft"){

        prevBtn.click();

    }

});

// Click outside image

lightbox.addEventListener("click",(e)=>{

    if(e.target===lightbox){

        lightbox.classList.remove("active");

    }

});

/* ==========================================
   BUILD VIDEO LIST
========================================== */

const videoList = document.querySelector("#video-list");

if(videoList){

    let currentGroup = "";

    videos.forEach(item => {

        if(item.group !== currentGroup){

            currentGroup = item.group;

            const heading = document.createElement("h2");

            heading.className = "video-group";

            heading.textContent = currentGroup;

            videoList.appendChild(heading);

        }

        const card = document.createElement("div");

        card.className = "race-card";

        /* No autoplay. Six R2 streams starting at once is real data and
           battery on a phone; the in-view observer below handles motion
           on larger screens only. */

        card.innerHTML = `

            <video
                class="race-preview"
                muted
                loop
                playsinline
                preload="metadata">

                <source src="${item.video}" type="video/mp4">

            </video>

            <div>

                <div class="race-number">${item.number}</div>

                <div class="race-title">${item.title}</div>

                <div class="race-meta">
                    ${item.meet}<br>
                    ${item.details}
                </div>

                <span class="watch-race">PLAY &rarr;</span>

            </div>
        `;

        card.dataset.video   = item.video;
        card.dataset.title   = item.title;
        card.dataset.details = item.details;

        videoList.appendChild(card);

    });

}


/* ==========================================
   VIDEO PLAYER
========================================== */

const player      = document.querySelector("#video-player");
const playerVideo = document.querySelector("#fullscreen-video");
const playerTitle = document.querySelector(".video-info h2");
const playerText  = document.querySelector(".video-info p");
const playerClose = document.querySelector(".close-player");


function closePlayer(){

    if(!player) return;

    player.classList.remove("active");

    playerVideo.pause();

    /* Drop the source too, or the browser keeps streaming a closed video. */

    playerVideo.removeAttribute("src");

    playerVideo.load();

}


if(player){

    document.querySelectorAll(".race-card").forEach(card => {

        card.addEventListener("click", () => {

            playerVideo.src         = card.dataset.video;
            playerTitle.textContent = card.dataset.title;
            playerText.textContent  = card.dataset.details;

            player.classList.add("active");

            playerVideo.play().catch(() => {});

        });

    });

    playerClose.addEventListener("click", closePlayer);

    playerClose.addEventListener("keydown", event => {
        if(event.key === "Enter" || event.key === " ") closePlayer();
    });

    player.addEventListener("click", event => {
        if(event.target === player) closePlayer();
    });

    document.addEventListener("keydown", event => {
        if(event.key === "Escape" && player.classList.contains("active")){
            closePlayer();
        }
    });

}


/* ==========================================
   TABS
========================================== */

const tabs   = [...document.querySelectorAll(".archive-tab")];
const panels = [...document.querySelectorAll(".archive-panel")];


function showPanel(name){

    tabs.forEach(tab => {

        const on = tab.dataset.panel === name;

        tab.classList.toggle("is-active", on);

        tab.setAttribute("aria-selected", on ? "true" : "false");

    });

    panels.forEach(panel =>
        panel.classList.toggle("is-active", panel.id === "panel-" + name)
    );

    /* Never leave a video running behind a hidden panel. */

    if(name !== "videos"){

        document.querySelectorAll(".race-preview").forEach(v => v.pause());

        closePlayer();

    }

}


tabs.forEach(tab =>
    tab.addEventListener("click", () => showPanel(tab.dataset.panel))
);


/* ==========================================
   PREVIEW PLAYBACK

   Nothing autoplays on a phone. Above 700px, only the preview actually
   in view plays.
========================================== */

if(window.matchMedia("(min-width:701px)").matches
   && "IntersectionObserver" in window){

    const previewObserver = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            const video = entry.target;

            if(entry.isIntersecting){
                video.play().catch(() => {});
            }else{
                video.pause();
            }

        });

    },{
        threshold:0.4
    });

    document.querySelectorAll(".race-preview")
        .forEach(video => previewObserver.observe(video));

}


/* ==========================================
   LIGHTBOX SWIPE

   Small arrows are poor on a phone. Horizontal swipe moves between
   photos; a mostly-vertical drag is left alone so the page can still
   be scrolled.
========================================== */

let touchStartX = 0;
let touchStartY = 0;

const SWIPE_THRESHOLD = 50;


if(lightbox){

    lightbox.addEventListener("touchstart", event => {

        touchStartX = event.changedTouches[0].clientX;
        touchStartY = event.changedTouches[0].clientY;

    },{ passive:true });


    lightbox.addEventListener("touchend", event => {

        const deltaX = event.changedTouches[0].clientX - touchStartX;
        const deltaY = event.changedTouches[0].clientY - touchStartY;

        if(Math.abs(deltaX) < SWIPE_THRESHOLD) return;

        if(Math.abs(deltaX) < Math.abs(deltaY)) return;

        if(deltaX < 0){
            nextBtn.click();
        }else{
            prevBtn.click();
        }

    },{ passive:true });

}


/* ==========================================
   DEEP LINK

   index.html sends visitors here as gallery.html#p-17.

   Handled on load AND on hashchange: if someone is already on this page
   when the hash changes, the browser treats it as a same-document
   navigation and never re-runs this script.
========================================== */

function openFromHash(){

    if(!location.hash.startsWith("#p-")) return;

    const target = document.getElementById(location.hash.slice(1));

    if(!target) return;

    showPanel("photos");

    const index = [...cards].indexOf(target);

    if(index > -1){

        currentIndex = index;

        showImage();

    }

}


window.addEventListener("hashchange", openFromHash);

openFromHash();
