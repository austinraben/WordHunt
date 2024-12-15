/*
welcomeScript.js
Client-side JavaScript for index.html (welcome page)

*/

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const usernameInput = document.getElementById("username");
    const gameBtn = document.getElementById("game-btn");
    const leaderboardBtn = document.getElementById("leaderboard-btn");
    const usernameExistsDiv = document.getElementById("username-exists");
    const continueBtn = document.getElementById("continue-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    const faqBtn = document.getElementById("faq-btn");

    // Event listener for the "Leaderboard" button
    leaderboardBtn.addEventListener("click", () => {
        navigateTo("leaderboard");
    });

    // Event listener for the "Game" button
    gameBtn.addEventListener("click", () => {
        navigateTo("game");
    });

    // Event listener for the "FAQ" button
    faqBtn.addEventListener("click", () => {
        window.location.href = `/FAQ`;
    });

    // Enable game button upon username input
    usernameInput.addEventListener("input", () => {
        const username = usernameInput.value.trim().toLowerCase()
        gameBtn.disabled = username === "";
    });



    // Event listener for "Game" button
    document.getElementById("welcome-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = usernameInput.value.trim().toLowerCase();
        const today = new Date().getDate();

        // Fetch username to check if they already played today
        try {
            const response = await fetch("/create-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, date: today }),
            });

            // If conflict response, show "username-exists" prompt
            if (response.status === 409) {
                usernameExistsDiv.classList.remove("hidden");
            } else if (response.ok) {
                navigateTo("game");
            } else {
                console.error("Unexpected response status:", response.status);
            }
        } catch (err) {
            console.error("Error checking username:", err);
        }
    });

    // Event listener for the "Yes" button (when username exists)
    continueBtn.addEventListener("click", () => {
        usernameExistsDiv.classList.add("hidden");
        navigateTo("game");
    });

    // Event listener for the "No" button (when username exists)
    cancelBtn.addEventListener("click", () => {
        usernameInput.value = "";
        gameBtn.disabled = true;
        usernameExistsDiv.classList.add("hidden");
    });

    // Function to navigate to the appropriate page (game or leaderboard)
    function navigateTo(mode) {
        const language = document.getElementById("language-select").value;
        const username = usernameInput.value.trim().toLowerCase();

        window.location.href = `http://localhost:3000/${mode}?lang=${language}&user=${username}`;
    }
});
