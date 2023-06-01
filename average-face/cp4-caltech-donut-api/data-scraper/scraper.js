/**
 * @author Pearl Chen
 * CS132 Spring 2023
 *
 * Data scraper for Donut director page, returns a csv table of users, image URLs, majors, houses,
 * and respective id values.
 *
 * https://www.scrapingbee.com/blog/web-scraping-javascript/
 * https://github.com/puppeteer/puppeteer/blob/v3.0.2/docs/api.md
 * https://www.npmjs.com/package/puppeteer
 */

import puppeteer from "puppeteer";
import fs from "fs/promises";

(function () {
    const LOGIN_URL = "https://donut.caltech.edu/login";
    const LOGIN_CREDENTIALS_PATH = "donut-login.json";

    // We're getting the directory URLs manually by class graduation year, showing results no images
    // 40 resutls per page. These are all the classes that would be in school during which the
    // author (PEARL CHEN!!!!) is besides the class of 2027 (too young smh).
    const DIRECTORY_URLS = {
        2021: "https://donut.caltech.edu/1/users?page=1&name=&house_id=&option_id=&building_id=&grad_year=2021&username=&email=&timezone_from=&timezone_to=&total=236&per_page=40",
        2022: "https://donut.caltech.edu/1/users?page=1&name=&house_id=&option_id=&building_id=&grad_year=2022&username=&email=&timezone_from=&timezone_to=&total=231&per_page=40",
        2023: "https://donut.caltech.edu/1/users?page=1&name=&house_id=&option_id=&building_id=&grad_year=2023&username=&email=&timezone_from=&timezone_to=&total=287&per_page=40",
        2024: "https://donut.caltech.edu/1/users?page=1&name=&house_id=&option_id=&building_id=&grad_year=2024&username=&email=&timezone_from=&timezone_to=&total=253&per_page=40",
        2025: "https://donut.caltech.edu/1/users?page=1&name=&house_id=&option_id=&building_id=&grad_year=2025&username=&email=&timezone_from=&timezone_to=&total=281&per_page=40",
        2026: "https://donut.caltech.edu/1/users?page=1&name=&house_id=&option_id=&building_id=&grad_year=2026&username=&email=&timezone_from=&timezone_to=&total=238&per_page=40",
    };

    const SAVE_TO_PATH = "scraped-data.json";
    const IMG_SAVE_TO_PATH = "user-imgs/";

    /**
     * Opens the Donut directory, logs in, and then crawls the directory page in DIRECTORY_URL
     * All data scraped will be saved to SAVE_TO_PATH
     */
    async function init() {
        try {
            // Source: https://developer.chrome.com/articles/new-headless/
            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();

            // Set screen size
            await page.setViewport({ width: 1920, height: 1080 });

            // Log In
            await loginToDonut(page, LOGIN_CREDENTIALS_PATH);

            // Crawl and scrape in directory page, flipping through each page for each year
            let users = [];
            for (const year in DIRECTORY_URLS) {
                const url = DIRECTORY_URLS[year];
                console.log("\n Scraping class info for class of " + year + "...");

                let nextURL = url;
                while (nextURL) {
                    nextURL = await crawlDirectory(page, nextURL, users);
                }
            }

            // Save to JSON
            let data = {};
            data["users"] = users;
            await saveData(SAVE_TO_PATH, data);

            // Close browser
            await browser.close();
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Logs into Donut.caltech.edu by reading the credentials from a JSON file in directory
     * @param {Page} page - Puppeteer page to log in on
     * @param {String} credsPath - path to JSON file with fields 'username' and 'password'
     */
    async function loginToDonut(page, credsPath) {
        await page.goto(LOGIN_URL);

        // Getting login credentials
        // Reference: https://nodejs.dev/en/learn/reading-files-with-nodejs/
        const content = await fs.readFile(credsPath, { encoding: "utf8" });
        const login = JSON.parse(content);

        // Typing Login credentials
        await page.type("#username", login.username);
        await page.type("#password", login.password);

        // Submit login
        // Format source: https://stackoverflow.com/questions/50074799/how-to-login-in-puppeteer
        await Promise.all([
            page.click("button[type='submit']"),
            page.waitForNavigation({ waitUntil: "networkidle0" }),
        ]);
    }

    /**
     * Scraping one donut user page to populate one index in data
     * @param {Page} page - Puppeteer page to open the details page on
     * @param {String} url - URL of the details page
     * @return {JSON} - Fields: name, gender, graduation, option, house, imageURL
     */
    async function scrapeIndividualPage(page, url) {
        await page.goto(url);
        let userInfo = {};

        // Name
        const name = await page.evaluate(
            // textContent returns unwanted \n and \t's so we're using innerText
            () => document.querySelector("h2.pos-left").innerText
        );
        userInfo["name"] = name;

        // Save image URL
        const img = await page.evaluate(() => document.querySelector(".col-md-4 > img"));
        if (img) {
            userInfo["imageURL"] = await page.evaluate(
                () => document.querySelector(".col-md-4 > img").src
            );

            // Screenshot and save image path
            const userId = url.slice(-5); // e.g. '5821'
            const imgPath = IMG_SAVE_TO_PATH + userId + ".png";

            const rect = await page.evaluate(() => {
                const { x, y, width, height } = document
                    .querySelector(".col-md-4 > img")
                    .getBoundingClientRect();
                return { x, y, width, height };
            });

            await page.screenshot({
                path: imgPath,
                clip: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            });

            userInfo["imagePath"] = imgPath;
        }

        // Gender, graduation, option, house
        const infoTxt = await page.evaluate(
            () => document.querySelector("ul.list-group.list-group-root").innerText
        );

        const lines = infoTxt.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const l = lines[i];
            switch (l.slice(0, 6)) {
                case "Gender":
                    userInfo["gender"] = l.slice(8); // e.g. "Female"
                case "Gradua":
                    userInfo["graduation"] = l.slice(12); // e.g. "2024"
                case "Option":
                    // We're only counting majors, too lazy to implement but idea
                    // can be to do 0.5 weight for minors in facial averaging
                    let k = 1;
                    let majors = [];
                    while (lines[i + k].slice(-7) === "(Major)") {
                        let major = lines[i + k]; // e.g. "Computer Science (Major)"
                        majors.push(major.slice(0, -8));
                        k++;
                    }
                    userInfo["option"] = majors;
                case "House:":
                case "Houses":
                    // We're only counting full memberships, too lazy to implement but idea
                    // can be to do 0.5 weight for socials in facial averaging
                    let j = 1;
                    let affiliations = [];
                    while (lines[i + j].slice(-11) === "Full Member") {
                        affiliations.push(lines[i + j].slice(0, -14));
                        j++;
                    }
                    // Accounting for unaffiliated house memberships
                    if (!affiliations[0]) {
                        affiliations.push("unaffiliated");
                    }
                    userInfo["house"] = affiliations;
            }
        }

        return userInfo;
    }

    /**
     * Crawling and scraping one donut main directory page to visit all 40 users in the list
     * @param {Page} page - Puppeteer page to crawl on
     * @param {String} directoryURL - the URL to the directory with overview of many users
     * @param {Array} arrayToPopulate - the array to populate with a list of returns from
     * scrapeIndividualPage(page, url).
     * @return {String} - the href URL of the 'next page' button
     */
    async function crawlDirectory(page, directoryURL, arrayToPopulate) {
        await page.goto(directoryURL);

        // URL of next page button
        const nextPageURL = await page.evaluate(
            () => document.querySelector("a.page-link[aria-label='Next']").href
        );

        // Get list of URLs to visit individually
        const links = await page.evaluate(() =>
            Array.from(
                document.querySelectorAll("table.table.table-striped.table-condensed a"),
                (a) => a.href
            )
        );

        // Visiting each user specific page
        for (let i = 0; i < links.length; i++) {
            const userInfo = await scrapeIndividualPage(page, links[i]);
            arrayToPopulate.push(userInfo);

            // Progress ticker
            // Source: https://www.geeksforgeeks.org/how-to-print-console-without-trailing-newline-in-node-js/
            process.stdout.write(`.`);
        }

        return nextPageURL;
    }

    /**
     * Save JSON data to specified path as JSON file.
     * @param {String} saveToPath - the path to save the new JSON file to
     * @param {JSON} data - the JSON data to be saved
     */
    async function saveData(saveToPath, data) {
        await fs.writeFile(saveToPath, JSON.stringify(data), { encoding: "utf8" });

        console.log("\n Data saved to " + SAVE_TO_PATH + "!");
    }

    init();
})();
