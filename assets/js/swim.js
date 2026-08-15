// ==========================================
// SWIM VIDEOS
// ==========================================

const swims = [

    {
        number: "SWIM 001",
        title: "DIVE TECHNIQUE",
        meet: "Session with SWIMPLE",
        details: "Bangalore, India",
        video: "https://ik.imagekit.io/adswimmedia/swim1-web.mp4"
    },

    {
        number: "SWIM 002",
        title: "100M Butterfly drone shot",
        meet: "Senior state 2024",
        details: "First time swimming sub 55 in 100 fly",
        video: "https://ik.imagekit.io/adswimmedia/swim2-web.mp4"
    }

];

// ==========================================
// BUILD PAGE
// ==========================================

const raceList = document.querySelector("#race-list");

swims.forEach(swim => {

    const card = document.createElement("div");

    card.className = "race-card";

    card.innerHTML = `

        <video
            class="race-preview"
            muted
            loop
            autoplay
            playsinline
            preload="metadata">

            <source src="${swim.video}" type="video/mp4">

        </video>

        <div>

            <div class="race-number">

                ${swim.number}

            </div>

            <div class="race-title">

                ${swim.title}

            </div>

            <div class="race-meta">

                ${swim.meet}<br>

                ${swim.details}

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

document.querySelectorAll(".race-card").forEach((card, index) => {

    card.addEventListener("click", () => {

        fullscreen.src = swims[index].video;

        title.textContent = swims[index].title;

        subtitle.textContent = swims[index].meet;

        player.classList.add("active");

        fullscreen.play();

    });

});

close.addEventListener("click", () => {

    fullscreen.pause();

    fullscreen.removeAttribute("src");

    player.classList.remove("active");

});

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        fullscreen.pause();

        fullscreen.removeAttribute("src");

        player.classList.remove("active");

    }

});