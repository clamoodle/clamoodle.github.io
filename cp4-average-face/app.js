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
const app = express();

const USER_DATA_PATH = "data-scraper/scraped-data.json";
const IMG_FOLDER_PATH = "data-scraper/";
const PYTHON_SCRIPT_PATH = "get-average-face.py";
const PYTHON_OUTPUT_IMG_PATH = "../public/average-faces/";

// if serving front-end files in public/
app.use(express.static("public"));

// if handling different POST formats
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(multer().none());

/*-------------------- app.get/app.post endpoints -------------------- */

/**
 * Returns JSON or text for a list of students matching the specified filter parameters.
 */
app.get("/users/", readData, getFilteredUserData, (req, res) => {
    switch (req.query.type) {
        case "names":
            res.type("text");
            const names = dictArrayToStringArray(res.locals.users, "name");
            res.send(names.join(", "));

        case "image-paths":
            const imgPaths = dictArrayToStringArray(res.locals.users, "imagePath");
            res.json(imgPaths);

        case "json":
        default:
            res.json(res.locals.users);
    }
});

/**
 * Returns the image path string of the average face of a list of students matching the specified
 * filter parameters.
 *
 * Refs:
 * https://medium.com/swlh/run-python-script-from-node-js-and-send-data-to-browser-15677fcf199f
 * https://nodejs.org/api/child_process.html
 */
app.get("/average-face/", readData, getFilteredUserData, (req, res) => {
    const imgPaths = dictArrayToStringArray(res.locals.users, "imagePath");
    const option = req.query.option;
    const house = req.query.house;
    const gender = req.query.gender;
    const graduation = req.query.graduation;
    const saveToPath =
        PYTHON_OUTPUT_IMG_PATH + [option, house, gender, graduation].join("-") + "-face.png";

    // spawn new child process to call the python script
    const python = exec(
        `Python ${PYTHON_SCRIPT_PATH} '${JSON.stringify(imgPaths)}' ${saveToPath}`,
        {
            cwd: "img-processing",
        }
    );
    const string = `Python ${PYTHON_SCRIPT_PATH} '${JSON.stringify(imgPaths)}' ${saveToPath}`;
    res.send(string);

    // console.log(`Python ${PYTHON_SCRIPT_PATH} '${JSON.stringify(imgPaths)}' ${saveToPath}`);

    // in close event we are sure that stream from child process is closed
    python.on("close", (code) => {
        console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        res.type("text");
        res.send(saveToPath.slice(10)); // E.g. "average-face/-avery--2023-face.png"
    });
});

/*----------------------- Middleware Functions ----------------------- */

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
// function handleError(err, req, res, next) {

// }

// app.use(handleError);

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
            // Case: value is an array (assuming we'll never get an empty list)
            list = list.filter(
                // Source: https://bobbyhadz.com/blog/javascript-includes-case-insensitive
                (user) =>
                    user[filterItem].some((entry) => {
                        return entry.toLowerCase() === filterVal.toLowerCase();
                    })
            );
        } else {
            // Case: value is a string
            list = list.filter(
                (user) => user[filterItem].toLowerCase() === filterVal.toLowerCase()
            );
        }
    }
    return list;
}

const PORT = process.env.PORT || 8000;
app.listen(PORT);
