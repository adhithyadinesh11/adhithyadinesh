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
