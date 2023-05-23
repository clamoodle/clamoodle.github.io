/**
 * @author Pearl Chen
 * CS 132 Spring 2023
 *
 * A program to fetch and display pictures of faces from Celebrity API and Bing image search API.
 * 
 * Sources & References:
 * https://api-ninjas.com/api/celebrity
 * https://eipsum.github.io/cs132/lectures/lec13-async-await/code/apod-lec13/apod-multi-request.js
 * https://learn.microsoft.com/en-us/bing/search-apis/bing-image-search/quickstarts/rest/python
 */

"use strict";
(function () {
    const URL_CELEB = "https://api.api-ninjas.com/v1/celebrity?";
    const KEY_CELEB = "FPpfO8gK9iNxgxDURQQ1jA==MWdictg09QzEWW3X";
    const URL_BING = "https://api.bing.microsoft.com/v7.0/images/search";
    const KEY_BING = "f3dcd3b9abd44a4ca73f1bf6c1a950d9";

    /**
     * Initialize the fetch (submit) button to call the correct function when pressed.
     */
    function init() {
        // Height range sliders in input search bar
        qs("#min-height-input").addEventListener("input", (e) => {
            displayInput(e, "#min-height-val");
        });
        qs("#max-height-input").addEventListener("input", (e) => {
            displayInput(e, "#max-height-val");
        });

        qs("input[type=submit]").addEventListener("click", fetchCelebNames);
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
     * Fetches the list of qualifying celebrities from Celebrity API
     */
    async function fetchCelebNames(e) {
        e.preventDefault(); // So that page doesn't reload

        // The Celebrity API supports optional parameters
        const name = qs("[name='name']").value;
        const min_height_val = qs("#min-height-input").value;
        const max_height_val = qs("#max-height-input").value;
        const nationality = qs("[name='nationality']").value;

        // To include search results where height is unknown
        let min_height = min_height_val == 0 ? "" : min_height_val;
        let max_height = max_height_val == 3 ? "" : max_height_val;

        try {
            // Source: https://stackoverflow.com/questions/35038857/setting-query-string-using-fetch-get-request
            let resp = await fetch(
                URL_CELEB +
                    new URLSearchParams({
                        name: name,
                        min_height: min_height,
                        max_height: max_height,
                        nationality: nationality,
                    }),
                {
                    // Source: https://api-ninjas.com/api/celebrity
                    method: "GET",
                    headers: { "X-Api-Key": KEY_CELEB },
                    contentType: "application/json",
                }
            );
            resp = checkStatus(resp);
            const celebs = await resp.json();
            let chosen_celeb = getRandomCeleb(celebs);
            fetchBingPic(chosen_celeb);
        } catch (err) {
            handleRequestError(err);
        }
    }

    /**
     * Fetches and displays the image in the first Bing image search result
     * (not catching error since it's only called in fetchCelebNames)
     * @param {JSON} celeb_data - the JSON entry of the chosen celeb we got from Celebrity API
     */
    async function fetchBingPic(celeb_data) {
        let term = celeb_data.name;
        // Source: https://learn.microsoft.com/en-us/bing/search-apis/bing-image-search/quickstarts/rest/nodejs
        let resp = await fetch(URL_BING + "?q=" + encodeURIComponent(term), {
            method: "GET",
            q: term,
            headers: {
                "Ocp-Apim-Subscription-Key": KEY_BING,
            },
        });
        resp = checkStatus(resp);
        const data = await resp.json();
        displayCelebPic(data, celeb_data);
    }

    /**
     * Checks the status of a fetch API response
     * @param {Response} resp - the response we get from after calling fetch
     */
    function checkStatus(resp) {
        if (!resp.ok) {
            throw Error("Error in request: " + response.statusText);
        }
        return resp;
    }

    /**
     * Handles erros in fetch request by displaying the error message in console and screen.
     * @param {Error} err - the error
     */
    function handleRequestError(err) {
        console.log(err.message);

        // Hide celeb info
        qs("#celeb-info").classList.add("hidden");

        // Show message
        qs("#message > h3").textContent = err.message;
        qs("#message").classList.remove("hidden");
    }

    /**
     * Picks a random celebrity entry from a list of them from the return of Celebrity API JSON
     * @param {JSON} celebs - the return of Celebrity API JSON
     */
    function getRandomCeleb(celebs) {
        if (celebs.length === 0) {
            throw Error("Parameters too unique! Try something more generic.");
        }

        let randomIdx = Math.floor(Math.random() * celebs.length);
        return celebs[randomIdx];
    }

    /**
     * Displays the first image search result of the named celebrity
     * @param {JSON} data - the return of Bing image search API
     * @param {JSON} celeb_data - the JSON entry of the chosen celeb we got from Celebrity API
     */
    function displayCelebPic(data, celeb_data) {
        const img_url = data.value[0].contentUrl;
        const image = qs("#celeb-info > img");

        // Update and show image
        image.src = img_url;
        image.alt = celeb_data.name;
        qs("#celeb-info").classList.remove("hidden");

        // Show discription
        qs("#name").textContent = celeb_data.name;
        qs("#occupation").textContent = celeb_data.occupation;
        qs("#nationality").textContent = celeb_data.nationality;
        qs("#height").textContent = celeb_data.height;
        qs("#net-worth").textContent = celeb_data.net_worth;

        // Hide messages
        qs("#message").classList.add("hidden");
    }

    init();
})();
