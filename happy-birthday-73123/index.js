"use strict";

(function () {
    // Rellax scroll speeds in html are made for iPhone 13 Pro Max, with lvh = 2778px.
    const targetLvh = 2778;

    // Accepts any class name
    const rellax = new Rellax(".rellax");

    function init() {
        qs("#check-date").addEventListener("click", checkDate);
        qs("#music-toggle").addEventListener("click", toggleMusic);
    }

    /**
     * Opens the card if the date is 07-31-2023
     */
    function checkDate() {
        const date = qs("#date").value;
        if (date == "2023-07-31") {
            showView("header");
            hideView("#landing-view");
            qs("main").style.backgroundColor = "rgb(18, 19, 31)";
            showView("#card-view");
            updateRellaxSpeed();
            toggleMusic();
        }
    }

    /**
     * Toggles whatever soundtrack is playing in the background and changes button image
     */
    function toggleMusic() {
        let musicToggle = qs("#music-toggle");
        let music = qs("#music");

        if (musicToggle.classList.contains("muted")) {
            // Pauses song and changes button background image to "off" with class change
            musicToggle.classList.remove("muted");
            music.play();
        } else {
            // Plays song and changes button background image to "on" with class change
            musicToggle.classList.add("muted");
            music.pause();
        }
    }

    function updateRellaxSpeed() {
        // Calculate the screen height in pixels per lvh
        const screenHeightInLvh = window.innerHeight;

        // Get all elements with the class "rellax"
        const rellaxElements = document.querySelectorAll(".rellax");

        // Loop through each rellax element and set its speed based on screen height
        for (const element of rellaxElements) {
            // Get the data-rellax-speed attribute value (set in the HTML markup)
            const speed = parseFloat(element.getAttribute("data-rellax-speed"));

            // Calculate the adjusted speed based on screen height (pixels per lvh)
            const scale = (screenHeightInLvh - targetLvh) / targetLvh; // Scroll slower for shorter screens
            const adjustedSpeed = speed + speed * scale;

            // Initialize Rellax for each element with the adjusted speed
            element.setAttribute("data-rellax-speed", adjustedSpeed);
        }
        rellax.refresh();
    }

    init();
})();
