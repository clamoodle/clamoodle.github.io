"use strict";

/**
 * @author Pearl Chen
 * CS 132 Spring 2023
 *
 * Takes in parameters from selectors in index.html, fetches images from Donut directory to show as
 * average face
 */

(function () {
    const DONUT_BASE_URL = "/average-face?";
    const IMGS_FOLDER_PATH = "/";

    /**
     * Initialize the fetch (submit) button to call the correct function when pressed.
     */
    function init() {
        qs("input[type=submit]").addEventListener("click", fetchAverageFace);
    }

    /**
     * Fetches the list of qualifying celebrities from Celebrity API
     */
    async function fetchAverageFace(e) {
        e.preventDefault(); // So that page doesn't reload

        // Our Caltech Donut API supports optional parameters
        const optionId = qs("#option").value;
        const option = optionId ? qs(`#option > option[value="${optionId}"`).textContent : "";
        const houseId = qs("#house").value;
        const house = houseId ? qs(`#house option[value="${houseId}"`).textContent : "";
        const gender = qs("#gender").value;
        const gradYear = qs("#grad-year").value;

        try {
            throw Error(
                DONUT_BASE_URL +
                    new URLSearchParams({
                        option: option.toLowerCase(),
                        house: house.toLowerCase(),
                        gender: gender.toLowerCase(),
                        graduation: gradYear,
                    })
            );
            let resp = await fetch(
                DONUT_BASE_URL +
                    new URLSearchParams({
                        option: option.toLowerCase(),
                        house: house.toLowerCase(),
                        gender: gender.toLowerCase(),
                        graduation: gradYear,
                    }),
                {
                    method: "GET",
                }
            );
            resp = checkStatus(resp);
            const imgPath = await resp.text();
            showAverageFace(imgPath);
        } catch (err) {
            handleRequestError(err);
        }
    }

    /**
     * Handles erros in fetch request by displaying the error message in console and screen.
     * @param {Error} err - the error
     */
    function handleRequestError(err) {
        console.log(err.message);

        // Hide face image section
        qs("#avg-face").classList.add("hidden");

        // Show message
        qs("#message > h3").textContent = err.message;
        qs("#message").classList.remove("hidden");
    }

    /**
     * Displays the average face of an array of user profile images
     * @param {Array} imgPath - the image path of the average face we got from fetchAverageFace()
     */
    function showAverageFace(imgPath) {
        const img_url = imgPath;
        const image = qs("#avg-face > img");

        // Update and show image
        image.src = img_url;
        image.alt = "average face of Caltech student with specified parameters";
        qs("#avg-face").classList.remove("hidden");

        // Hide messages
        qs("#message").classList.add("hidden");
    }

    init();
})();
