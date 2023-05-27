/**
 * @author Pearl Chen
 * Set game event handlers!
 */

(function () {
    "use strict";
    const STYLES = ["solid", "outline", "striped"];
    const COLORS = ["green", "purple", "red"];
    const SHAPES = ["diamond", "oval", "squiggle"];
    const COUNTS = [1, 2, 3];
    const ATTRIBUTES = [STYLES, SHAPES, COLORS, COUNTS];
    const NUM_CARDS_IN_BOARD = 12;

    const IMG_PATH = "media/set-cards/";

    /**
     * Initializes all eventlisteners to be added to elements in the page
     */
    function init() {
        addEventListenerToAll(".start-game-button", "click", startGame);
        startGame();
    }

    /**
     * Handles all events that happen when a game is supposed to start
     */
    function startGame() {
        // Remove previous cards if any
        while (qs("#board .card")) {
            qs("#board").removeChild(qs("#board .card"));
        }

        // Generate cards on the board
        for (let i = 0; i < NUM_CARDS_IN_BOARD; i++) {
            let card = generateUniqueCard();
            qs("#board").appendChild(card);
        }
    }

    /**
     * Changes all the current cards on the board. Gives a timer penalty if there is a set there.
     */
    function refreshBoard() {
        // Re-generate cards on the board
        qsa(".card:not(.hide_imgs)").forEach((card) => {
            card.replaceWith(generateUniqueCard());
        });
    }

    /**
     * Handles all events that happen after a game ends
     */
    function endGame() {
        // Unselect selected cards
        qsa(".selected").forEach((card) => {
            card.classList.remove("selected");
        });

        // Disable card selection
        qsa(".card").forEach((card) => {
            card.removeEventListener("click", cardSelected);
        });

        // Disable refresh button
        qs("#refresh-btn").disabled = true;

        clearInterval(timerId);
        timerId = null;
    }

    /**
     * Displays timer view for MM:SS in the timer text content
     */
    function displayTime() {
        // Calculating timer view for MM:SS
        let minutes = Math.floor(secondsRemaining / 60);
        let seconds = secondsRemaining % 60;

        // Make <= 2 digits
        let minPrefix = minutes < 10 ? "0" : "";
        let secPrefix = seconds < 10 ? "0" : "";
        minutes = minPrefix + minutes;
        seconds = secPrefix + seconds;

        // Display time
        qs("#time").textContent = minutes + ":" + seconds;
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
            endGame();
        }
    }

    /**
     * Returns a randomly-generated array of string attributes in the form [STYLE, SHAPE, COLOR,
     * COUNT], in that order for testing purposes
     * @param {boolean} isEasy - if true, the style attribute (1 of the 4 card attributes) should
     *      always be "solid", otherwise the style attribute should be randomly selected from
     *      ("outline", "solid", or "striped").
     * @returns {array} an array of string attributes in the form [STYLE, SHAPE, COLOR, COUNT]
     */
    function generateRandomAttributes() {
        let attributeOptions = [];

        for (let i = 0; i < ATTRIBUTES.length; i++) {
            const attribute = ATTRIBUTES[i];

            let randomIdx = Math.floor(Math.random() * attribute.length);
            let randomOption = attribute[randomIdx];
            attributeOptions.push(randomOption);
        }

        return attributeOptions;
    }

    /**
     * Returns a div element with COUNT number of img elements appended as children, such that it is
     * nique from any other card attribute set on the board
     * @param {boolean} isEasy - if true, the style of the card will always be solid, otherwise
     * each of the three possible styles is equally likely
     * @returns {object} - a div element with COUNT number of img elements appended as children
     */
    function generateUniqueCard() {
        let attributes;
        let cardId;

        // Keep generating until there's no card in #board with the same id
        let duplicates = true;
        while (duplicates) {
            attributes = generateRandomAttributes();
            cardId = attributes.join("-");
            duplicates = qs("#board " + "#" + cardId) !== null;
        }

        let count = attributes[3];
        let imgSrc = IMG_PATH + attributes.slice(0, 3).join("-") + ".png";
        let card = gen("div");
        card.classList.add("card"); // For styling
        card.setAttribute("id", cardId);
        card.addEventListener("click", cardSelected);

        // Appending the child images COUNT times
        for (let i = 0; i < count; i++) {
            let image = gen("img");
            image.src = imgSrc;
            image.alt = cardId;
            card.appendChild(image);
        }

        return card;
    }

    /**
     * Returns a boolean value based on whether a given list of 3 cards comprises a Set.
     * @param {DOMList} selectedCards - A DOM list of 3 properly generated card div elements that
     * are selected. These cards should be generated from generateUniqueCard(isEasy) above.
     * @returns {boolean} - whether the cards make a set
     */
    function isASet(selectedCards) {
        let cardsAttributes = [];
        selectedCards.forEach((card) => {
            let attributes = card.id.split("-");
            cardsAttributes.push(attributes);
        });

        // Cycles through each attribute
        for (let i = 0; i < cardsAttributes[0].length; i++) {
            if (
                // If 2 cards are the same, return false if the third is different
                cardsAttributes[0][i] === cardsAttributes[1][i] &&
                cardsAttributes[1][i] !== cardsAttributes[2][i]
            ) {
                return false;
            } else if (
                // If 2 cards are the different, return false if the third is the same as either
                cardsAttributes[0][i] !== cardsAttributes[1][i] &&
                (cardsAttributes[2][i] === cardsAttributes[1][i] ||
                    cardsAttributes[2][i] === cardsAttributes[0][i])
            ) {
                return false;
            }
        }
        return true;
    }

    /**
     * Handles whatever happens to each card after a set of 3 cards are selected
     * @param {boolean} isSet - whether the selected cards make a set
     * @param {DOMList} selectedCards - A DOM list of 3 properly generated card div elements that
     * are selected.
     */
    function handleSelectedCards(isSet, selectedCards) {
        let isEasy = qs("input[name='diff'][value='easy']").checked;

        let message = isSet ? "SET!" : "Not a Set :(";

        selectedCards.forEach((card) => {
            // Unselecting card
            card.classList.remove("selected");

            // Hide images in card
            card.classList.add("hide-imgs");

            // Show message
            let messageNode = gen("p");
            messageNode.textContent = message;
            card.appendChild(messageNode);

            // After 1 second returning to card or replacing with a new card if there was a set
            setTimeout(() => {
                if (isSet) {
                    card.replaceWith(generateUniqueCard(isEasy));
                } else {
                    card.classList.remove("hide-imgs");
                    messageNode.remove();
                }
            }, 1000);
        });
    }

    /**
     * Used when a card is selected, checking how many cards are currently selected. If 3 cards are
     * selected, uses isASet to handle "correct" and "incorrect" cases. No return value.
     */
    function cardSelected() {
        this.classList.toggle("selected");

        let selectedCards = qsa(".selected");
        if (selectedCards.length === 3) {
            if (isASet(selectedCards)) {
                handleSelectedCards(true, selectedCards);

                // Update set count
                // qs("#set-count").textContent++;
            } else {
                handleSelectedCards(false, selectedCards);
            }
        }
    }

    /**
     * Applies the timer penalty by deducting seconds from time remaining until game ends.
     */
    function applyPenalty() {
        if (secondsRemaining > PENALTY_S) {
            secondsRemaining -= PENALTY_S;
        } else {
            secondsRemaining = 0;
            endGame();
        }
        displayTime();
    }

    /**
     * Checks whether there exists sets on the board
     * @returns {boolean} whether there are sets on the board
     */
    function ExistSetOnBoard() {
        let cards = qsa("#board .card");

        for (let i = 0; i < cards.length - 2; i++) {
            for (let j = i + 1; j < cards.length - 1; j++) {
                for (let k = j + 1; k < cards.length; k++) {
                    let selectedCards = [cards[i], cards[j], cards[k]];
                    if (isASet(selectedCards)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    init();
})();
