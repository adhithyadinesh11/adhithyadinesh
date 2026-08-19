/* ==========================================
   CACHED VIEWPORT HEIGHT

   Mobile Safari fires resize whenever the URL bar collapses or expands
   during a scroll. Sizing the About track from live innerHeight makes
   the sticky panel jump and shifts beat boundaries under the reader's
   thumb. So: cache the height, and only recompute it when the WIDTH
   actually changed, or on a real orientation change.
========================================== */

let cachedHeight = window.innerHeight;
let cachedWidth  = window.innerWidth;


function publishViewport(){

    cachedHeight = window.innerHeight;
    cachedWidth  = window.innerWidth;

    document.documentElement.style.setProperty(
        "--vh-cached",
        cachedHeight + "px"
    );

}


publishViewport();


window.addEventListener("resize", () => {

    /* Height-only change means the toolbar moved. Ignore it. */

    if(window.innerWidth === cachedWidth) return;

    publishViewport();

});


window.addEventListener("orientationchange", () => {

    /* Safari reports stale dimensions immediately after the flip. */

    setTimeout(publishViewport, 200);

});


/* ==========================================
   NAV SCROLL SPY
========================================== */

const spyLinks = [...document.querySelectorAll(".navbar a[href^='#']")];

const spySections = spyLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);


if(spySections.length){

    const spy = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if(!entry.isIntersecting) return;

            spyLinks.forEach(link =>
                link.classList.toggle(
                    "active",
                    link.getAttribute("href") === "#" + entry.target.id
                )
            );

        });

    },{
        rootMargin:"-45% 0px -55% 0px"
    });

    spySections.forEach(section => spy.observe(section));

}


/* ==========================================
   ABOUT — BEAT DRIVER

   Maps scroll position within the track to one active beat. Reads the
   cached viewport height, never live innerHeight, so a collapsing
   mobile toolbar cannot shift the boundaries mid-gesture.
========================================== */

const aboutStage = document.querySelector(".about-stage");

if(aboutStage){

    const beats = [...aboutStage.querySelectorAll(".beat")];

    const ticks = [...aboutStage.querySelectorAll(".beat-progress li")];

    const skipButton = aboutStage.querySelector(".about-skip");

    let activeBeat = 0;
    let frameQueued = false;
    let skipped = false;


    function setActiveBeat(next){

        if(next === activeBeat) return;

        beats[activeBeat].classList.remove("is-active");

        if(ticks[activeBeat]){
            ticks[activeBeat].classList.remove("is-active");
        }

        activeBeat = next;

        beats[activeBeat].classList.add("is-active");

        if(ticks[activeBeat]){
            ticks[activeBeat].classList.add("is-active");
        }

    }


    function measure(){

        const travel = aboutStage.offsetHeight - cachedHeight;

        if(travel <= 0) return;

        const offset = -aboutStage.getBoundingClientRect().top;

        const progress = Math.min(Math.max(offset / travel, 0), 1);

        setActiveBeat(
            Math.min(
                beats.length - 1,
                Math.floor(progress * beats.length)
            )
        );

    }


    function onScroll(){

        if(frameQueued || skipped) return;

        frameQueued = true;

        requestAnimationFrame(() => {
            frameQueued = false;
            measure();
        });

    }


    function skip(){

        if(skipped) return;

        skipped = true;

        aboutStage.classList.add("is-skipped");

        window.removeEventListener("scroll", onScroll);

    }


    skipButton.addEventListener("click", skip);


    document.addEventListener("keydown", event => {

        if(event.key === "Enter" && !skipped){
            skip();
        }

    });


    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){

        skip();

    }else{

        window.addEventListener("scroll", onScroll, { passive:true });

        measure();

    }

}


/* ==========================================
   HERO SCROLL CUE

   Dismiss it the moment the reader shows they have understood.
========================================== */

const scrollCue = document.querySelector(".scroll-cue");

if(scrollCue){

    let cueHidden = false;

    function hideCue(){

        if(cueHidden) return;

        if(window.scrollY < 60) return;

        cueHidden = true;

        scrollCue.classList.add("is-hidden");

        window.removeEventListener("scroll", hideCue);

    }

    window.addEventListener("scroll", hideCue, { passive:true });

    hideCue();

}
