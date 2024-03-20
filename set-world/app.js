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
const mysql = require("mysql2");
const fsp = require("fs").promises;
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");

const PORT = process.env.PORT || 3000;
const SQLPORT = 3307;

// const logger = require("morgan");

// const indexRouter = require("./routes/index");
// const usersRouter = require("./routes/users");

const COOKIE_SECRET = "20CWmcWQQN";

const app = express();
app.use(express.static("public"));
app.use(cookieParser(COOKIE_SECRET));

// https://eipsum.github.io/cs132/lectures/lec18-node-post-documentation/index.html#/34
// for parsing application/x-www-form-urlencoded
// app.use(express.urlencoded({ extended: true })); // built-in middleware
// for parsing application/json
app.use(express.json()); // built-in middleware
// for parsing multipart/form-data (required with FormData)
app.use(multer().none()); // multer middleware

const USER_DATA_PATH = "users.json";
const SERVER_ERR_CODE = 500;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

var indexRouter = require("./routes/index");
const e = require("express");
// var usersRouter = require("./routes/users");
app.use("/", indexRouter);

app.use(express.urlencoded({ extended: false }));

/*-------------------- MySql setup -------------------- */
const connection = mysql.createConnection({
    port: SQLPORT,
    host: "localhost",
    user: "appadmin",
    password: "adminpw",
    database: "setdb",
});

connection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL database");
});

/*-------------------- app.get/app.post endpoints -------------------- */

/**
 * Returns JSON for a list of users matching the specified filter parameters.
 * Specifically, filter parameters are friend-status, species, and min high_score.
 * Friends requires current user ID.
 * Result excludes current user.
 */
app.get("/users", (req, res, next) => {
    // Check log in cookies
    if (!req.signedCookies.curr_user) {
        next(Error("Login cookie missing! Nom nom!"));
    }

    // Parse query parameters
    const username = req.signedCookies.curr_user;
    const status = req.query["friend-status"]
        ? req.query["friend-status"] === "true"
            ? 1
            : 0
        : "1 OR is_accepted = 0";
    const species = req.query.species ? `'${req.query.species}'` : "'eel' OR a.species = 'not eel'";
    const minScore = req.query["min-highscore"] ? req.query["min-highscore"] : 0;

    // Query database and filter results
    const sql = `
                SELECT ui.username, ui.high_score, ui.image_path, ui.friends
                FROM user_info ui JOIN avatar a
                    ON ui.username = a.username
                WHERE ui.username IN (
                    SELECT t.u2 FROM (SELECT u1.username u1, u2.username u2,
                        CASE WHEN (f1.is_accepted IS NULL AND f2.is_accepted IS NULL) THEN 0
                        ELSE 1 END AS is_accepted
                    FROM (user u1 JOIN user u2)
                    LEFT JOIN friend_request f1 ON
                        u1.username = f1.from_user AND u2.username = f1.to_user
                    LEFT JOIN friend_request f2 ON
                        u1.username = f2.to_user AND u2.username = f2.from_user
                    WHERE u1.username != u2.username
                    AND u1.username = '${username}') AS t
                    WHERE (is_accepted = ${status})
                ) AND (a.species = ${species})
                AND (ui.high_score >= ${minScore});
                `;

    connection.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            next(Error("Couldn't connect to database."));
        }
        console.log("Successfully filtered " + (result ? result.length : 0) + " results!");
        res.json(result);
    });
});

/**
 * Returns a list of 10 users in order of highest high score to lowest high score.
 * Has properties: rank, username, and high_score.
 * Does not require current user to be logged in.
 */
app.get("/leaderboard", (req, res, next) => {
    const sql = "SELECT * FROM top_scores";
    connection.query(sql, (err, result) => {
        if (err) {
            next(Error("Couldn't connect to top scores."));
        }
        console.log(result);
        res.json(result);
    });
});

/**
 * REF: http://eipsum.github.io/cs132/lectures/lec19-cs-wrapup-and-cookies/code/cookie-demo.zip
 * Logs in user and updates cookies for a new visit by logging user into "curr_user".
 */
