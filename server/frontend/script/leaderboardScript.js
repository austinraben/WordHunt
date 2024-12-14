/*
leaderboardScript.js
Client-side JavaScript for leaderboard.html (the Word Hunt global leaderboard)
*/

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const dateSelect = document.getElementById("date-select");
    const languageSelect = document.getElementById("language-select");
    const homeBtn = document.getElementById("home-btn");

    // Determine the base URL
    const baseHost = window.location.host;
    let baseURL;

    if (baseHost === "64.23.152.52:3000") {
        baseURL = "http://64.23.152.52:3000";
    } else {
        baseURL = "http://www.DailyWordHunt.com";
    }

    // Populate the date dropdown with the last 7 days
    if (dateSelect) {
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            const option = document.createElement("option");
            option.value = date.getDate();
            option.textContent = `${date.getMonth() + 1}/${date.getDate()}`;  // Display MM/DD
            dateSelect.appendChild(option);
        }

        dateSelect.value = today.getDate(); // Set today's date as default dropdown
        dateSelect.addEventListener("change", updateLeaderboard);
    } else {
        console.error("Date dropdown (date-select) not found in the DOM.");
    }

    // Event listener for language changes
    if (languageSelect) {
        languageSelect.addEventListener("change", () => {
            console.log("Selected language:", languageSelect.value);
            updateLeaderboard();
        });
    } else {
        console.error("Language dropdown (language-select) not found in the DOM.");
    }

    // Event listener for home button
    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            window.location.href = baseURL;
        });
    }

    // Fetch the leaderboard for the default date and language
    updateLeaderboard();
});

// Fill the table with username and pre-sorted score information
function fillTable(data) {
    const leaderboardTable = document.getElementById("box").getElementsByTagName("table")[0];
    leaderboardTable.innerHTML = `
        <tr>
            <th id="user" class="userCol">Username</th>
            <th id="score" class="scoreCol">Score</th>
            <th id="words" class="wordsCol">Total Words</th>
            <th id="longest-word" class="longestWordCol">Longest Word</th>
        </tr>
    `; // Clear previous data and set table headers

    if (!Array.isArray(data.users)) {
        console.error("Unexpected data structure: users is not an array.", data);
        return;
    }

    if (data.users.length > 0) {
        // Populate table rows
        data.users.forEach((user) => {
            const row = document.createElement("tr");

            const usernameCell = document.createElement("td");
            usernameCell.textContent = user.name || "Unknown";
            row.appendChild(usernameCell);

            const scoreCell = document.createElement("td");
            scoreCell.textContent = user.score || 0;
            row.appendChild(scoreCell);

            const wordsCell = document.createElement("td");
            wordsCell.textContent = user.totalWords || 0;
            row.appendChild(wordsCell);

            const longestWordCell = document.createElement("td");
            longestWordCell.textContent = user.longestWord || "N/A";
            row.appendChild(longestWordCell);

            leaderboardTable.appendChild(row);
        });
    } else {
        console.log("No users data available for the selected date and language.");
        const row = document.createElement("tr");
        const noDataCell = document.createElement("td");
        noDataCell.textContent = "No leaderboard data available.";
        noDataCell.colSpan = 4;
        noDataCell.style.textAlign = "center";
        row.appendChild(noDataCell);
        leaderboardTable.appendChild(row);
    }
}

// Fetch leaderboard data based on selected date and language
async function updateLeaderboard() {
    const dateSelect = document.getElementById("date-select");
    const languageSelect = document.getElementById("language-select");

    // Default: today's date and English
    const date = dateSelect.value || new Date().getDate();
    const language = languageSelect.value || "English";
    const url = `/api/scores?date=${date}&language=${language}`;

    console.log(`Requesting leaderboard for date: ${date}, language: ${language}`);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Leaderboard data fetched:", responseData);
        fillTable(responseData);

    } catch (error) {
        console.error("Error fetching leaderboard data:", error.message);
    }
}
