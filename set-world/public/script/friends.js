/**
 * @author Pearl Chen
 * CS132 Spring 2023
 *
 * Fetch calls to get friends info, and generally handles interactions between users, and
 * leaderboard
 */

(function () {
  "use strict";

  function init() {
    qs("#show-my-info").addEventListener("click", showUser);
    qs("#add-friends-button").addEventListener("click", showFriends);
    qs("#show-leaderboard").addEventListener("click", showLeaderboard);
    addEventListenerToAll("#user-icons > article", "click", toggleUserInfoView);
    qs("#back-to-friends").addEventListener("click", toggleUserInfoView);
    qs("#send-message").addEventListener("click", openMessenger);
  }

  /**
   * Shows user information profile page
   */
  function showUser() {
    qs("#menu").classList.add("hidden");
    qs("#add-friends-page").classList.remove("hidden");

    hideAll("#add-friends-page > section");
    qs("#user-info").classList.remove("hidden");
  }

  /**
   * Shows all friends / users view for user to add friends
   */
  function showFriends() {
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
  function showLeaderboard() {
    qs("#menu").classList.add("hidden");
    qs("#leaderboard").classList.remove("hidden");
  }

  init();
})();
