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
const app = express();

const USER_DATA_PATH = "users.json";

// if serving front-end files in public/
app.use(express.static("public"));

// if handling different POST formats
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(multer().none());

/*-------------------- app.get/app.post endpoints -------------------- */

/**
 * Returns JSON for a list of users matching the specified filter parameters.
 * Specifically, filter parameters are friends, species, and min highscore.
 * Friends requires current user ID.
 *
 * If param "sort" is by "scores", the list of users will be returned in order of highest high score
 * to lowest high score.
 */
app.get("/users/:user", readUserData, getFilteredUserData, (req, res) => {
    if (req.query.sort && req.query.sort === "scores") {
        sortByKeyValue(res.locals.users, "highScore");
    }
    res.json(res.locals.users);
});

/**
 * Posts a new user to USER_DATA_PATH
 * Required POST parameters: username, password, imagePath, and species
 * Friends is set to [] and highScore is set to null.
 */
app.post("/newUser", checkUserParams, readUserData, (req, res, next) => {
    res.locals.users.push(res.locals.user);
    updateUsers(USER_DATA_PATH, res.locals.users);
    res.send(`Request to add new user ${req.body.username} successfully received!`);
});

/**
 * Posts a new score for a specific user
 * Required POST parameter: score
 */
app.post("/updateScore/:user", readUserData, async (req, res, next) => {
    if (!req.body.score) {
        next(Error("Required POST parameters for /updateScore: score."));
    }

    // Updating high score
    let userIdx = res.locals.users.findIndex((user) => user.username === req.params.user);
    res.locals.users[userIdx].highScore = Math.max(
        req.body.score,
        res.locals.users[userIdx].highScore
    );

    updateUsers(USER_DATA_PATH, res.locals.users);
    res.send(
        `Request to update score for ${req.params.user} successfully received! Score is now ${res.locals.users[userIdx].highScore}.`
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
        req.body.imagePath,
        req.body.species
    );
    if (!newUserJSON) {
        res.status(CLIENT_ERR_CODE);
        next(
            Error(
                "Required POST parameters for /addItem: username, password, imagePath, and species."
            )
        );
    }
    res.locals.user = newUserJSON;
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
            case "friends":
                // Filter friends
                if (!req.params.user) {
                    throw Error("Friends needs a specified reference user!");
                }

                if (req.params.friends) {
                    // (Assuming we'll never get an empty list)
                    if (req.query.friends === "true") {
                        // Filter those who are friends with user
                        res.locals.users = res.locals.users.filter(
                            // Source: https://bobbyhadz.com/blog/javascript-includes-case-insensitive
                            (user) =>
                                user.friends.some((entry) => {
                                    return entry.toLowerCase() === req.params.user.toLowerCase();
                                })
                        );
                    } else {
                        // Filter those who are not friends with user
                        res.locals.users = res.locals.users.filter((user) =>
                            user.friends.every((entry) => {
                                return entry.toLowerCase() !== req.params.user.toLowerCase();
                            })
                        );
                    }
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
                        (user) =>
                            parseInt(user["min-highscore"]) >= parseInt(req.query["min-highscore"])
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
// function handleError(err, req, res, next) {

// }

// app.use(handleError);

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
 * @param {String} imagePath - the path to new user's profile image
 * @param {String} species - whether the new user is an eel
 */
function processUserParams(username, password, imagePath, species) {
    let result = null;
    if (username && password && imagePath && species) {
        result = {
            username: username,
            password: password,
            imagePath: imagePath,
            species: species,
            friends: [],
            highScore: null,
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
        // prettify JSON with 4-space indentation
        await fs.writeFile(filePath, JSON.stringify(newData, null, 4), "utf8");
    } catch (err) {
        // some other error occurred
        res.status(500);
        err.message = SERVER_ERROR;
        next(err);
    }
}

const PORT = process.env.PORT || 8000;
app.listen(PORT);
