// ==========================================
// RACES
// ==========================================

const races = [

    {
        number:"RACE 001",
        title:"100M Freestyle",
        meet:"78th Senior State Aquatic Championships",
        details:"Chennai • 2024 • PB 51.62",
        video:"https://ik.imagekit.io/adswimmedia/race1-web.mp4"
    },

    {
        number:"RACE 002",
        title:"50M Freestyle",
        meet:"1st All India Invitational Senior Nationals",
        details:"Bangalore • 2021 • PB 23.68",
        video:"https://ik.imagekit.io/adswimmedia/race2-web.mp4"
    },

    {
        number:"RACE 003",
        title:"50M Butterfly",
        meet:"77th Senior National Aquatic Championships",
        details:"Mangalore • 2026 • PB 24.59",
        video:"https://ik.imagekit.io/adswimmedia/race3-web.mp4"
    },

    {
        number:"RACE 004",
        title:"100M Freestyle",
        meet:"79th Senior National Aquatic Championships",
        details:"Ahmedabad • 2026 • PB 51.15",
        video:"https://ik.imagekit.io/adswimmedia/race4-web.mp4"
    }

];

// ==========================================
// BUILD PAGE
// ==========================================

const raceList = document.querySelector("#race-list");

races.forEach(race=>{

    const card = document.createElement("div");

    card.className="race-card";

    card.innerHTML=`

        <video
            class="race-preview"
            muted
            loop
            autoplay
            playsinline
            preload="metadata">

            <source src="${race.video}" type="video/mp4">

        </video>

        <div>

            <div class="race-number">

                ${race.number}

            </div>

            <div class="race-title">

                ${race.title}

            </div>

            <div class="race-meta">

                ${race.meet}<br>

                ${race.details}

            </div>

            <div class="watch-race">

                WATCH →

            </div>

        </div>

    `;

    raceList.appendChild(card);

});

// ==========================================
// VIDEO PREVIEW
// ==========================================

const previews = document.querySelectorAll(".race-preview");

previews.forEach(video => {

    // Desktop hover preview
    video.addEventListener("mouseenter", () => {

        video.play();

    });

    video.addEventListener("mouseleave", () => {

        video.pause();

        video.currentTime = 0;

    });

});

// ==========================================
// PLAYER
// ==========================================

const player = document.querySelector("#video-player");

const fullscreen = document.querySelector("#fullscreen-video");

const title = document.querySelector(".video-info h2");

const subtitle = document.querySelector(".video-info p");

const close = document.querySelector(".close-player");

document.querySelectorAll(".race-card").forEach((card,index)=>{

    card.addEventListener("click",()=>{

        fullscreen.src = races[index].video;

        title.textContent = races[index].title;

        subtitle.textContent = races[index].meet;

        player.classList.add("active");

        fullscreen.play();

    });

});

close.addEventListener("click",()=>{

    fullscreen.pause();

    fullscreen.removeAttribute("src");

    player.classList.remove("active");

});

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        fullscreen.pause();

        fullscreen.removeAttribute("src");

        player.classList.remove("active");

    }

});