/**
 * @author Pearl CHen
 * Handles music and theme changes across pages, and all in-game actions of the dino-game
 */

(function () {
    "use strict";
    const POST_SCORE_BASE_URL = "/updateScore";

    // Game mechanics constants
    const JUMP_COOLDOWN_MS = 700; // Time in MS, double the time in game-styles.css to jump up
    const TOTAL_GAME_TIME_MS = 120000;
    const NUM_OBSTACLE_PER_RATE = 5; // Pretty much arbitrary, but default is 30 obstacles in 2 min.
    const BUFFER_TIME_BEFORE_GAME_ENDS_MS = 2000; // The time between the last obstacle and the goal
    const COLLISION_LENIENCY_PX = 20;
    const SCORE_IF_REACH_GOAL = 500;

    /**
     * Calculates the time interval between each score increment by 1, default for rate=6 gives 100.
     * @param {Number} obstacleRate - the user selected obstacle rate among 0, 2, 4, 6, 8, 10
     * @returns {Number} - the time interval of the period calculated
     */
    const SCORE_INCREMENT_PERIOD_MS_FUNCTION = (obstacleRate) => {
        return 6300 / (obstacleRate * 10 + 3);
    };

    // Images
    const IMG_PATH = "media/environment/";
    const BTN_PATH = "media/buttons/";
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
    let timerId = null;
    let obstacleGenTimeOutId = null;
    let secondsRemaining;

    function init() {
        qs("#create-button").addEventListener("click", showCreateChar);
        addEventListenerToAll(".start-game-button", "click", initGame);
        addEventListenerToAll(".back-button", "click", showWelcome);
    }

    function initGame() {
        pauseAllSlidingAnimation();
        window.addEventListener("keydown", avatarControl);
        gameOver = false;

        // Initial score and timer
        qs("#score-count").textContent = 0;
        secondsRemaining = TOTAL_GAME_TIME_MS / 1000;
        displayTime();

        // Show start message
        qs("#game-start-msg").classList.remove("hidden");

        // Shows the view of the game, but every sliding animation paused
        openGame();
    }

    /**
     * Starts moving everything in the game, and collision listeners and obstacle timers start
     */
    function startGame() {
        // Clear obstacles from previous games, if any
        qs("#obstacles").innerHTML = "";

        // Lock menu obstacle rate slider
        qs("#obstacle-rate-input").disabled = true;
        qs("#obstacle-rate").textContent = "Can't change in game!";

        // Hide start message, to be shown again in the same session later
        qs("#game-start-msg").classList.add("hidden");

        pauseAllSlidingAnimation(false, false);
        // Reset the goal in case we came from a previous game
        qs(".goal").classList.remove("sliding-layer");
        generateMap(0);
        collisionTimerId = setInterval(handleCollision, 1000 / FRAME_RATE_FPS);

        // Increment interval is set so that default is 100, and is 2.1 seconds with no obstacles
        const scoreIncrementPeriodMS = SCORE_INCREMENT_PERIOD_MS_FUNCTION(
            qs("#obstacle-rate-input").value
        );
        scoreTimerId = setInterval(() => {
            qs("#score-count").textContent++;
        }, scoreIncrementPeriodMS);

        startTimer();
    }

    /**
     * Starts the timer for a new game. No return value.
     */
    function startTimer() {
        advanceTimer();
        timerId = setInterval(advanceTimer, 1000);
    }

    /**
     * Displays timer view for MM:SS in the timer text content
     */
    function displayTime() {
        // Calculating timer view for MM:SS
        let minutes = Math.floor(secondsRemaining / 60);
        let seconds = secondsRemaining % 60;

        // Make <= 2 digits
        let secPrefix = seconds < 10 ? "0" : "";
        seconds = secPrefix + seconds;

        // Display time
        qs("#time-left").textContent = minutes + ":" + seconds;
    }

    /**
     * Updates the game timer (module global and #time shown on page) by 1 second. No return value.
     */
    function advanceTimer() {
        // Update module global variable
        secondsRemaining--;
        displayTime();

        // Check time remaining is not negative (checked immediately after displaying text)
        if (secondsRemaining === 0) {
            clearInterval(timerId);
        }
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
     * Makes a POST request to post user score
     */
    async function postScore() {
        const userScore = parseInt(qs("#score-count").textContent);
        let data = JSON.stringify({ score: userScore });
        try {
            let resp = await fetch(POST_SCORE_BASE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: data,
            });
            resp = await checkStatus(resp);
            let user = await resp.json();

            // Update user profile high score info
            qs("#curr-high-score").textContent = user.high_score;

            // Forgive meeeee ahh I just didn't want to code another HTML popup element and set timer
            // Yes this is just to display the message
            throw Error(`Score saved for ${user.username}. Your record is ${user.high_score}!`);
        } catch (err) {
            handleError(err.message);
        }
    }

    /**
     * Handles the event of game over
     * @param {boolean} won - whether the player cleared the game
     */
    function endGame(won) {
        gameOver = true;
        postScore();

        // Unlock obstacle rate slider in menu
        qs("#obstacle-rate-input").disabled = false;
        qs("#obstacle-rate").textContent = qs("#obstacle-rate-input").value;

        // Reset timers
        clearInterval(collisionTimerId); // Stop the collision checker timer
        clearInterval(scoreTimerId);
        clearInterval(timerId);
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
                // I cannot figure this out for the life of me
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
            qs("#score-count").textContent =
                parseInt(qs("#score-count").textContent) + SCORE_IF_REACH_GOAL;
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
            qs("#menu-button").src = BTN_PATH + "red-menu-button.png";
            qs("#music-toggle").classList.add("red");
        } else {
            qs("#menu-button").src = BTN_PATH + "menu-button.png";
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
        qs("#obstacles").appendChild(newObstacle);

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
     * @param {Number} gameTimePassedMS - the total time in MS that has passed since starting game
     */
    function generateMap(gameTimePassedMS) {
        let numObstacles = qs("#obstacle-rate-input").value * NUM_OBSTACLE_PER_RATE;

        // Minimum and maximum time in MS between each obstacle
        let obstacleMinTimeGapMS = (TOTAL_GAME_TIME_MS / numObstacles) * 0.5;
        let obstacleMaxTimeGapMS = (TOTAL_GAME_TIME_MS / numObstacles) * 1.5;

        // Genearate random time gap
        let obstacleTimeGapMS =
            Math.floor(Math.random() * (obstacleMaxTimeGapMS - obstacleMinTimeGapMS)) +
            obstacleMinTimeGapMS;

        // Recursion to generate obstacles with time gap
        if (qs("#obstacle-count").textContent > 0) {
            generateObstacle();
            obstacleGenTimeOutId = setTimeout(() => {
                generateMap(gameTimePassedMS + obstacleTimeGapMS);
            }, obstacleTimeGapMS);
        } else if (!gameOver) {
            // Start sliding the final goal/finish line after the obstacles
            const gameTimeRemainingMS = TOTAL_GAME_TIME_MS - gameTimePassedMS; // Approximate
            const timeUntilGoalMS = Math.max(BUFFER_TIME_BEFORE_GAME_ENDS_MS, gameTimeRemainingMS);
            setTimeout(() => {
                qs(".goal").classList.add("sliding-layer");
            }, timeUntilGoalMS);
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
