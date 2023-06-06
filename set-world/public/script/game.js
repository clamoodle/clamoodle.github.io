/**
 * @author Pearl CHen
 * Handles music and theme changes across pages, and all in-game actions of the dino-game
 */

(function () {
    "use strict";
    const JUMP_COOLDOWN_MS = 700; // Time in MS, double the time in game-styles.css to jump up

    // Obstacle constants
    const NUM_OBSTACLES = 30;
    const BUFFER_TIME_BEFORE_GAME_ENDS_MS = 2000; // The time between the last obstacle and the goal
    const COLLISION_LENIENCY_PX = 20;
    // The amount that the avatar is pushed back by undodged obstacle in ratio to lvw (e.g. 0.1)
    const PENALTY_SETBACK = 0.1;
    // Minimum and maximum time in MS between each obstacle
    const OBSTACLE_MIN_TIME_GAP_MS = 3000;
    const OBSTACLE_MAX_TIME_GAP_MS = 10000;

    const SCORE_INCREMENT_INTERVAL_MS = 100;
    const SCORE_IF_REACH_GOAL = 300;

    // Images
    const IMG_PATH = "media/";
    const OBSTALCE_IMGS = ["diamond-obstacle.png", "oval-obstacle.png", "squiggle-obstacle.png"];

    // Songs
    const MUSIC_PATH = "media/";
    const WELCOME_SONG = "genius-soft-adventurous-theme.wav";
    const IN_GAME_SONG = "in-game-tense.wav";
    const GAME_END_SONG = "silly-tune.wav";
    const CREATE_SONG = "calm-genius-silly-theme.wav";

    // Frame rate of browser CSS animation, <=60 according to mdn:
    // https://developer.mozilla.org/en-US/docs/Web/Performance/Animation_performance_and_frame_rate
    const FRAME_RATE_FPS = 60;

    let gameOver = false;
    let collisionTimerId = null;
    let scoreTimerId = null;
    let obstacleGenTimeOutId = null;

    function init() {
        qs("#create-button").addEventListener("click", showCreateChar);
        addEventListenerToAll(".start-game-button", "click", initGame);
        addEventListenerToAll(".back-button", "click", showWelcome);
    }

    function initGame() {
        pauseAllSlidingAnimation();
        window.addEventListener("keydown", avatarControl);
        gameOver = false;

        // Initial obstacle count text
        qs("#obstacle-count").textContent = NUM_OBSTACLES;

        // Initial score
        qs("#score-count > span").textContent = 0;

        // Show start message
        qs("#game-start-msg").classList.remove("hidden");

        // Shows the view of the game, but every sliding animation paused
        openGame();
    }

    /**
     * Starts moving everything in the game, and collision listeners and obstacle timers start
     */
    function startGame() {
        // Hide start message, to be shown again in the same session later
        qs("#game-start-msg").classList.add("hidden");

        pauseAllSlidingAnimation(false, false);
        // Reset the goal in case we came from a previous game
        qs(".goal").classList.remove("sliding-layer");
        generateMap();
        collisionTimerId = setInterval(handleCollision, 1000 / FRAME_RATE_FPS);
        scoreTimerId = setInterval(() => {
            qs("#score-count > span").textContent++;
        }, SCORE_INCREMENT_INTERVAL_MS);
    }

    /**
     * Shows the character creation screen
     */
    function showCreateChar() {
        hideAll("main>section"); // Clears all page views in index.html
        showView("#char-creation-view");
        changeMusic(CREATE_SONG);
    }

    /**
     * Handles keyboard events and avatar control (currently just space/up to start and jump)
     */
    function avatarControl(e) {
        let avatar = qs("#avatar");
        switch (e.keyCode) {
            case 38:
            case 32: // Up or space key respectively
                // Jumping case
                jump(avatar);

                // To start game with first keydown if not yet tracking collisions
                if (!collisionTimerId && !gameOver) {
                    startGame();
                }
        }
    }

    /**
     * Makes whoever the target is jump up and land down by adding and removing the jump class
     * @param {object} target
     */
    function jump(target) {
        if (!target.classList.contains("jump")) {
            target.classList.add("jump");
        }
        setTimeout(() => {
            target.classList.remove("jump");
        }, JUMP_COOLDOWN_MS);
    }

    /**
     * Determines whether 2 bodies are colliding.
     * Define collision here by: (both obstacles & goal)
     * When the left-most point of the obstacle is half-way across the avatar in the x-direction
     * we have a collision if the bottom-most point of the avatar is below the top-most point
     * of the obstacle
     * @param {object} avatar - DOM element of one avatar whose collisions we track
     * @param {object} target - DOM element of one target to check collisions against
     * @returns {boolean} - whether the avatar and the target are colliding
     */
    function isColliding(avatar, target) {
        if (!target) {
            return false;
        }

        // Getting avatar left, width, and bottom
        // Source: https://stackoverflow.com/questions/2440377/javascript-collision-detection
        let avatarRect = avatar.getBoundingClientRect();
        // Getting obstacle left and top coordinates
        let obstacleRect = target.getBoundingClientRect();

        // Note all coordinates here are x, y based on the top-left of window being the origin
        if (
            obstacleRect.left <= avatarRect.left + avatarRect.width / 2 &&
            obstacleRect.left >= avatarRect.left && // Between midpoint and left of avatar
            avatarRect.bottom > obstacleRect.top + COLLISION_LENIENCY_PX
        ) {
            return true;
        }
    }

    /**
     * Handles the event of game over
     * @param {boolean} won - whether the player cleared the game
     */
    function endGame(won) {
        gameOver = true;
        clearInterval(collisionTimerId); // Stop the collision checker timer
        clearInterval(scoreTimerId);
        clearTimeout(obstacleGenTimeOutId); // Stop generating obstacles
        collisionTimerId = null; // Reset for checking game start next time
        scoreTimerId = null;

        // Unselect selected cards
        qsa(".selected").forEach((card) => {
            card.classList.remove("selected");
        });

        // Disable card selection, removing event listeners from set.js
        // Source: https://stackoverflow.com/questions/9251837/how-to-remove-all-listeners-in-an-element
        // Clone elements don't have event listeners
        qsa(".card").forEach((card) => {
            let clone_card = card.cloneNode(true);
            card.replaceWith(clone_card);
        });

        // Message & music
        if (won) {
            changeMusic(GAME_END_SONG);
        }
        qs("#popup-msg").textContent = won ? "You reached the goal! Yayayy!" : "Game over!";
        qs("#popup-window").classList.remove("hidden");
    }

    /**
     * Collision handler
     * - penalties when hit obstacle
     * - wins game when hit goal
     */
    function handleCollision() {
        const avatar = qs("#avatar");
        // Source: https://stackoverflow.com/questions/1248081/how-to-get-the-browser-viewport-dimensions
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

        // Checking collisions for each obstacle
        qsa(".obstacle").forEach((element) => {
            if (isColliding(avatar, element)) {
                // // Push avatar back by 10 lvw
                // let left = avatar.getBoundingClientRect.left - PENALTY_SETBACK * vw;
                // avatar.style.left = left + 'px';
                // console.log("colliding!");

                pauseAllSlidingAnimation();
                endGame(false);
                /**
                 * Collision handling TODO:
                 * invincible function: flash avatar, no collisions
                 * also gets pushed back
                 * game over when against the left edge of viewport
                 */
            }
        });

        // Wins game if collides with goal!
        if (isColliding(avatar, qs(".goal"))) {
            qs("#score-count > span").textContent =
                parseInt(qs("#score-count > span").textContent) + SCORE_IF_REACH_GOAL;
            pauseAllSlidingAnimation();
            endGame(true);
        }
    }

    /**
     * Pause or unpause all sliding animation
     * @param {boolean} pause - whether we true: want to pause, or false: want to run all of them
     * @param {boolean} pauseAvatar - whether we want to pause our lil' avatar as well
     */
    function pauseAllSlidingAnimation(pause = true, pauseAvatar = true) {
        let slideState = pause ? "paused" : "running";
        let avatarState = pauseAvatar ? "paused" : "running";
        qsa(".sliding-layer").forEach((element) => {
            element.style.animationPlayState = slideState;
        });
        qs("#avatar").style.animationPlayState = avatarState;
    }

    /**
     * Changes the color of header icons between views
     * @param {boolean} inGame - whether we want red in-game header colors or not
     */
    function changeHeaderColor(inGame) {
        if (inGame) {
            qs("#menu-button").src = IMG_PATH + "red-menu-button.png";
            qs("#music-toggle").classList.add("red");
        } else {
            qs("#menu-button").src = IMG_PATH + "menu-button.png";
            qs("#music-toggle").classList.remove("red");
        }
    }

    /**
     * Changes the background track
     * @param {string} song - the pile path to the audio file we wish to play
     */
    function changeMusic(song) {
        let music = qs("#music");

        // Checking for not playing the same track again if we're on the same page
        // Slicing for getting rid of "index.html?"
        if (
            music.src ===
            window.location.href.slice(0, -"index.html?".length) + MUSIC_PATH + song
        ) {
            return;
        }

        music.src = MUSIC_PATH + song;
        if (!qs("#music-toggle").classList.contains("muted")) {
            music.play();
        }

        // silly-tune.wav is a bit loud :,D
        if (song === "silly-tune.wav") {
            music.volume = 0.5;
        } else {
            music.volume = 1;
        }
    }

    function showWelcome() {
        hideAll("main>section"); // Clears all page views in index.html
        showView("#welcome-view");

        changeHeaderColor(false);
        changeMusic(WELCOME_SONG);
        pauseAllSlidingAnimation(false, false);
    }

    // Generating obstacles sliding across the screen
    function generateObstacle() {
        if (gameOver || qs("#obstacle-count").textContent === 0) {
            return;
        }

        // Generate new obstacle img node with random src
        let randomIdx = Math.floor(Math.random() * OBSTALCE_IMGS.length);
        const newObstacle = gen("img");
        newObstacle.src = IMG_PATH + OBSTALCE_IMGS[randomIdx];
        newObstacle.classList.add("obstacle", "sliding-layer");
        newObstacle.alt = OBSTALCE_IMGS[randomIdx].replace("-", " ").slice(0, -".png".length);
        qs("#dino-game").appendChild(newObstacle);

        // Update obstacle count
        qs("#obstacle-count").textContent--;

        // Remove them once outside of the viewport
        newObstacle.addEventListener("animationend", () => {
            newObstacle.remove();
        });
    }

    /**
     * Generate obstacles with random time intervals between them and the goal at the end
     * Recursive to generate obstacles one after another
     */
    function generateMap() {
        generateObstacle();

        // Genearate random time gap
        let obstacleTimeGapMS =
            Math.floor(Math.random() * (OBSTACLE_MAX_TIME_GAP_MS - OBSTACLE_MIN_TIME_GAP_MS)) +
            OBSTACLE_MIN_TIME_GAP_MS;

        // Recursion
        if (qs("#obstacle-count").textContent > 0) {
            obstacleGenTimeOutId = setTimeout(generateMap, obstacleTimeGapMS);
        } else if (!gameOver) {
            // Start sliding the final goal/finish line after the obstacles
            setTimeout(() => {
                qs(".goal").classList.add("sliding-layer");
            }, BUFFER_TIME_BEFORE_GAME_ENDS_MS);
        }
    }

    function openGame() {
        hideAll("main>section"); // Clears all page views in index.html
        changeMusic(IN_GAME_SONG);
        changeHeaderColor(true);
        showView("#dino-game");
    }

    init();
})();