app.get("/login", async (req, res, next) => {
    try {
        // Authenticate user
        const username = req.headers.username;
        const password = req.headers.password;
        const authq = `authenticate ('${username}', '${password}')`;
        connection.query("SELECT " + authq, (err, result) => {
            if (err) next(Error("Couldn't connect to database."));
            if (result[0][authq] == "1") {
                // Record cookie with username
                res.cookie("curr_user", username, { signed: true });
                console.log(`Welcome, ${username}!`);
            } else {
                next(Error("Invalid username or password."));
            }
        });

        // Return user info
        const infoq = `SELECT * FROM user_info WHERE username = '${username}'`;
        connection.query(infoq, (err, result) => {
            if (err) next(Error("Couldn't connect to user info."));
            res.json(result[0]);
        });
    } catch (err) {
        res.type("text");
        res.status(SERVER_ERR_CODE).send("An error occurred when accessing request data.");
    }
});

/**
 * Posts a new user to SQL database with a new avatar.
 * Required POST parameters: username, password, image_path, and species
 * Friends is set to [] and high_score is set to null.
 */
app.post("/newUser", checkUserParams, (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const image_path = req.body.image_path;
    const species = req.body.species;
    const parts = image_path.split("/").pop().slice(0, -4).split("-");
    const color = parts[0];
    const variant = parts[1];
    const email = req.body.email;

    // Add user and avatar to database
    const sql = "CALL add_user_with_avatar(?, ?, ?, ?, ?, ?, ?)";
    connection.query(
        sql,
        [username, email, password, species, variant, color, image_path],
        (err) => {
            // Duplicate entry error: username already exists
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    next(Error("Username taken!"));
                }
                next(Error("Couldn't add user to database."));
            }

            // Success
            res.send(`New user ${req.body.username} successfully added!`);
            console.log(`New user ${req.body.username} successfully added with avatar!`);
        }
    );
});

/**
 * Adds current user to specified user's friends list
 * Required POST path parameter: specified user
 * Returns new friends list
 */
app.post("/addFriend/:username", readUserData, (req, res, next) => {
    if (!req.params.username) {
        next(Error("Required POST path parameter for /addFriend: username."));
    }
    if (!req.signedCookies.curr_user) {
        next(Error("Can't add friend before logging in :("));
    }

    // Make sure not already friends
    const user = req.signedCookies.curr_user;
    const target = req.params.username;
    const checkq = `are_friends ('${user}', '${target}')`;
    connection.query("SELECT " + checkq, (err, result) => {
        if (err) {
            console.log(err);
            next(Error("Couldn't check if already friends :("));
        }
        if (result[0][checkq] == "1") {
            next(Error("Already friends!"));
        }
    });

    // Updating friends list
    const addq = `CALL add_friend ('${user}', '${target}')`;
    connection.query(addq, (err) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                next(Error("Request already sent to this user"));
            }
            console.log(err);
            next(Error("Couldn't add friend in database :("));
        }
        console.log(`Added ${user} to ${target}'s friends list!`);
    });

    // Return new friends list
    const listq = `SELECT username, find_friends(username) AS friends
                   FROM user
                   WHERE username IN ('${user}', '${target}');`;
    connection.query(listq, (err, result) => {
        if (err) {
            console.log(err);
            next(Error("Couldn't update friends list :("));
        }
        res.json(result);
    });
});

/**
 * Posts a new score for a specific user, if this score is higher than user's previous high score,
 * or if user has no score records, this score will be saved as the user's high score.
 * Required POST parameter: score
 */
app.post("/updateScore", readUserData, async (req, res, next) => {
    if (!req.body || !req.body.score) {
        next(Error("Required POST parameters for /updateScore: score."));
    }

    if (!req.signedCookies.curr_user) {
        next(Error("Can't save score before logging in :("));
    }

    // Add new score
    const user = req.signedCookies.curr_user;
    const scoreq = `CALL add_score ('${user}', ${req.body.score})`;
    connection.query(scoreq, (err) => {
        if (err) {
            console.log(err);
            next(Error("Couldn't add score to database :("));
        }
        console.log(`Added ${req.body.score} to ${user}'s scores!`);
    });

    // Response with new high score and user info
    const infoq = `SELECT * FROM user_info WHERE username = '${user}'`;
    connection.query(infoq, (err, result) => {
        if (err) {
            console.log(err);
            next(Error("Couldn't get user info :("));
        }
        res.json(result[0]);
    });
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
 * Handles errors
 */
function handleError(err, req, res, next) {
    // All error responses are plain/text
    res.status(400);
    res.type("text");
    if (err.message) {
        res.send(err.message);
    } else {
        res.send("An error occured on our side! Tell Pearl to fix it!");
    }
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
 * Friends and high_score are initialized respectively to be [] and null.
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
            high_score: null,
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
