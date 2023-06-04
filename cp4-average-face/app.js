"use strict";

/**
 * @author Pearl Chen
 * CS 132 Spring 2023
 *
 * Node/Express for Caltech Donut API
 *
 * Refs:
 * https://expressjs.com/en/4x/api.html
 */

const express = require("express");
const fsp = require("fs/promises");
const app = express();

const USER_DATA_PATH = "data-scraper/scraped-data.json";
const IMG_FOLDER_PATH = "data-scraper/";

// if serving front-end files in public/
app.use(express.static("public"));

// if handling different POST formats
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(multer().none());

/*-------------------- app.get/app.post endpoints -------------------- */

app.get("/", (req, res) => {
    res.send("data-scraper/scraped-data.json");
    res.type("text");
});

app.get("/users/", readData, getFilteredUserData, (req, res) => {
    res.json(res.locals.data);
});

/*----------------------- Middleware Functions ----------------------- */

/**
 * Reads file at USER_DATA_PATH into JSON object into res.locals.data
 */
async function readData(req, res, next) {
    try {
        let data = await fsp.readFile(USER_DATA_PATH, "utf8");
        data = JSON.parse(data);
        res.locals.data = data;
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
}

/**
 * Filters entries in data.users and returns ones matching the query parameters into res.locals.data
 */
function getFilteredUserData(req, res, next) {
    let option = req.query.option;
    let house = req.query.house;
    let gender = req.query.gender;
    let graduation = req.query.graduation;

    // Check if no need to filter
    if (!option && !house && !gender && !graduation) {
        res.locals.data = res.locals.data.users;
        next();
    }

    // Filtering
    let matchingUsers = Array.from(res.locals.data.users); // Shallow copy
    // For loop index reversed to modify list by index
    for (let i = res.locals.data.users.length - 1; i >= 0; i--) {
        const user = res.locals.data.users[i];

        if (
            (option && !valueExists(user, "option", option)) ||
            (house && !valueExists(user, "house", house)) ||
            (gender && !valueExists(user, "gender", gender)) ||
            (graduation && !valueExists(user, "grduation", graduation))
        ) {
            // Delete 1 entry at index i
            console.log("deleting not matching user ", user.name)
            matchingUsers.splice(i, 1);
        }
    }
    res.locals.data = matchingUsers;
    res.locals.data.users = res.locals.data.filter()
    
    next();
}

/*------------------------- Helper Functions ------------------------- */

/**
 * Returns whether a value exists to some key in a dictionary, if key exists, or whether an entry
 * exists with the specified value in a list as the value to some key in the dictionary
 * @param {JSON} dict - the dictionary object in which we're looking for our key in
 * @param {String} key - the key we're searching for the corresponding value to
 * @param {String} value - the value we're looking to see if a match exists
 * @return {Boolean} if the value exists in the dictionary to the key
 */
function valueExists(dict, key, value) {
    value = value.toLowerCase();

    if (key in dict) {
        const val = dict[key];
        if (Array.isArray(val)) {
            return val.includes[value];
        }
        
        console.log(val.toLowerCase() === value);
        return val.toLowerCase() === value;
    }
    return false; // No matching key or value found
}

const PORT = process.env.PORT || 8000;
app.listen(PORT);
