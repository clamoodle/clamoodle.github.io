"use strict";

(function () {
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
            showView("#card-view");
            hideView("#landing-view");
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

    init();
})();
