"use strict";

/* File comment */

const express = require("express");
// other modules you use
// program constants

const app = express();
// if serving front-end files in public/
app.use(express.static('public')); 

// if handling different POST formats
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(multer().none());

// app.get/app.post endpoints

// helper functions

const PORT = process.env.PORT || 8000;
app.listen(PORT);
