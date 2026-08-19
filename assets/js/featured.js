/* ==========================================
   FEATURED PAGE
========================================== */

const featuredWrapper = document.getElementById("featuredWrapper");
const featuredTrack = document.querySelector(".featured-track");

if (featuredWrapper && featuredTrack) {

    const isMobile = window.innerWidth <= 700;


    /* ==========================================
       MOBILE — VERTICAL FEATURE FEED
    ========================================== */

    if (isMobile) {

        const cards = Array.from(
            featuredWrapper.querySelectorAll(".article-card")
        );


        /* ------------------------------------------
           MAKE SURE CARDS ARE ORIGINAL ONLY
        ------------------------------------------ */

        featuredWrapper.innerHTML = "";

        cards.forEach(card => {

            featuredWrapper.appendChild(card);

        });


        /* ------------------------------------------
           CREATE DOTS
        ------------------------------------------ */

        const dots = document.createElement("div");

        dots.className = "featured-dots";


        cards.forEach((card, index) => {

            const dot = document.createElement("button");

            dot.type = "button";

            dot.className =
                index === 0
                    ? "featured-dot active"
                    : "featured-dot";

            dot.setAttribute(
                "aria-label",
                `Go to feature ${index + 1}`
            );


            dot.addEventListener("click", () => {

                card.scrollIntoView({
                    behavior:"smooth",
                    inline:"center",
                    block:"nearest"
                });

            });


            dots.appendChild(dot);

        });


        featuredTrack.after(dots);


        /* ------------------------------------------
           UPDATE ACTIVE DOT
        ------------------------------------------ */

        const observer = new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) return;

                    const index = cards.indexOf(
                        entry.target
                    );

                    if (index === -1) return;


                    dots.querySelectorAll(
                        ".featured-dot"
                    ).forEach((dot, i) => {

                        dot.classList.toggle(
                            "active",
                            i === index
                        );

                    });

                });

            },
            {
                root:featuredWrapper,
                threshold:.6
            }
        );


        cards.forEach(card => {

            observer.observe(card);

        });

    }


    /* ==========================================
       DESKTOP — ORIGINAL INFINITE CAROUSEL
    ========================================== */

    else {

        featuredWrapper.innerHTML +=
            featuredWrapper.innerHTML;


        let position = 0;

        const idleSpeed = 0.12;

        let velocity = idleSpeed;

        let dragging = false;

        let lastX = 0;


        function animate() {

            position += velocity;


            const loopWidth =
                featuredWrapper.scrollWidth / 2;


            if (position >= loopWidth) {

                position -= loopWidth;

            }


            if (position < 0) {

                position += loopWidth;

            }


            featuredWrapper.style.transform =
                `translateX(${-position}px)`;


            if (!dragging) {

                velocity +=
                    (idleSpeed - velocity) * 0.03;

            }


            requestAnimationFrame(animate);

        }


        animate();


        /* ------------------------------------------
           DESKTOP WHEEL
        ------------------------------------------ */

        /* Only a genuine SIDEWAYS gesture drives the track. Vertical
           wheel must fall through to the page: this used to
           preventDefault() every wheel event over a full-viewport
           section, which trapped the reader -- there was no way to
           scroll past Featured to the sections below it. */

        featuredTrack.addEventListener(
            "wheel",
            e => {

                if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;

                e.preventDefault();

                velocity += e.deltaX * 0.02;

            },
            { passive:false }
        );


        /* ------------------------------------------
           DESKTOP DRAG
        ------------------------------------------ */

        featuredTrack.addEventListener(
            "pointerdown",
            e => {

                dragging = true;

                lastX = e.clientX;

                featuredTrack.style.cursor =
                    "grabbing";

            }
        );


        window.addEventListener(
            "pointermove",
            e => {

                if (!dragging) return;


                const dx =
                    e.clientX - lastX;


                position -= dx;

                velocity = -dx * 0.35;

                lastX = e.clientX;

            }
        );


        window.addEventListener(
            "pointerup",
            () => {

                dragging = false;

                featuredTrack.style.cursor =
                    "grab";

            }
        );

    }

}