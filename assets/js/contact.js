/* ==========================================
   CONTACT FORM

   Two destinations for one submission:

     1. Web3Forms  -> delivers the email  (must succeed; drives the UI)
     2. Apps Script -> appends a row to a Google Sheet, so there is a
                       permanent record of everyone who wrote in
                       (best effort; never blocks or fails the send)

   Without JavaScript the form still works: the markup keeps its
   action, method and hidden redirect field, so it falls back to a
   plain Web3Forms POST. Only the Sheet record is lost in that case.
========================================== */

const contactForm = document.querySelector(".contact-form");

if (contactForm) {

    const status = contactForm.querySelector(".contact-status");

    const submitButton = contactForm.querySelector("button[type='submit']");

    const buttonLabel = submitButton ? submitButton.innerHTML : "";


    function setStatus(message, state){

        if(!status) return;

        status.textContent = message;

        status.className = "contact-status" + (state ? " " + state : "");

    }


    /* ==========================================
       RECORD TO THE SHEET

       Sent as text/plain so it stays a "simple" CORS request. Apps
       Script cannot answer a preflight, so anything that triggers one
       (application/json, custom headers) fails before it arrives.
       The response is opaque under no-cors; the write still happens.
    ========================================== */

    function recordSubmission(payload){

        /* Read at submit time, not at load. The attribute is the single
           source of truth, so picking it up late means it can be set or
           changed after the script has run. */

        const sheetEndpoint = contactForm.dataset.sheetEndpoint || "";

        if(!sheetEndpoint) return;

        try {

            fetch(sheetEndpoint, {
                method:"POST",
                mode:"no-cors",
                headers:{ "Content-Type":"text/plain;charset=utf-8" },
                body:JSON.stringify(payload)
            }).catch(() => {});

        } catch (error) {

            /* Swallowed on purpose. A failed record must never stop the
               visitor's message from being delivered. */

        }

    }


    /* ==========================================
       SUBMIT
    ========================================== */

    contactForm.addEventListener("submit", async event => {

        event.preventDefault();

        const data = new FormData(contactForm);

        if(submitButton){
            submitButton.disabled = true;
            submitButton.innerHTML = "SENDING";
        }

        setStatus("Sending your message…", "is-busy");


        /* Fire the record first and do not wait for it. */

        recordSubmission({
            name:      data.get("name")    || "",
            email:     data.get("email")   || "",
            message:   data.get("message") || "",
            page:      window.location.href,
            userAgent: navigator.userAgent
        });


        /* Then deliver the email, which decides what the visitor sees. */

        try {

            const response = await fetch(contactForm.action, {
                method:"POST",
                body:data,
                headers:{ Accept:"application/json" }
            });

            const result = await response.json().catch(() => ({}));

            if(response.ok && result.success !== false){

                contactForm.reset();

                setStatus(
                    "Thank you — your message has been sent.",
                    "is-ok"
                );

            }else{

                setStatus(
                    result.message ||
                    "That did not go through. Please email adhithyadinesh11@gmail.com directly.",
                    "is-bad"
                );

            }

        } catch (error) {

            setStatus(
                "No connection. Please email adhithyadinesh11@gmail.com directly.",
                "is-bad"
            );

        } finally {

            if(submitButton){
                submitButton.disabled = false;
                submitButton.innerHTML = buttonLabel;
            }

        }

    });

}
