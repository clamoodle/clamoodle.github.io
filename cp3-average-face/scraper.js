/**
 * Data scraper for Donut director page, returns a csv table of users, image URLs, majors, houses,
 * and respective id values.
 *
 * https://www.scrapingbee.com/blog/web-scraping-javascript/
 * https://github.com/puppeteer/puppeteer/blob/v3.0.2/docs/api.md
 * can't install puppeteer in Chrome console :P
 * https://stackoverflow.com/questions/6375461/get-html-code-using-javascript-with-a-url#:~:text=Use%20jQuery%3A,This%20data%20is%20your%20HTML.
 * https://stackoverflow.com/questions/7474354/include-jquery-in-the-javascript-console
 *
 */
const puppeteer = require("puppeteer")(function () {
    function init() {
        try {
            const anchors = document.querySelectorAll(
                "table.table.table-striped.table-condensed a"
            );
            let data = [];

            anchors.forEach(async (a) => {
                const URL = a.href;
                // const browser = await puppeteer.launch();
                // const page = await browser.newPage();
                // await page.goto(URL);
                $.ajax({
                    url: URL,
                    success: function (data) {
                        // Fields: name, gender, graduation, option, house, image
                        let userInfo = {};

                        // The $ method runs document.querySelector within the page. If no element matches the
                        // selector, the return value resolves to null. Returns <Promise<?ElementHandle>>.

                        // Name
                        // textContent returns unwanted \n and \t's
                        const name = page.$("h2.pos-left").innerText;
                        userInfo["name"] = name;

                        // // Screenshot of image, saves to techers-imgs
                        // const imgRect = page.$(".col-md-4 > img").getBoundingClientRect();
                        // page.screenshot(
                        //     (path =
                        //         "C:/Users/31415/OneDrive/Desktop/stuff/caltech%20hw/cs132/clamoodle.github.io/cp3-average-face/techers-imgs/"),
                        //     (clip = {
                        //         x: imgRect.x,
                        //         y: imgRect.y,
                        //         width: imgRect.width,
                        //         height: imgRect.height,
                        //     })
                        // );

                        // Save image URL
                        const imgURL = page.$(".col-md-4 > img").src;
                        userInfo["img URL"] = imgURL;

                        // Gender, graduation, option, house
                        const infoTxt = page.$("ul.list-group.list-group-root").innerText;
                        const lines = infoTxt.split("\n");

                        // Accounting for unaffiliated house memberships
                        let affiliations = [];

                        for (let i = 0; i < lines.length; i++) {
                            const l = lines[i];

                            switch (l.slice(0, 6)) {
                                case "Gender":
                                    userInfo["gender"] = l.slice(8); // e.g. "Female"
                                case "Gradua":
                                    userInfo["graduation"] = l.slice(12); // e.g. "2024"
                                case "Option":
                                    let major = lines[i + 1]; // e.g. "Computer Science (Major)"
                                    userInfo["option"] = major.slice(0, -8);
                                case "House:":
                                    // We're only counting full memberships, too lazy to implement but idea
                                    // can be to do 0.5 weight for socials in facial averaging
                                    let j = 1;
                                    while (lines[i + j].slice(-11) === "Full Member") {
                                        affiliations.push(lines[i + j].slice(0, -14));
                                        j++;
                                    }
                            }
                        }

                        // Checking for unaffiliated
                        if (!affiliations[0]) {
                            affiliations.push("unaffiliated");
                        }

                        userInfo["house"] = affiliations;
                    },
                });
            });
        } catch (error) {
            console.log(error);
        }
    }

    init();
})();
