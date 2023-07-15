"use strict";

/**
 * @author Pearl Chen
 * CS 132 Spring 2023
 *
 * Takes in parameters from selectors in index.html, fetches images scraped from Donut directory to
 * show thier composite average face
 */

(function () {
    const DONUT_BASE_URL = "/average-face?";
    const ERR_MESSAGE_DURATION_MS = 2000;

    // Source: Wikimedia Commons
    const LOADING_ICON_SRC =
        "https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif?20151024034921";

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

        const figure = showLoadingIcon();

        // Our Caltech Donut API supports optional parameters
        const optionId = qs("#option").value;
        const option = optionId ? qs(`#option > option[value="${optionId}"`).textContent : "";
        const houseId = qs("#house").value;
        const house = houseId ? qs(`#house option[value="${houseId}"`).textContent : "";
        const gender = qs("#gender").value;
        const gradYear = qs("#grad-year").value;

        try {
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
            resp = await checkStatus(resp);
            const imgInfo = await resp.json();
            console.log(imgInfo);
            showAverageFace(figure, imgInfo);
        } catch (err) {
            handleRequestError(err.message);
        }
    }

    /**
     * Generates a figure with a loading GIF image in it.
     * @returns {Object} - DOM element Node of the figure generated
     */
    function showLoadingIcon() {
        const figure = gen("figure");
        const image = gen("img");

        // Update and show image
        image.src = LOADING_ICON_SRC;
        image.alt = "Loading Icon";
        figure.appendChild(image);

        qs("#avg-face").prepend(figure);
        qs("#avg-face").classList.remove("hidden");

        // Hide messages
        qs("#message").classList.add("hidden");

        return figure;
    }

    /**
     * Handles erros in fetch request by displaying the error message in console and screen.
     * @param {Error} err - the error
     */
    function handleRequestError(errMsg) {
        console.log(errMsg);

        // Deletes figure node in average face gallery section and hides the section
        const gallery = qs("#avg-face");
        gallery.removeChild(gallery.firstElementChild);
        gallery.classList.add("hidden");

        // Show message
        qs("#message > h3").textContent = errMsg;
        qs("#message").classList.remove("hidden");

        // Hide message after some seconds
        setTimeout(() => {
            qs("#message").classList.add("hidden");
            gallery.classList.remove("hidden");
        }, ERR_MESSAGE_DURATION_MS);
    }

    /**
     * Displays the average face of an array of user profile images
     * @param {Object} figure - the HTML DOM node to display the image and caption
     * @param {JSON} imgInfo - the image info of the average face we got from fetchAverageFace()
     */
    function showAverageFace(figure, imgInfo) {
        const imgSrc = imgInfo.imgPath;
        const imgDescription = imgInfo.description;
        const image = figure.firstElementChild;
        const caption = gen("figcaption");

        // Update and show image
        image.src = imgSrc;
        image.alt = imgDescription;
        caption.textContent = imgDescription;
        figure.appendChild(caption);
        qs("#avg-face").classList.remove("hidden");

        // Hide messages
        qs("#message").classList.add("hidden");
    }

    init();
})();
