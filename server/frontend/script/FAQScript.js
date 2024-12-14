/*
FAQScript.js
Client-side JavaScript for FAQ.html (help page interface)
*/

document.addEventListener("DOMContentLoaded", () => {
    const homeBtn = document.getElementById("home-btn");

    // Event listener for home button
    homeBtn.addEventListener("click", () => {
        window.location.href = `http://localhost:3000`;
    });

});