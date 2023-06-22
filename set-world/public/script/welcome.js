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
    addEventListenerToAll(".close-button", "click", dismissParent);
    qs("#submit-login").addEventListener("click", loginSendCookie);
    qs("#show-flex").addEventListener("click", flex);

    // Obstacle rate range sliders in menu
    qs("#obstacle-rate-input").addEventListener("input", (e) => {
      displayInput(e, "#obstacle-rate");

      // Initial obstacle count text in game
      const numObstacles = qs("#obstacle-rate-input").value * 5; // Pretty much arbitrary, by exp.
      qs("#obstacle-count").textContent = numObstacles;
    });
  }

  /**
   * REF: http://eipsum.github.io/cs132/lectures/lec19-cs-wrapup-and-cookies/code/cookie-demo.zip
   * Validates the login credentials, and makes a request to create/update a cookie with the logged
   * in user as "curr_user".
   */
  async function loginSendCookie() {
    // Frontend validation
    if (!(qs("#login-pw").checkValidity() && qs("#login-username").checkValidity())) {
      qs("#login-pw").reportValidity();
      qs("#login-username").reportValidity();
      return;
    }

    // Login fetch cookies!
    let params = new FormData(qs("#login-window form"));
    try {
      let resp = await fetch(`/login`, { method: "GET", headers: params });
      resp = await checkStatus(resp);
      let userInfo = await resp.json();

      // Update in-game avatar
      qsa(".avatar").forEach((img) => {
        img.src = userInfo.image_path;
        img.alt = userInfo.username;
      });

      // Update user info page
      qs("#curr-username").textContent = userInfo.username;
      qs("#curr-high-score").textContent = userInfo.high_score;
      qs("#curr-friends").textContent = userInfo.friends.join(", ");

      // Show welcome message
      qs("#login-success p").textContent = `Welcome, ${userInfo.username}!`;
      qs("#login-window").classList.add("hidden");
      qs("#login-success").classList.remove("hidden");

      // Change home page buttons to replace login/create/guest with start game
      qs("#home-buttons-before-login").classList.add("hidden");
      qs("#home-buttons-after-login").classList.remove("hidden");
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Joke feature to flex that I did all the art by un-hidden-ing a popup
   */
  function flex() {
    qs("#menu").classList.add("hidden");
    qs("#flex").classList.remove("hidden");
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
   * Displays the value in a range slider input element
   * @param {Event} e - the slider event
   * @param {String} value - CSS query selector string for where value is displayed
   */
  function displayInput(e, value) {
    const val = qs(value);
    val.textContent = e.target.value;
  }

  /**
   * Hides the parent window, usually a pop up
   */
  function dismissParent() {
    this.parentNode.classList.add("hidden");
  }

  init();
})();
