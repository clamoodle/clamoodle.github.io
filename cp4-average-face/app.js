"use strict";

/**
 * @author Pearl Chen
 * CS 132 Spring 2023
 *
 * Node/Express for Caltech Donut API
 *
 * CS132 Node.js/Express "Cheat Sheet":
 * https://docs.google.com/document/d/11w4ZkW5S1vTilJm5HXIDeetjd-JmvkJMO22X8o31m64/edit
 *
 * Refs:
 * https://expressjs.com/en/4x/api.html
 */

const express = require("express");
const { exec } = require("child_process");
const fsp = require("fs/promises");
const fs = require("fs");
const app = express();

const USER_DATA_PATH = "data-scraper/scraped-data.json";
const PYTHON_SCRIPT_PATH = "get-average-face.py";
const PYTHON_OUTPUT_IMG_PATH = "../public/average-faces/";

app.use(express.static("public"));

/*-------------------- app.get/app.post endpoints -------------------- */

/**
 * Returns JSON or text for a list of students matching the specified filter parameters.
 */
app.get("/users/", readData, getFilteredUserData, (req, res) => {
    switch (req.query.type) {
        case "names":
            res.type("text");
            res.send(dictArrayToStringArray(res.locals.users, "name").join(", "));
            break;
        case "image-paths":
            // Filter makes sure no null entries are returned
            res.json(dictArrayToStringArray(res.locals.users, "imagePath").filter((i) => i));
            break;
        case "json":
        default:
            res.json(res.locals.users);
            break;
    }
});

/**
 * Makes an image of the average of faces of users with the specified filter parameters, and saves
 * the resulting image to public/average-faces. Returns the image path and description in JSON.
 */
app.get("/average-face/", readData, getFilteredUserData, getAverageFace, (req, res) => {
    const imgInfo = {
        description: res.locals.imgDescription,
        // E.g. "average-face/avery-2023-face.png"
        imgPath: res.locals.saveToPath.slice("../public/".length),
    };
    res.json(imgInfo);
});

/*----------------------- Middleware Functions ----------------------- */

/**
 * Processes images from image paths from getFilteredUserData by running the get-average-faces.py
 * script from img-processing, produces the average face of all the images.
 *
 * Refs:
 * https://medium.com/swlh/run-python-script-from-node-js-and-send-data-to-browser-15677fcf199f
 * https://nodejs.org/api/child_process.html
 */
function getAverageFace(req, res, next) {
    const imgPaths = dictArrayToStringArray(res.locals.users, "imagePath").filter((i) => i);
    const option = req.query.option ? req.query.option : "";
    const house = req.query.house;
    const gender = req.query.gender;
    const graduation = req.query.graduation;

    const saveToPath =
        PYTHON_OUTPUT_IMG_PATH +
        [
            encodeURI(option.replace(/[\W]/g, "-").toLowerCase()),
            house,
            gender,
            graduation,
            "face.png",
        ]
            .filter((s) => s) // Make sure we're only joining non-empty strings
            .join("-"); // Make sure all characters are alphaneumeric, no space
    const imgDescription = ["Caltech", graduation, house, option, gender, "face"]
        .filter((s) => s)
        .join(" ");

    res.locals.saveToPath = saveToPath;
    res.locals.imgDescription = imgDescription;

    // Check if image is stored in common-average-faces
    if (fs.existsSync(saveToPath.slice("../".length))) {
        next();
    }

    // Spawn new child process to call the python script
    const command = `Python ${PYTHON_SCRIPT_PATH} '${JSON.stringify(imgPaths)}' ${saveToPath}`;
    const python = exec(command, {
        cwd: "img-processing",
    });

    // Catch error message from Python child process
    python.stderr.on("data", (data) => {
        next(Error(data));
    });

    // In close event we are sure that stream from child process is closed
    python.on("close", (code) => {
        console.log(`child process close all stdio with code ${code}`);
        next();
    });
}

/**
 * Reads file at USER_DATA_PATH into JSON object into res.locals.users
 */
async function readData(req, res, next) {
    try {
        let data = await fsp.readFile(USER_DATA_PATH, "utf8");
        data = JSON.parse(data);
        res.locals.users = data.users;
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
        // Check params valid for filtering
        if (!["option", "house", "gender", "graduation"].includes(param)) {
            continue;
        }

        // Filter
        const filterValue = req.query[param];
        if (filterValue) {
            res.locals.users = filterUserList(res.locals.users, param, filterValue);
        }
    }
    next();
}

/**
 * Handles errors
 */
function handleError(err, req, res) {
    res.status(400);
    res.type("text");
    res.send(err.message);
}

app.use(handleError);

/*------------------------- Helper Functions ------------------------- */

/**
 * Turns an array of dictionaries to an array of string values corresponding to some key in the
 * dictionary entries
 * @param {Array} list - list of dictionary objects
 * @param {String} key - the key we want to extrat
 * @returns {Array} the resulting list of strays
 */
function dictArrayToStringArray(list, key) {
    let stringList = [];
    list.forEach((user) => {
        stringList.push(user[key]);
    });
    return stringList;
}

/**
 * Case insensitive filtering of a list of dictionaries based on each key value pair in the
 * dictionary, returns the filtered list
 * @param {Array} list - the list of dictionaries we wish to be filtering
 * @param {String} filterItem - the key of the dictionaries we want to be evaluate and filter based
 * on
 * @param {String} filterVal - the value that we're restricting the return keys to
 * @returns {Array} - the filtered list
 */
function filterUserList(list, filterItem, filterVal) {
    if (filterVal) {
        if (Array.isArray(list[0][filterItem])) {
            // Case 1: value is an array (assuming we'll never get an empty list)
            list = list.filter(
                // Source: https://bobbyhadz.com/blog/javascript-includes-case-insensitive
                (user) =>
                    user[filterItem].some((entry) => {
                        const targetVal = filterVal.toLowerCase();
                        const entryVal = entry.toLowerCase();
                        return entryVal === targetVal;
                    })
            );
        } else {
            // Case 2: value is a string
            list = list.filter(
                (user) => user[filterItem].toLowerCase() === filterVal.toLowerCase()
            );
        }
    }

    // Check if we got empty list now
    if (!list[0]) {
        throw Error("No matching students!");
    }
    return list;
}

const PORT = process.env.PORT || 8000;
app.listen(PORT);
