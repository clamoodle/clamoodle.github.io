/**
 * @author Pearl Chen
 * CS132 Spring 2023
 *
 * Fetch calls to get friends info, and generally handles interactions between users, and
 * leaderboard displays
 */

(function () {
  "use strict";
  const GET_USER_BASE_URL = "/users?";
  const ADD_FRIEND_BASE_URL = "/addFriend/";
  const LEADERBOARD_LENGTH = 10; // Good to-do is to update HTML leaderboard heading to always match

  let userOptionsPopulated = false;

  function init() {
    qs("#show-my-info").addEventListener("click", showCurrUserDetails);
    qs("#add-friends-button").addEventListener("click", showFriends);
    qs("#search-friends").addEventListener("click", showFriends);
    qs("#show-leaderboard").addEventListener("click", showLeaderboard);
    qs(".back-to-friends").addEventListener("click", toggleUserInfoView);
    qs("#user-back-to-friends").addEventListener("click", showFriends);
    qs("#send-message").addEventListener("click", openMessenger);
    qs("#send-request").addEventListener("click", () => {
      const friendName = qs("#send-request").parentNode.firstElementChild.textContent;
      addFriend(friendName);
    });
  }

  /**
   * Adds friend with POST request to update friends lists for both curr user and friend to be added
   * @param {String} friend - username of the friend to be added
   */
  async function addFriend(friend) {
    try {
      let resp = await fetch(ADD_FRIEND_BASE_URL + friend, { method: "POST" });
      resp = await checkStatus(resp);
      let friendLists = await resp.json();

      // Update HTML friend lists in user details pages for both parties
      qs("#friends").textContent = friendLists.friend.join(", ");
      qs("#curr-friends").textContent = friendLists.curr_user.join(", ");

      // Change add friend to send-message button
      qs("#send-request").classList.add("hidden");
      qs("#send-message").classList.remove("hidden");

      // Forgive meeeee ahh I just didn't want to code another HTML popup element and set timer
      // Yes this is just to display the message
      throw Error(`${friend} is now a friend, yay!`);
    } catch (err) {
      handleError(err.message);
    }
  }

  /**
   * Shows current user information profile page
   */
  function showCurrUserDetails() {
    // Toggle window visibility
    qs("#menu").classList.add("hidden");
    qs("#add-friends-page").classList.remove("hidden");

    hideAll("#add-friends-page > section");
    qs("#curr-user-info").classList.remove("hidden");
  }

  /**
   * Fills in user information details in #user-info in index.html
   * @param {Object} user - JSON user object from fetched users
   */
  function populateUserDetails(user) {
    qs("#user-info img").src = user.image_path;
    qs("#user-info img").alt = user.username;
    qs("#username").textContent = user.username;
    qs("#high-score").textContent = user.high_score;
    qs("#friends").textContent = user.friends.join(", ");

    // Show add friend button if not friends, message button otherwise
    const currUser = qs("#curr-username").textContent;
    if (user.friends.includes(currUser)) {
      // Change add friend to send-message button
      qs("#send-request").classList.add("hidden");
      qs("#send-message").classList.remove("hidden");
    } else {
      // Change send-message to add friend button
      qs("#send-request").classList.remove("hidden");
      qs("#send-message").classList.add("hidden");
    }
  }

  /**
   * Fetches the filtered list of users from the current user's specified search parameters and
   * displays them.
   * @param {Boolean} sortByScore - whether we want to sort the list of returned users by their high
   * scores.
   * @returns {Object} - JSON list of user objects
   */
  async function fetchUsers(sortByScore = false) {
    // Get search params
    let params = new FormData(qs("#search-filters"));
    if (sortByScore) {
      params.append("sort", "scores");
    }

    // Fetch data
    try {
      let resp = await fetch(GET_USER_BASE_URL + new URLSearchParams(params));
      resp = await checkStatus(resp);
      const users = await resp.json();
      return users;
    } catch (err) {
      handleError(err.message);
    }
  }

  /**
   * Displays HTML for all friends / users view for user to add friends
   */
  async function showFriends() {
    let users = await fetchUsers();

    // Populate HTML auto-complete input options
    if (!userOptionsPopulated) {
      users.forEach((user) => {
        let suggest = gen("option");
        suggest.textContent = user.username;
        qs("#users").appendChild(suggest);
      });
      userOptionsPopulated = true;
    }

    qs("#user-icons").innerHTML = ""; // Clear userslist
    users.forEach((user) => {
      // Populate HTML gallery with user images and names
      let icon = gen("article");
      let img = gen("img");
      let description = gen("p");
      img.src = user.image_path;
      img.alt = user.username;
      description.textContent = user.username;
      icon.appendChild(img);
      icon.appendChild(description);
      icon.addEventListener("click", () => {
        populateUserDetails(user);
        toggleUserInfoView();
      });
      qs("#user-icons").appendChild(icon);
    });

    // Show HTML
    qs("#menu").classList.add("hidden");
    qs("#add-friends-page").classList.remove("hidden");

    hideAll("#add-friends-page > section");
    qs("#users-list").classList.remove("hidden");
  }

  /**
   * Shows the specific info for one user in the friends popup window
   */
  function toggleUserInfoView() {
    qs("#users-list").classList.toggle("hidden");
    qs("#user-info").classList.toggle("hidden");
  }

  /**
   * Shows the messenger platform in a popup
   */
  function openMessenger() {
    qs("#user-info").classList.add("hidden");
    qs("#messenger").classList.remove("hidden");
  }

  /**
   * Shows the leaderboard window popup
   */
  async function showLeaderboard() {
    // Fetch data
    let users = await fetchUsers(true);

    // Populate HTML table with user info & scores
    const leaderboard = qs("#leaderboard tbody");
    leaderboard.innerHTML = ""; // Clear it first
    for (let i = 0; i < LEADERBOARD_LENGTH; i++) {
      if (!users[i] || !users[i].high_score) {
        break;
      }
      let row = gen("tr");
      let index = gen("td");
      let username = gen("td");
      let score = gen("td");
      index.textContent = i + 1;
      username.textContent = users[i].username;
      score.textContent = users[i].high_score;
      row.appendChild(index);
      row.appendChild(username);
      row.appendChild(score);
      leaderboard.append(row);
    }

    // Display HTML
    qs("#menu").classList.add("hidden");
    qs("#leaderboard").classList.remove("hidden");
  }

  init();
})();
