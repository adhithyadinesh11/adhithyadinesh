/* ==========================================
   MOBILE NAVIGATION
========================================== */

const navbar = document.querySelector(".navbar");

if (navbar) {

    /* Create hamburger button */

    const menuToggle = document.createElement("button");

    menuToggle.className = "menu-toggle";
    menuToggle.type = "button";
    menuToggle.setAttribute("aria-label", "Open menu");
    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    navbar.appendChild(menuToggle);


    /* Toggle menu */

    menuToggle.addEventListener("click", () => {

        const isOpen = navbar.classList.toggle("mobile-open");

        menuToggle.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close menu" : "Open menu"
        );

        document.body.classList.toggle(
            "mobile-menu-open",
            isOpen
        );

    });


    /* Close menu when a navigation link is clicked */

    navbar.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navbar.classList.remove("mobile-open");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle.setAttribute(
                "aria-label",
                "Open menu"
            );

            document.body.classList.remove(
                "mobile-menu-open"
            );

        });

    });


    /* Close menu when resizing back to desktop */

    window.addEventListener("resize", () => {

        if (window.innerWidth > 700) {

            navbar.classList.remove("mobile-open");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle.setAttribute(
                "aria-label",
                "Open menu"
            );

            document.body.classList.remove(
                "mobile-menu-open"
            );

        }

    });

}

/* ==========================================
   PAGE FADE
========================================== */

const page = document.querySelector(".page-fade");

if (page) {

    page.classList.add("fade-in");

    document.querySelectorAll(".navbar a").forEach(link => {

        /* In-page anchors must scroll, not reload. Only fade for links
           that genuinely leave the current document. */

        if (link.getAttribute("href").startsWith("#")) return;

        if (link.pathname === window.location.pathname) return;

        link.addEventListener("click", function (e) {

            e.preventDefault();

            page.classList.remove("fade-in");
            page.classList.add("fade-out");

            setTimeout(() => {

                window.location.href = link.href;

            }, 280);

        });

    });

}


/* ==========================================
   ABOUT PAGE — FULL SCREEN TYPEWRITER
========================================== */

const aboutText = document.querySelector("#about-typewriter");
const aboutCursor = document.querySelector(".type-cursor");
const skipPrompt = document.querySelector(".desktop-skip");
const mobileSkip = document.querySelector(".mobile-skip");

if (aboutText && aboutCursor) {

const aboutContent = `Hi, Iam Adhi, 
    
I was six when I was first pushed into a swimming pool.

Not to become a swimmer.

just to get the fear of water out of my way...

Seventeen years later, I have spent most of my life in the water than on land.

What began as a summer coaching camp became a journey through early mornings, double sessions, school days, competition, failure, growth — and eventually, representing India on the international stages.

A few golds at the South Asian aquatic championships, A bronze at the 10th Asian age group championships and a hundered other medals at national level gave me the spotlight i needed along with countless moments in between that never made the podium but shaped the athlete I became.

Swimming taught me that progress rarely looks dramatic. Most of it happens quietly — at 5 in the morning, when nobody is watching, when you choose to get in again.

17 years. One sport. Still not finished.`;

    let index = 0;
    let typing = true;

    const typingSpeed = 32;


    function typeAbout(){

        if(!typing) return;

        if(index < aboutContent.length){

            aboutText.textContent += aboutContent.charAt(index);

            index++;

            setTimeout(typeAbout, typingSpeed);

        }else{

            finishAbout();

        }

    }


    function finishAbout(){

        typing = false;

        aboutText.textContent = aboutContent;

        aboutCursor.classList.add("finished");

        if(skipPrompt){
            skipPrompt.classList.add("hidden");
        }

        if(mobileSkip){
            mobileSkip.classList.add("hidden");
        }

    }


    /* MOBILE — CLICK SKIP */

    if(mobileSkip){

        mobileSkip.addEventListener("click", () => {

            finishAbout();

        });

    }


    /* DESKTOP — PRESS ENTER */

    document.addEventListener("keydown", (event)=>{

        if(event.key === "Enter"){

            finishAbout();

        }

    });


    /* START TYPING */

    setTimeout(()=>{

        typeAbout();

    },700);

}
