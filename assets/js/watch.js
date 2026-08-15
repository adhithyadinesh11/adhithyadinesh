const cards = document.querySelectorAll(".collection-card");

cards.forEach(card=>{

    card.addEventListener("click",()=>{

        const page = card.dataset.page;

        if(page==="race"){

            window.location.href="race.html";

        }

        if(page==="swim"){

            window.location.href="swim.html";

        }

    });

});