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
  const KEY_TO_CARD_IDX = {
    KeyQ: 1,
    KeyW: 2,
    KeyE: 3,
    KeyR: 4,
    KeyA: 5,
    KeyS: 6,
    KeyD: 7,
    KeyF: 8,
    KeyZ: 9,
    KeyX: 10,
    KeyC: 11,
    KeyV: 12,
  };

  const SCORE_PER_SET = 200;
  const PENALTY_PER_REFRESH = 10;

  const IMG_PATH = "media/set-cards/";

  // Boolean checking whether the game started
  // (if not we don't want to refresh board, select cards, etc)
  let playing;

  /**
   * Initializes all eventlisteners to be added to elements in the page
   */
  function init() {
    addEventListenerToAll(".start-game-button", "click", startGame);
  }

  /**
   * Handles all events that happen when a game is supposed to start
   */
  function startGame() {
    playing = false; // Waiting until space is pressed

    // Remove previous cards if any
    while (qs("#board .card")) {
      qs("#board").removeChild(qs("#board .card"));
    }

    // Generate cards on the board
    for (let i = 0; i < NUM_CARDS_IN_BOARD; i++) {
      let card = generateUniqueCard();
      qs("#board").appendChild(card);
    }
    if (!ExistSetOnBoard()) {
      refreshBoard();
    }

    // Keyboard card select event listener
    window.addEventListener("keydown", keyboardCardSelect);
  }

  /**
   * Changes all the current cards on the board. Gives a timer penalty if there is a set there.
   */
  function refreshBoard() {
    // Re-generate cards on the board
    qsa(".card:not(.hide_imgs)").forEach((card) => {
      card.replaceWith(generateUniqueCard());
    });

    // Guarantees set on board upon refresh
    if (!ExistSetOnBoard()) {
      refreshBoard();
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

  function keyboardCardSelect(e) {
    // Checking game over (to 'remove' listener) from end game popup from game.js
    if (!qs("#popup-window").classList.contains("hidden")) {
      return;
    }

    if (e.code in KEY_TO_CARD_IDX && playing) {
      const idx = KEY_TO_CARD_IDX[e.code];
      const card = qs(".card:nth-child(" + idx + ")");
      keyboardCardSelected(card);
      return;
    }

    switch (e.code) {
      case "Space":
        if (!playing) {
          playing = true;
        }
        break;
      case "KeyG":
        if (playing) {
          refreshBoard();
          qs("#score-count").textContent =
            parseInt(qs("#score-count").textContent) - PENALTY_PER_REFRESH;
        }
        break;
    }
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
   * Different from HW2, we don't display 'not a set' message
   * @param {boolean} isSet - whether the selected cards make a set
   * @param {DOMList} selectedCards - A DOM list of 3 properly generated card div elements that
   * are selected.
   */
  function handleSelectedCards(isSet, selectedCards) {
    let message = "SET!";

    selectedCards.forEach((card) => {
      // Unselecting card after a tiny bit (so that selected cards show)
      setTimeout(() => {
        card.classList.remove("selected");
      }, 100);

      if (isSet) {
        // Hide images in card
        card.classList.add("hide-imgs");

        // Show message
        let messageNode = gen("p");
        messageNode.textContent = message;
        card.appendChild(messageNode);
      }
    });

    if (isSet) {
      // Increment score!
      const score = qs("#score-count");
      score.textContent = parseInt(score.textContent) + SCORE_PER_SET;

      // After 0.5 second replacing cards if set found
      setTimeout(() => {
        selectedCards.forEach((card) => {
          card.replaceWith(generateUniqueCard());
        });
        // Refreshes the board if there are no sets (guarantees set on board)
        if (!ExistSetOnBoard()) {
          refreshBoard();
        }
      }, 500);
    }
  }

  /**
   * Used when a card is selected by clicking, toggles style and checking selected cards using
   * checkSelectedCards().
   */
  function cardSelected() {
    this.classList.toggle("selected");
    checkSelectedCards();
  }

  /**
   * Used when a card is selected by keyboard, toggles style and checking selected cards using
   * checkSelectedCards(). Separate function from click since e.target for clicks cause lags.
   * @param {object} - DOM object associated with the card we want to be selecting
   */
  function keyboardCardSelected(card) {
    card.classList.toggle("selected");
    checkSelectedCards();
  }

  /**
   * Checking how many cards are currently selected. If 3 cards are
   * selected, uses isASet to handle "correct" and "incorrect" cases. No return value.
   */
  function checkSelectedCards() {
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
            // Hacking my own game!
            console.log(i, j, k);
            return true;
          }
        }
      }
    }
    return false;
  }

  init();
})();
