/**
 * Controls the tab switching in index.html
 * Source: https://www.w3schools.com/w3css/w3css_tabulators.asp
 */

function openTab(item) {
    var i;
    var x = document.getElementsByClassName("tab");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    document.getElementById(item).style.display = "block";
}
