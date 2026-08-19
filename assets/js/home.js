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
