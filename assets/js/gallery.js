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

const featuredContainer = document.querySelector("#featured-photo");

const grid = document.querySelector("#gallery-grid");

gallery.forEach(photo => {

    const card = document.createElement("div");

    card.className = photo.featured ? "featured-photo" : "gallery-item";

    card.innerHTML = `
        <img src="assets/images/gallery/${photo.image}" alt="${photo.title}">
    `;

    card.dataset.title = photo.title;

    card.dataset.subtitle = photo.subtitle;

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

    lightboxImage.src = img.src;

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