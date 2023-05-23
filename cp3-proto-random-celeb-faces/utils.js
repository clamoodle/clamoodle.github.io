/**
 * @author Pearl Chen
 * CS 132 Provided global DOM accessor aliases, and also some helper functions for generic JS tasks
 * I made
 */

/**
 * Returns the element that has the ID attribute with the specified value.
 * @param {string} idName - element ID
 * @returns {object} DOM object associated with id (null if none).
 */
function id(idName) {
    return document.getElementById(idName);
}

/**
 * Returns the first element that matches the given CSS selector.
 * @param {string} selector - CSS query selector string.
 * @returns {object} first element matching the selector in the DOM tree (null if none)
 */
function qs(selector) {
    return document.querySelector(selector);
}

/**
 * Returns the array of elements that match the given CSS selector.
 * @param {string} selector - CSS query selector
 * @returns {object[]} array of DOM objects matching the query (empty if none).
 */
function qsa(selector) {
    return document.querySelectorAll(selector);
}

/**
 * Returns a new element with the given tagname
 * @param {string} tagName - name of element to create and return
 * @returns {object} new DOM element with the given tagname
 */
function gen(tagName) {
    return document.createElement(tagName);
}
