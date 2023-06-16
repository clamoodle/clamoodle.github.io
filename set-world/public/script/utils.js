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

/**
 * Toggles the hidden class to show some element
 * @param {string} selector - CSS query selector element to be shown
 */
function showView(selector) {
  qs(selector).classList.remove("hidden");
}

/**
 * Toggles the hidden class to hide some element
 * @param {string} selector - CSS query selector element to be hidden
 */
function hideView(selector) {
  qs(selector).classList.add("hidden");
}

/**
 * Toggles the hidden class to hide all selected elements
 * @param {string} selector - CSS query selector elements to be hidden
 */
function hideAll(selector) {
  qsa(selector).forEach((target) => {
    target.classList.add("hidden");
  });
}

/**
 * Adds event listeners to all selected elements
 * @param {string} selector - CSS query selector elements to listen to
 * @param {string} type - event type to listen for
 * @param {function} callback - callback function to be added to all elements
 */
function addEventListenerToAll(selector, type, callback) {
  qsa(selector).forEach((target) => {
    target.addEventListener(type, callback);
  });
}

/**
 * Displays error messsage for 2 seconds
 * @param {String} err - the error message
 */
function handleError(err) {
  const errNode = qs("#err-msg");
  errNode.textContent = err;
  errNode.classList.remove("hidden");
  setTimeout(() => {
    errNode.classList.add("hidden");
  }, 2000);
}

/**
 * Helper function to return the Response data if successful, otherwise
 * returns an Error that needs to be caught.
 * @param {object} response - response with status to check for success/error.
 * @returns {object} - The Response object if successful, otherwise an Error that
 * needs to be caught.
 */
async function checkStatus(response) {
  if (!response.ok) {
    // response.status >= 200 && response.status < 300
    const errMsg = await response.text();
    throw new Error(errMsg);
  } // else, we got a response back with a good status code (e.g. 200)
  return response; // A resolved Response object.
}
