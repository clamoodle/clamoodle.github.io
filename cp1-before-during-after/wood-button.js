/**
 * Handles all wood picture switching in bred.html
 */

(function () {
    "use strict";
    const SAWED_PIC = "imgs/sawed wood.jpg";
    const BUTTON = document.querySelector("button");

    let isSawed = false;

    /**
     * Adds all event listners
     */
    function init() {
        BUTTON.addEventListener("click", switchWood);
    }

    /**
     * Changes the image displayed
     */
    function switchWood() {
        const woodImage = document.querySelector("img");
        if (!isSawed) {
            woodImage.src = SAWED_PIC;
            woodImage.alt = "two smaller pieces of wood";
            BUTTON.textContent = "BACK";
            isSawed = true;
        } else {
            window.location.href = "index.html";
        }
    }

    init();
})();
