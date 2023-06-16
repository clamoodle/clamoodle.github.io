"use strict";

/**
 * @author Pearl Chen
 * CS 132 Spring 2023
 *
 * Get/Post endpoints for Set World user data API
 * Includes user scores, login info, etc
 *
 * Ref:
 * https://eipsum.github.io/cs132/lectures/lec17-more-node/code/dir-web-cafe/app.js
 */

const express = require("express");
const fsp = require("fs/promises");
const cookieParser = require("cookie-parser");
const multer = require("multer");

const app = express();

app.use(express.static("public"));
app.use(cookieParser());

// https://eipsum.github.io/cs132/lectures/lec18-node-post-documentation/index.html#/34
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); // built-in middleware
// for parsing application/json
app.use(express.json()); // built-in middleware
// for parsing multipart/form-data (required with FormData)
app.use(multer().none()); // multer middleware

const USER_DATA_PATH = "users.json";
const SERVER_ERR_CODE = 500;

/*-------------------- app.get/app.post endpoints -------------------- */

/**
 * Returns JSON for a list of users matching the specified filter parameters.
 * Specifically, filter parameters are friends, species, and min highscore.
 * Friends requires current user ID.
 *
 * If param "sort" is by "scores", the list of users will be returned in order of highest high score
 * to lowest high score.
 */
app.get("/users", readUserData, getFilteredUserData, (req, res) => {
  if (req.query.sort === "scores") {
    sortByKeyValue(res.locals.users, "highScore");
  }
  res.json(res.locals.users);
});

/**
 * REF: http://eipsum.github.io/cs132/lectures/lec19-cs-wrapup-and-cookies/code/cookie-demo.zip
 * Logs in user and updates cookies for a new visit by logging user into "curr_user".
 */
app.get("/login", readUserData, async (req, res) => {
  try {
    const username = req.headers.username;
    const password = req.headers.password;
    let userIdx = res.locals.users.findIndex((user) => user.username === username);
    if (!userIdx) {
      next(Error("No user found!"));
    }
    if (res.locals.users[userIdx].password !== password) {
      next(Error("Incorrect password"));
    }
    res.cookie("curr_user", res.locals.users[userIdx]);
    res.send(res.locals.users[userIdx]);
  } catch (err) {
    res.type("text");
    res.status(SERVER_ERR_CODE).send("An error occurred when accessing request data.");
  }
});

/**
 * Posts a new user to USER_DATA_PATH
 * Required POST parameters: username, password, image_path, and species
 * Friends is set to [] and highScore is set to null.
 */
app.post("/newUser", readUserData, checkUserParams, (req, res, next) => {
  // Update data JSON
  res.locals.users.push(res.locals.user);
  updateUsers(USER_DATA_PATH, res.locals.users);
  res.send(`Request to add new user ${req.body.username} successfully received!`);
});

/**
 * Posts a new score for a specific user
 * Required POST parameter: score
 */
app.post("/updateScore", readUserData, async (req, res, next) => {
  if (!req.body.score) {
    next(Error("Required POST parameters for /updateScore: score."));
  }

  if (!req.cookies.curr_user) {
    next(Error("Can't save score before logging in :("));
  }

  // Updating high score
  const currUsername = req.cookies.curr_user.username;
  let userIdx = res.locals.users.findIndex((user) => user.username === currUsername);
  res.locals.users[userIdx].highScore = Math.max(
    req.body.score,
    res.locals.users[userIdx].highScore
  );

  updateUsers(USER_DATA_PATH, res.locals.users);
  res.type("text");
  res.send(
    `Score saved for ${currUsername}. Your record is ${res.locals.users[userIdx].highScore}!`
  );
});

/*----------------------- Middleware Functions ----------------------- */

/**
 * Save POST parameters for newUser as a JSON into res.locals.user
 */
