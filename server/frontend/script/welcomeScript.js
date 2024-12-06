/*
Author: Austin Raben
Description: Script for the welcome page of Word Hunt. 
It handles working username input, existing user prompts, language selection, and 
navigation to the game or leaderboard pages.
*/

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const usernameInput = document.getElementById("username");
    const gameBtn = document.getElementById("game-btn");
    const leaderboardBtn = document.getElementById("leaderboard-btn");
    const usernameExistsDiv = document.getElementById("username-exists");
    const continueBtn = document.getElementById("continue-btn");
    const cancelBtn = document.getElementById("cancel-btn");

    // Pretend database of existing usernames (replace this with real database later)
    const mockDatabase = ["Austin", "Maya", "Tim"];

    // Enable game and leaderboard buttons once username is filled
    usernameInput.addEventListener("input", () => {
        const username = usernameInput.value.trim().toLowerCase()  // Remove spaces from start/end of the input

        gameBtn.disabled = username === "";        // Disable if input is empty
        leaderboardBtn.disabled = username === ""; // Disable if input is empty
    });

    // Event listener for form submission (pressing Enter or clicking "Game" button)
    document.getElementById("welcome-form").addEventListener("submit", (event) => {
        event.preventDefault();  // Stop the form from refreshing the page
        const username = usernameInput.value.trim().toLowerCase()  // Get the entered username, convert to lowercase

        // Check if the username exists in the mock database (case-insensitive)
        if (mockDatabase.some((storedUser) => storedUser.toLowerCase() === username)) {
            usernameExistsDiv.classList.remove("hidden");  // Make the div visible
        } else {
            // If the username doesn't exist, go straight to the game
            navigateTo("game");
        }
    });

    // Event listener for the "Leaderboard" button
    leaderboardBtn.addEventListener("click", () => {
        const language = document.getElementById("language-select").value;  // Get the selected language
        const username = usernameInput.value.trim();  // Get the entered username
        navigateTo("leaderboard");
    });

    // Event listener for the "Yes" button (when username exists)
    continueBtn.addEventListener("click", () => {
        usernameExistsDiv.classList.add("hidden");  // Hide the "username exists" message
        navigateTo("game");
    });

    // Event listener for the "No" button (when username exists)
    cancelBtn.addEventListener("click", () => {
        usernameInput.value = "";  // Clear username input field
        gameBtn.disabled = true;   // Disable the "Game" button
        leaderboardBtn.disabled = true;  // DIsable the "Leaderboard" button
        usernameExistsDiv.classList.add("hidden");  // Hide the "username exists" message
    });

    // Function to navigate to the appropriate page (game or leaderboard)
    function navigateTo(mode) {
        const language = document.getElementById("language-select").value;  // Get the selected language
        const username = usernameInput.value.trim();  // Get the selected username

        // Redirect the user to the appropriate path with parameters in the URL
        window.location.href = `http://localhost:5000/welcome/${mode}?lang=${language}&user=${username}`;
    }
});
