(function(){

"use strict";


/* ==========================================
   PERSONAL BEST SCRAMBLE
========================================== */

const pbTimes = document.querySelectorAll(".pb-time");


function scramblePB(element, finalValue, delay){

    const numbers = "0123456789";

    element.textContent = "00.00";

    setTimeout(()=>{

        let frame = 0;

        const totalFrames = 30;

        const animation = setInterval(()=>{

            const reveal =
                Math.floor(
                    (frame / totalFrames) *
                    finalValue.length
                );


            element.textContent = finalValue
                .split("")
                .map((char,index)=>{

                    if(char === "."){
                        return ".";
                    }

                    if(index < reveal){
                        return finalValue[index];
                    }

                    return numbers[
                        Math.floor(
                            Math.random()*10
                        )
                    ];

                })
                .join("");


            frame++;


            if(frame > totalFrames){

                clearInterval(animation);

                element.textContent = finalValue;

            }

        },45);

    },delay);

}


pbTimes.forEach((time,index)=>{

    scramblePB(
        time,
        time.textContent.trim(),
        index * 120
    );

});


/* ==========================================
   RESULTS DATABASE
========================================== */

const results = {

    international:{

        2021:[

            {
                name:"Uzbekistan swimming championship 2021",
                date:"12th to 17th April 2021",
                location:"Tashkent, Uzbekistan",

                events:[

                    ["50M Butterfly","🥈 Silver","25.16"],
                ]

            }

        ],
        
        2019:[

            {
                name:"10th Asian Age Group Aquatic Championships",
                date:"24th September to 02nd October 2019",
                location:"Bengaluru, India",

                events:[

                    ["4X100M Freestyle relay","🥉 Bronze","3.33.52"]

                ]

            }

        ],

        2016:[

            {
                name:"South Asian Aquatic Championships 2016",
                date:"19th to 23rd October 2016",
                location:"Colombo, Sri Lanka",

                events:[

                    ["100M Butterfly ","🥇 Gold","59.42"],
                    ["50M Butterfly","🥈 Silver","26.95"],
                    ["50M Backstroke","🥈 Silver","29.39"],
                    ["4X100M Medley relay","🥇 Gold","4.14.59"],
                    ["4X100M Freestyle relay","🥇 Gold","3.48.20"]

                ]

            }

        ]

    },


    national:{

        2026:[

            {
                name:"79th Senior National Aquatic Championships",
                date:"16th to 21st June 2026",
                location:"Ahmedabad, Gujarat",

                events:[

                    ["4X100M Medley relay","🥇 Gold","3.44.74 (NMR)"],
                    ["4X100M Mixed Freestyle relay","🥈 Silver","3.42.02"],
                    ["4X100M Freestyle relay","🥈 Silver","3.25.76"]

                ]

            }

        ],


        2025:[

            {
                name:"78th Senior National Aquatic Championships",
                location:"Odisha, Bhubaneshwar",
                date:"22nd to 26th June 2025",

                events:[

                    ["4x100m Freestyle Relay","🥇 Gold","3.26.26 (NMR)"],
                    ["4x100m Medley Relay","🥇 Gold","3.45.09 (NMR)"],
                    ["4x100m Mixed Freestyle Relay","🥈 Silver","3.42.99"]

                ]

            },


            {
                name:"All India Inter-University Aquatic Championships",
                location:"Chennai, Tamil Nadu",
                date:"18th to 23rd December 2025",

                events:[

                    ["100m Freestyle","🥉 Bronze","52.33"],
                    ["4x100m Freestyle Relay","🥇 Gold","3.32.46"],
                    ["4x100m Medley Relay","🥇 Gold","3.52.48"],
                    ["4x200m Freestyle Relay","🥉 Bronze","7.59.89"]

                ]

            }

        ],


        2024:[

            {
                name:"77th Senior National Aquatic Championships",
                location:"Mangalore, Karnataka",
                date:"10th to 13th September 2024",

                events:[

                    ["50 Butterfly","🥉 Bronze","24.64"],
                    ["4x100m Freestyle Relay","🥇 Gold","3.32.46"],
                    ["4x100m Medley Relay","🥇 Gold","3.45.66 (NMR)"]

                ]

            },


            {
                name:"2nd All India National Swimming Ranking Championship",
                location:"Chennai",
                date:"10th to 12th June 2024",

                events:[

                    ["100m Freestyle","🥈 Silver","52.63"],
                    ["50m Butterfly","🥈 Silver","24.97"]

                ]

            }

        ],


        2023:[

            {
                name:"76th Senior National Aquatic Championships",
                date:"02nd to 05th July 2023",
                location:"Hyderabad, Telangana",

                events:[

                    ["4X100M Medley relay","🥈 Silver","3.49.50"],
                    ["4X100M Freestyle relay","🥉 Bronze","3.29.60"]

                ]

            }

        ],


        2022:[

            {
                name:"75th Senior National Aquatic Championships",
                date:"06th to 10th September 2022",
                location:"Guwahati, Assam",

                events:[

                    ["4X100M Medley relay","🥉 Bronze","3.54.27"],
                    ["4X100M Freestyle relay","🥈 Silver","3.30.99"]

                ]

            },


            {
                name:"Khelo India University Games 2021",
                date:"24th April to 03rd May 2022",
                location:"Bengaluru, Karnataka",

                events:[

                    ["50m Butterfly","🥇 Gold","-"],
                    ["100m Freestyle","🥉 Bronze","-"],
                    ["4x100m Medley Relay","🥇 Gold","-"]

                ]

            },


            {
                name:"36th National Games",
                date:"29th September to 12th October 2022",
                location:"Rajkot, Gujarat",

                events:[

                    ["4X100M Medley relay","🥈 Silver",""]

                ]

            }

        ],


        2021:[

            {
                name:"74th Senior National Aquatic Championships",
                date:"26th to 29th October 2021",
                location:"Bengaluru, Karnataka",

                events:[

                    ["50m Butterfly","🥈 Silver","25.08"],
                    ["100m Butterfly","🥉 Bronze","55.72"],
                    ["4x100m Freestyle Relay","🥉 Bronze","3.33.00"],
                    ["4x100m Medley Relay","🥉 Bronze","3.55.12"]

                ]

            },


            {
                name:"All India Inter-University Aquatic Championships",
                location:"Odisha, Bhubaneshwar",
                date:"22nd to 26th December 2021",

                events:[

                    ["50m Butterfly","🥇 Gold",""],
                    ["100m Butterfly","🥈 Silver",""],
                    ["4x100m Medley Relay","🥈 Silver",""]

                ]

            }

        ],


        2020:[

            {
                name:"Khelo India Youth Games",
                location:"Guwahati, Assam",
                date:"10th to 22nd January 2020",

                events:[

                    ["50m Butterfly","🥈 Silver","26.03"],
                    ["4x100m Freestyle Relay","🥉 Bronze","3.41.29"],
                    ["4x100m Medley Relay","🥉 Bronze","3.59.35"]

                ]

            }

        ],


        2019:[

            {
                name:"46th Junior National Aquatic Championships 2019",
                location:"Rajkot, Gujarat",
                date:"26th to 30th June 2019",

                events:[

                    ["50m Butterfly","🥉 Bronze","26.11"],
                    ["4x100m Freestyle Relay","🥈 Silver","3.39.41"]

                ]

            },


            {
                name:"All India Inter-University Aquatic Championships",
                location:"Lovely Professional University, Punjab",
                date:"01st to 04th November 2019",

                events:[

                    ["50m Butterfly","🥈 Silver","25.60"]

                ]

            },


            {
                name:"Khelo India Youth Games",
                location:"Pune, Maharashtra",
                date:"09th to 20th January 2019",

                events:[

                    ["50m Butterfly","🥈 Silver","25.93"],
                    ["100 Butterfly","🥉 Bronze","58.50"],
                    ["200 Individual Medley","🥉 Bronze","2.17.28"],
                    ["4x100m Freestyle Relay","🥇 Gold","3.41.60"],
                    ["4x100m Medley Relay","🥈 Silver","4.05.82"]

                ]

            }

        ],


        2018:[

            {
                name:"45th Junior National Aquatic Championships 2018",
                location:"Pune, Maharashtra",
                date:"24th to 29th June 2018",

                events:[

                    ["50m Butterfly","🥉 Bronze","26.23"],
                    ["4x100m Freestyle Relay","🥈 Silver","3.41.15"],
                    ["4x200m Freestyle Relay","🥈 Silver","8.18.99"]

                ]

            },


            {
                name:"First Khelo India Games",
                location:"Delhi",
                date:"31st January to 08th February 2018",

                events:[

                    ["50m Butterfly","🥇 Gold","26.21"],
                    ["100m Butterfly","🥉 Bronze","58.56"],
                    ["4x100m Freestyle Relay","🥈 Silver","3.44.94"],
                    ["4x100m Medley Relay","🥉 Bronze","4.14.03"]

                ]

            },

            {
                name:"64th National School Games 2018-19",
                location:"Delhi",
                date:"14th to 19th December 2018",

                events:[

                    ["50m Butterfly","🥇 Gold","26.13"],
                    ["100m Butterfly","🥉 Bronze","58.65"],
                    ["4x100m Freestyle Relay","🥉 Bronze","3.49.98"],

                ]

            }

        ],


        2017:[

            {
                name:"44th Junior National Aquatic Championships 2017",
                location:"Pune, Maharashtra",
                date:"03rd to 06th July 2017",

                events:[

                    ["50m Butterfly","🥉 Bronze","26.28"],
                    ["4x100m Medley Relay","🥉 Bronze","4.03.76"],
                    ["4x200m Freestyle Relay","🥉 Bronze","8.19.70"]

                ]

            },

            {
                name:"63th National School Games 2017-18",
                location:"Delhi",
                date:"25th to 29th November 2017",

                events:[

                    ["100m Butterfly","🥉 Bronze","59.78"],
                    ["4x100m Freestyle Relay","🥉 Bronze","3.44.87"],

                ]

            }

        ],


        2016:[

            {
                name:"43rd Junior National Aquatic Championships 2016",
                location:"Bengaluru, Karnataka",
                date:"05th to 09th July 2016",

                events:[

                    ["100m Butterfly","🥇 Gold","1.00.43"],
                    ["50m Butterfly","🥈 Silver","27.18"],
                    ["200m Butterfly","🥉 Bronze","2.15.95"],
                    ["50m Backstroke","🥈 Silver","29.93"],
                    ["4x100m Freestyle Relay","🥈 Silver","3.59.94"],
                    ["4x100m Medley Relay","🥉 Bronze","4.30.53"],
                    ["4x200m Freestyle Relay","🥈 Silver","8.48.53"]

                ]

            },

            {
                name:"62nd National School Games 2016-17",
                location:"Delhi",
                date:"27th to 30th November 2016",

                events:[

                    ["100m Butterfly","🥇 Gold","59.45"],
                    ["50m Backstroke","🥈 Silver","29.64"],
                    ["200m Butterfly","🥈 Silver","2.17.57"],
                    ["4x100m Freestyle Relay","🥉 Bronze","3.56.36"], 

                ]

            }


        ],

        2015:[

            {
                name:"43rd Junior National Aquatic Championships 2016",
                location:"Bengaluru, Karnataka",
                date:"05th to 09th July 2016",

                events:[

                    ["100m Butterfly","🥇 Gold","1.00.43"],
                    ["50m Butterfly","🥈 Silver","27.18"],
                    ["200m Butterfly","🥉 Bronze","2.15.95"],
                    ["50m Backstroke","🥈 Silver","29.93"],
                    ["4x100m Freestyle Relay","🥈 Silver","3.59.94"],
                    ["4x100m Medley Relay","🥉 Bronze","4.30.53"],
                    ["4x200m Freestyle Relay","🥈 Silver","8.48.53"]

                ]

            }

        ],

        2014:[

            {
                name:"31st Sub Junior National Aquatic Championships 2014",
                location:"Indore, Madhya Pradesh",
                date:"26th to 29th June 2014",

                events:[

                    ["50m Butterfly","🥈 Silver","30.85"],

                ]

            },

            {
                name:"60th National school games 2014-15",
                location:"Pune, Maharashtra",
                date:"17th to 22nd february 2015",

                events:[

                    ["4x100m freestyle relay","🥉 Bronze","4.51.47"],

                ]

            }

        ],

        2013:[

            {
                name:"27th South zone Aquatic Championships 2013",
                location:"Hyderabad, Andhra Pradesh",
                date:"07th to 09th February 2014",

                events:[

                    ["50m Butterfly","🥈 Silver","31.05"],
                    ["100m Butterfly","🥈 Silver","1.10.49"],
                    ["50m Backstroke","🥉 Bronze","34.82"],
                    ["100m Backstroke","🥈 Silver","1.14.13"],
                    ["4x50m Freestyle relay","🥇 Gold","2.11.24"],
                    ["4x50m Medley relay","🥈 Silver","2.14.16"],


                ]

            },

            {
                name:"59th National school games 2013-14",
                location:"Pune, Maharashtra",
                date:"10th to 15th December 2013",

                events:[

                    ["100m Butterfly","🥉 Bronze","1.09.41"],

                ]

            }

        ],

        2012:[

            {
                name:"31st Sub Junior National Aquatic Championships 2014",
                location:"Indore, Madhya Pradesh",
                date:"26th to 29th June 2014",

                events:[

                    ["50m Butterfly","🥇 Gold","33.84"],
                    ["50m Backstroke","🥇 Gold","37.22"],
                    ["200m Individual Medley","🥇 Gold","2.54.31"],
                    ["4x50m Freestyle relay","🥈 Silver","2.16.10"],
                    ["4x50m Medley relay","🥉 Bronze","2.32.90"],



                ]

            }

        ],

        2011:[

            {
                name:"31st Sub Junior National Aquatic Championships 2014",
                location:"Indore, Madhya Pradesh",
                date:"26th to 29th June 2014",

                events:[

                    ["4x50m Freestyle relay","🥈 Silver","2.15.26"],
                    ["4x50m Medley relay","🥉 Bronze","2.34.95"],

                ]

            },

            {
                name:"25th Southzone Aquatic Championships 2011",
                location:"Bengaluru, Karnataka",
                date:"26th to 28th December 2011",

                events:[

                    ["50m Butterfly","🥇 Gold","34.53"],
                    ["50m Backstroke","🥈 Silver","39.53"],
                    ["4x50m Freestyle relay","🥇 Gold","2.11.24"],
                    ["4x50m Medley relay","🥈 Silver","2.29.87"],

                ]

            }

        ],

    },


    state:{

        2026:[

            {
                name:"80th Senior State Aquatic Championships 2026",
                location:"Chennai, Tamil Nadu",
                date:"01st to 02nd June 2026",

                events:[

                    ["100m Freestyle","🥇 Gold","51.00"],
                    ["100m Butterfly","🥈 Silver","56.06"],
                    ["50m Butterfly","🥈 Silver","24.96"],
                  
                ]

            }

        ],

       2025:[

            {
                name:"79th Senior State Aquatic Championships 2025",
                location:"Chennai, Tamil Nadu",
                date:"06th to 08th June 2025",

                events:[

                    ["100m Freestyle","🥈 Silver","51.79"],
                    ["100m Butterfly","🥈 Silver","54.83"],
                    ["50m Butterfly","🥈 Silver","25.15"],
                  
                ]

            }

        ],


    }

};


/* ==========================================
   ELEMENTS
========================================== */

const container =
    document.querySelector("#results-container");

const yearSelector =
    document.querySelector(".year-selector");

const tabs =
    document.querySelectorAll(".result-tab");


const lightbox =
    document.querySelector(".result-lightbox");

const lightboxTitle =
    document.querySelector(".lightbox-title");

const lightboxDate =
    document.querySelector(".lightbox-date");

const lightboxLocation =
    document.querySelector(".lightbox-location");

const lightboxEvents =
    document.querySelector(".lightbox-events");

const closeButton =
    document.querySelector(".lightbox-close");


/* ==========================================
   PAGE STATE
========================================== */

let currentCategory = "international";

let currentYear = "2019";


/* ==========================================
   MEDAL TOTALS
========================================== */

function calculateMedals(){

    let gold = 0;

    let silver = 0;

    let bronze = 0;


    Object.values(results).forEach(category => {

        if(!category || typeof category !== "object"){
            return;
        }


        Object.values(category).forEach(year => {

            if(!Array.isArray(year)){
                return;
            }


            year.forEach(competition => {

                if(
                    !competition ||
                    !Array.isArray(competition.events)
                ){

                    return;

                }


                competition.events.forEach(event => {

                    if(!Array.isArray(event)){
                        return;
                    }


                    const medal =
                        typeof event[1] === "string"
                            ? event[1]
                            : "";


                    if(medal.includes("🥇")){
                        gold++;
                    }

                    else if(medal.includes("🥈")){
                        silver++;
                    }

                    else if(medal.includes("🥉")){
                        bronze++;
                    }

                });

            });

        });

    });


    return {
        gold,
        silver,
        bronze
    };

}


/* ==========================================
   MEDAL SCRAMBLE
========================================== */

function scrambleMedal(element, finalNumber, delay){

    if(!element){
        return;
    }


    const numbers = "0123456789";

    const safeNumber =
        Number.isFinite(Number(finalNumber))
            ? Number(finalNumber)
            : 0;


    const finalValue =
        String(safeNumber).padStart(2,"0");


    element.textContent = "00";


    setTimeout(()=>{

        let frame = 0;

        const totalFrames = 34;

        const animation = setInterval(()=>{

            const reveal =
                Math.floor(
                    (frame / totalFrames) *
                    finalValue.length
                );


            let output = "";


            for(
                let index = 0;
                index < finalValue.length;
                index++
            ){

                if(index < reveal){

                    output += finalValue[index];

                }

                else{

                    output += numbers[
                        Math.floor(
                            Math.random() * numbers.length
                        )
                    ];

                }

            }


            element.textContent = output;


            frame++;


            if(frame > totalFrames){

                clearInterval(animation);

                element.textContent = finalValue;

            }

        },50);

    },delay);

}


/* ==========================================
   DISPLAY MEDALS
========================================== */

function displayMedals(){

    const totals = calculateMedals();


    const gold =
        document.querySelector("#gold-count");

    const silver =
        document.querySelector("#silver-count");

    const bronze =
        document.querySelector("#bronze-count");


    scrambleMedal(
        gold,
        totals.gold,
        0
    );


    scrambleMedal(
        silver,
        totals.silver,
        150
    );


    scrambleMedal(
        bronze,
        totals.bronze,
        300
    );

}


/* ==========================================
   BUILD YEARS
========================================== */

function buildYears(){

    if(!yearSelector){
        return;
    }


    yearSelector.innerHTML = "";


    const category =
        results[currentCategory] || {};


    const availableYears =
        Object.keys(category)

            .filter(year => {

                return(
                    Array.isArray(category[year]) &&
                    category[year].length > 0
                );

            })

            .sort(
                (a,b) =>
                    Number(b) - Number(a)
            );


    if(availableYears.length === 0){

        currentYear = "";

        return;

    }


    if(
        !availableYears.includes(
            String(currentYear)
        )
    ){

        currentYear =
            availableYears[0];

    }


    availableYears.forEach(year => {

        const button =
            document.createElement("button");


        button.type = "button";

        button.className = "year";

        button.textContent = year;


        if(
            String(year) ===
            String(currentYear)
        ){

            button.classList.add("active");

        }


        button.addEventListener(
            "click",
            ()=>{

                currentYear =
                    String(year);

                buildYears();

                buildResults();

            }
        );


        yearSelector.appendChild(button);

    });

}


/* ==========================================
   BUILD RESULTS
========================================== */

function buildResults(){

    if(!container){
        return;
    }


    container.innerHTML = "";


    const category =
        results[currentCategory] || {};


    const competitions =
        category[currentYear] || [];


    competitions.forEach(
        (competition,index)=>{

            const item =
                document.createElement("div");


            item.className =
                "competition-item";


            item.dataset.index =
                String(index);


            item.innerHTML = `

                <div class="competition-left">

                    <h3>
                        ${competition.name || ""}
                    </h3>

                    <p>
                        ${competition.location || ""}
                    </p>

                </div>

                <div class="competition-right">
                    →
                </div>

            `;


            item.addEventListener(
                "click",
                ()=>{

                    openCompetition(
                        competition
                    );

                }
            );


            container.appendChild(item);

        }
    );

}


/* ==========================================
   CATEGORY SWITCHING
========================================== */

tabs.forEach(tab => {

    tab.addEventListener(
        "click",
        ()=>{

            tabs.forEach(button => {

                button.classList.remove(
                    "active"
                );

            });


            tab.classList.add("active");


            currentCategory =
                tab.textContent
                    .trim()
                    .toLowerCase();


            currentYear = "";


            buildYears();

            buildResults();

        }
    );

});


/* ==========================================
   OPEN LIGHTBOX
========================================== */

function openCompetition(competition){

    if(!lightbox){
        return;
    }


    if(lightboxTitle){

        lightboxTitle.textContent =
            competition.name || "";

    }


    if(lightboxDate){

        lightboxDate.textContent =
            competition.date || "";

    }


    if(lightboxLocation){

        lightboxLocation.textContent =
            competition.location || "";

    }


    if(lightboxEvents){

        lightboxEvents.innerHTML = "";


        if(
            Array.isArray(
                competition.events
            )
        ){

            competition.events.forEach(
                event => {

                    const row =
                        document.createElement("div");


                    row.className =
                        "event-row";


                    row.innerHTML = `

                        <div class="event-name">
                            ${event[0] || ""}
                        </div>

                        <div class="event-place">
                            ${event[1] || ""}
                        </div>

                        <div class="event-time">
                            ${event[2] || ""}
                        </div>

                    `;


                    lightboxEvents.appendChild(
                        row
                    );

                }
            );

        }

    }


    lightbox.classList.add("show");

}


/* ==========================================
   CLOSE LIGHTBOX
========================================== */

function closeLightbox(){

    if(lightbox){

        lightbox.classList.remove(
            "show"
        );

    }

}


if(closeButton){

    closeButton.addEventListener(
        "click",
        closeLightbox
    );

}


if(lightbox){

    lightbox.addEventListener(
        "click",
        event => {

            if(event.target === lightbox){

                closeLightbox();

            }

        }
    );

}


document.addEventListener(
    "keydown",
    event => {

        if(event.key === "Escape"){

            closeLightbox();

        }

    }
);


/* ==========================================
   INITIALISE
========================================== */

displayMedals();

buildYears();

buildResults();


})();
