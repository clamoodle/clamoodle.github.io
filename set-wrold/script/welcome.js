/**
 * @author Pearl Chen
 * Welcome page event handlers/animations, also handles the sound toggle/menu button in header
 */

(function () {
    "use strict";

    function init() {
        qs("#music-button").addEventListener("click", showWelcomeWithMusic);
        qs("#mute-button").addEventListener("click", showWelcome);
        qs("#music-toggle").addEventListener("click", toggleMusic);
        qs("#login-button").addEventListener("click", showLogin);
        qs("#menu-button").addEventListener("click", showMenu);
    }

    /**
     * Shows the welcome title screen not playing music
     */
    function showWelcome() {
        hideAll("main>section"); // clears all page views in index.html
        showView("#welcome-view");
    }

    /**
     * Shows the welcome title screen with music playing
     */
    function showWelcomeWithMusic() {
        // Default music is muted upon page first loading
        qs("#music").currentTime = 0;
        toggleMusic();
        showWelcome();
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

    /**
     * Shows the login form transluscently overlaying the screen, with start game button
     */
    function showLogin() {
        showView("#login-window");
    }

    /**
     * Shows the menu from the menu button in header, currently has nothing init
     */
    function showMenu() {
        qs("#popup-msg").textContent =
            "Menu still underconstruction :( Hopefully more features coming soon!";
        qs("#popup-window").classList.remove("hidden");
    }

    init();
})();
