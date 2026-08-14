/* =========================================================
   ARCHI GENERATOR
   FRONTEND APPLICATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const navItems =
        document.querySelectorAll(".nav-item");

    const pages =
        document.querySelectorAll(".page");

    const pageButtons =
        document.querySelectorAll("[data-page]");

    const sidebar =
        document.getElementById("sidebar");

    const menuButton =
        document.getElementById("menuButton");

    const themeButton =
        document.getElementById("themeButton");

    const generateButton =
        document.getElementById("generateBtn");

    const generateFromPage =
        document.getElementById("generateFromPage");

    const loading =
        document.getElementById("loading");

    const result =
        document.getElementById("result");

    const resultContent =
        document.getElementById("resultContent");

    const copyResult =
        document.getElementById("copyResult");


    /* =====================================================
       PAGE NAVIGATION
       IMPORTANT:
       This changes pages instead of scrolling.
    ===================================================== */

    function openPage(pageName) {

        pages.forEach(page => {

            page.classList.remove("active-page");

        });


        const selectedPage =
            document.getElementById(pageName);


        if (selectedPage) {

            selectedPage.classList.add("active-page");

        }


        navItems.forEach(item => {

            item.classList.remove("active");

            if (
                item.dataset.page === pageName
            ) {

                item.classList.add("active");

            }

        });


        // Always start the new page from the top.
        window.scrollTo({
            top: 0,
            behavior: "instant"
        });


        // Close mobile sidebar.
        sidebar.classList.remove("open");

    }


    /* =====================================================
       NAVIGATION BUTTONS
    ===================================================== */

    pageButtons.forEach(button => {

        button.addEventListener("click", () => {

            const page =
                button.dataset.page;

            if (!page) return;

            openPage(page);

        });

    });


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    menuButton.addEventListener("click", () => {

        sidebar.classList.toggle("open");

    });


    /* =====================================================
       THEME BUTTON
    ===================================================== */

    themeButton.addEventListener("click", () => {

        document.body.classList.toggle("light-mode");

        const icon =
            themeButton.querySelector("i");

        if (
            document.body.classList.contains(
                "light-mode"
            )
        ) {

            icon.className =
                "fa-regular fa-moon";

        } else {

            icon.className =
                "fa-regular fa-sun";

        }

    });


    /* =====================================================
       GENERATE PAGE BUTTON
    ===================================================== */

    if (generateFromPage) {

        generateFromPage.addEventListener(
            "click",
            () => {

                openPage("dashboard");

                setTimeout(() => {

                    document
                        .getElementById("propertySize")
                        ?.focus();

                }, 100);

            }
        );

    }


    /* =====================================================
       AI GENERATION
    ===================================================== */

    if (generateButton) {

        generateButton.addEventListener(
            "click",
            generateArchitecture
        );

    }


    async function generateArchitecture() {

        const propertySize =
            document.getElementById(
                "propertySize"
            ).value;

        const floors =
            document.getElementById(
                "floors"
            ).value;

        const bedrooms =
            document.getElementById(
                "bedrooms"
            ).value;

        const bathrooms =
            document.getElementById(
                "bathrooms"
            ).value;

        const kitchens =
            document.getElementById(
                "kitchens"
            ).value;

        const parking =
            document.getElementById(
                "parking"
            ).value;

        const style =
            document.getElementById(
                "style"
            ).value;

        const requirements =
            document.getElementById(
                "requirements"
            ).value.trim();


        /* VALIDATION */

        if (!propertySize) {

            alert(
                "Please select the property size."
            );

            return;
        }

        if (!floors) {

            alert(
                "Please select the number of floors."
            );

            return;
        }

        if (!bedrooms) {

            alert(
                "Please select the number of bedrooms."
            );

            return;
        }

        if (!bathrooms) {

            alert(
                "Please select the number of bathrooms."
            );

            return;
        }

        if (!parking) {

            alert(
                "Please select the parking requirement."
            );

            return;
        }

        if (!style) {

            alert(
                "Please select an architectural style."
            );

            return;
        }


        /* LOADING */

        loading.classList.remove("hidden");

        result.classList.add("hidden");

        generateButton.disabled = true;

        generateButton.style.opacity =
            "0.55";


        const projectData = {

            propertySize,
            floors,
            bedrooms,
            bathrooms,
            kitchens,
            parking,
            style,

            additionalRequirements:
                requirements

        };


        try {

            const response =
                await fetch(
                    "https://ai-architecture-backend.vercel.app/api/generate-architecture",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                projectData
                            )
                    }
                );


            let data;

            try {

                data =
                    await response.json();

            } catch {

                throw new Error(
                    "The backend did not return valid JSON."
                );

            }


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Architecture generation failed."
                );

            }


            resultContent.textContent =
                data.response ||
                data.result ||
                "No architectural result was returned.";


            result.classList.remove(
                "hidden"
            );


            result.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


        } catch (error) {

            console.error(
                "Generation Error:",
                error
            );


            alert(
                "AI generation failed.\n\n" +
                error.message +
                "\n\n" +
                "If you see a 429 quota error, your Gemini API quota has been exceeded."
            );

        } finally {

            loading.classList.add("hidden");

            generateButton.disabled = false;

            generateButton.style.opacity =
                "1";

        }

    }


    /* =====================================================
       COPY RESULT
    ===================================================== */

    if (copyResult) {

        copyResult.addEventListener(
            "click",
            async () => {

                const text =
                    resultContent.textContent;

                if (!text) return;


                try {

                    await navigator.clipboard.writeText(
                        text
                    );

                    copyResult.innerHTML =
                        '<i class="fa-solid fa-check"></i> Copied';

                    setTimeout(() => {

                        copyResult.innerHTML =
                            '<i class="fa-regular fa-copy"></i> Copy';

                    }, 1500);

                } catch {

                    alert(
                        "Could not copy the result."
                    );

                }

            }
        );

    }


    /* =====================================================
       CONTACT FORM
    ===================================================== */

    const contactForm =
        document.getElementById(
            "contactForm"
        );


    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const name =
                    document.getElementById(
                        "contactName"
                    ).value.trim();

                const email =
                    document.getElementById(
                        "contactEmail"
                    ).value.trim();

                const message =
                    document.getElementById(
                        "contactMessage"
                    ).value.trim();


                if (
                    !name ||
                    !email ||
                    !message
                ) {

                    alert(
                        "Please complete all fields."
                    );

                    return;

                }


                alert(
                    "Thank you, " +
                    name +
                    ". Your message has been prepared successfully."
                );


                contactForm.reset();

            }
        );

    }


    /* =====================================================
       START APPLICATION
    ===================================================== */

    openPage("dashboard");

});