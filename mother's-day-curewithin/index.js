(function () {
    "use strict";

    /**
     * Initializes all event listeners in the page
     */
    function init() {
        // Tabs
        qs("#home-tab").addEventListener("click", ()=>{
            showTab("#home");
        });
        qs("#cm-tab").addEventListener("click", ()=>{
            showTab("#chinese-medicine");
        });
        qs("#about-tab").addEventListener("click", ()=>{
            showTab("#about");
        });
        qs("#services-tab").addEventListener("click", ()=>{
            showTab("#services");
        });
        qs("#products-tab").addEventListener("click", ()=>{
            showTab("#products");
        });
        qs("#contact-tab").addEventListener("click", ()=>{
            showTab("#contact");
        });

        // Button redirect
        qs("#simple-remedies").addEventListener("click", () => {
            window.open("https://simpleremedies.ca/");
        });
    }

    /**
     * Shows the selected tab and hides all others
     * @param {string}  - the CSS selector of the section to be shown
     */
    function showTab(selector) {
        // Hides currently shown tab
        qs("main>section:not(.hidden)").classList.add("hidden");

        // Shows selected tab
        qs(selector).classList.remove("hidden")
    }

    init();
})();
