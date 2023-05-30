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
        qs("#add-friends-button").addEventListener("click", showFriends);
        qs("#show-leaderboard").addEventListener("click", showLeaderboard);
        addEventListenerToAll("#user-icons > article", "click", toggleUserInfoView);
        qs("#back-to-friends").addEventListener("click", toggleUserInfoView);
        qs("#send-message").addEventListener("click", openMessenger);
        addEventListenerToAll(".close-button", "click", dismissParent);
    }

    /**
     * Shows the welcome title screen not playing music
     */
    function showWelcome() {
        hideAll("main>section"); // clears all page views in index.html
        showView("#welcome-view");
        showView("header");
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
        qs("#menu").classList.remove("hidden");
    }

    /**
     * Hides the parent window, usually a pop up
     */
    function dismissParent() {
        this.parentNode.classList.add("hidden");
    }

    /**
     * Shows all friends / users view for user to add friends
     */
    function showFriends() {
        hideAll(".popup");
        qs("#add-friends-page").classList.remove("hidden");
        
        hideAll("#add-friends-page > section");
        qs("#users-list").classList.remove("hidden");
    }

    /**
     * Shows the specific info for one user in the friends popup window
     */
    function toggleUserInfoView() {
        qs("#users-list").classList.toggle("hidden");
        qs("#user-info").classList.toggle("hidden");
    }

    /**
     * Shows the messenger platform in a popup
     */
    function openMessenger() {
        qs("#user-info").classList.add("hidden");
        qs("#messenger").classList.remove("hidden");
    }

    /**
     * Shows the leaderboard window popup
     */
    function showLeaderboard() {
        hideAll(".popup");
        qs("#leaderboard").classList.remove("hidden");
    }

    init();
})();