function checkUserParams(req, res, next) {
  let newUserJSON = processUserParams(
    req.body.username,
    req.body.password,
    req.body.image_path,
    req.body.species,
    req.body.email
  );

  // Check required params
  if (!newUserJSON) {
    res.status(CLIENT_ERR_CODE);
    next(
      Error(
        "Required POST parameters for /newUser: username, password, email, image_path, and species."
      )
    );
  }

  // Check username uniqueness
  let sameNameUsers = res.locals.users.filter((user) => user.username === newUserJSON.username);
  if (sameNameUsers.length > 0) {
    next(Error("Username taken."));
  }

  res.locals.user = newUserJSON;
  next();
}

/**
 * Reads file at USER_DATA_PATH into JSON object into res.locals.users
 */
async function readUserData(req, res, next) {
  try {
    let data = await fsp.readFile(USER_DATA_PATH, "utf8");
    data = JSON.parse(data);
    res.locals.users = data;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
}

/**
 * Filters entries in data.users and returns ones matching the query parameters into
 * res.locals.users.
 * Presumably the query parameters are option, house, gender, and graduation.
 */
function getFilteredUserData(req, res, next) {
  for (const param in req.query) {
    switch (param) {
      case "friend-status":
        // Filter friends
        if (!req.cookies.curr_user) {
          next(Error("Login cookie missing! Nom nom!"));
        }

        // (Assuming we'll never get an empty list)
        if (req.query["friend-status"] === "true") {
          // Filter those who are friends with user
          res.locals.users = res.locals.users.filter(
            // Source: https://bobbyhadz.com/blog/javascript-includes-case-insensitive
            (user) =>
              user.friends.some((entry) => {
                return entry.toLowerCase() === req.cookies.curr_user.username.toLowerCase();
              })
          );
        } else {
          // Filter those who are not friends with user
          res.locals.users = res.locals.users.filter((user) =>
            user.friends.every((entry) => {
              return entry.toLowerCase() !== req.cookies.curr_user.username.toLowerCase();
            })
          );
        }

        break;

      case "species":
        // Filter species
        if (req.query.species) {
          res.locals.users = res.locals.users.filter(
            (user) => user["species"].toLowerCase() === req.query.species.toLowerCase()
          );
        }
        break;

      case "min-highscore":
        // Filter minimum high score
        if (req.query["min-highscore"]) {
          res.locals.users = res.locals.users.filter(
            (user) => parseInt(user["min-highscore"]) >= parseInt(req.query["min-highscore"])
          );
        }
        break;
    }
  }
  next();
}

/**
 * Handles errors
 */
function handleError(err, req, res, next) {
  // All error responses are plain/text
  res.status(400);
  res.type("text");
  res.send(err.message);
}

app.use(handleError);

/*------------------------- Helper Functions ------------------------- */

/**
 * Sorts a given list of objects by the (numerical) value of the specified key in descending order.
 * @param {JSON} list - list of dictionary objects
 * @param {String} key - the key with numerical values in each object that we want to sort our list
 * by
 * @returns {Array} - the sorted list
 */
function sortByKeyValue(list, key) {
  return list.sort((a, b) => b[key] - a[key]);
}

/**
 * Helper for the /newUser endpoint, returns a JSON with stored user information.
 * Friends and highScore are initialized respectively to be [] and null.
 * All fields required, returns null if any is missing.
 * @param {String} username - New user's username
 * @param {String} password - New user's password
 * @param {String} image_path - the path to new user's profile image
 * @param {String} species - whether the new user is an eel
 * @param {String} email - the email associated with this account
 */
function processUserParams(username, password, image_path, species, email) {
  let result = null;
  if (username && password && image_path && species && email) {
    result = {
      username: username,
      password: password,
      image_path: image_path,
      species: species,
      friends: [],
      highScore: null,
      email: email,
    };
  }
  return result;
}

/**
 * Updates file JSON data.
 * @param {String} filePath - The path of the file to be updated
 * @param {JSON} newData - Data to update the file with
 */
async function updateUsers(filePath, newData) {
  try {
    // prettify JSON with 2-space indentation
    await fsp.writeFile(filePath, JSON.stringify(newData, null, 2), "utf8");
  } catch (err) {
    // some other error occurred
    res.status(500);
    err.message = SERVER_ERROR;
    next(err);
  }
}

const PORT = process.env.PORT || 8000;
app.listen(PORT);
