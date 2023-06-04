"use strict";

/**
 * @author Pearl Chen
 * CS 132 Spring 2023
 *
 * Node/Express for Caltech Donut API
 */

const express = require("express");
const app = express();

// if serving front-end files in public/
app.use(express.static("public"));

// if handling different POST formats
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(multer().none());

// app.get/app.post endpoints
app.get("/", (req, res) => {
    res.send("data-scraper/scraped-data.json");
});

app.get("/users", (req, res) => {
    console.log("hi");
    let major = req.query["major"];
    let house = req.query["house"];
    let graduation = req.query["graduation"];
    let gender = req.query["gender"];
});

// helper functions

const PORT = process.env.PORT || 8000;
app.listen(PORT);
