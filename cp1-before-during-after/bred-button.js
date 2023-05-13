/**
 * Handles all bread switching in bred.html
 */

(function () {
    "use strict";

    // Source: Bread Alone Bakery
    const BRED_PIC =
        "https://images.squarespace-cdn.com/content/v1/54ff1158e4b0a76e3a904b6c/1435689618959-LB3VMMDWEIY4DCRD69BT/image-asset.png";
    // Source: RecipeTips.com
    const KNEAD_PIC =
        "https://files.recipetips.com/images/glossary/k/knead.jpg";
    // Source: StickPNG
    const SLICE_PIC =
        "https://assets.stickpng.com/images/580b57fbd9996e24bc43c0af.png";

    const BUTTON = document.querySelector("button");

    let bredState = 0;

    /**
     * Adds all event listeners
     */
    function init() {
        BUTTON.addEventListener("click", switchBread);
    }

    /**
     * Changes the image of the bread displayed
     */
    function switchBread() {
        const bredImage = document.querySelector("img");
        if (bredState === 0) {
            bredImage.src = KNEAD_PIC;
            bredImage.addEventListener('load', );
            BUTTON.textContent = "BAKE";
        } else if (bredState === 1) {
            bredImage.src = BRED_PIC;
            bredImage.alt = "bred";
            BUTTON.textContent = "SLICE";
        } else if (bredState === 2) {
            bredImage.src = SLICE_PIC;
            bredImage.alt = "sliced bred";
            BUTTON.textContent = "BACK";
        } else {
            window.location.href = "index.html";
        }
        bredState++;
    }

    init();
})();
