/*
leaderboardScript.js
Client-side JavaScript for leaderboard.html (the Word Hunt global leaderboard)
*/

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const dateSelect = document.getElementById("date-select");
    const languageSelect = document.getElementById("language-select");
    const homeBtn = document.getElementById("home-btn");

    // Populate the date dropdown with the last 7 days
    if (dateSelect) {
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            const option = document.createElement("option");
            option.value = date.getDate();
            option.textContent = `${date.getMonth() + 1}/${date.getDate()}`; // Display as MM/DD
            dateSelect.appendChild(option);
        }

        dateSelect.value = today.getDate(); // Set today's date as default dropdown

        } else {
            console.error("Date dropdown (date-select) not found in the DOM");
        }

    // Event listener for date changes
    dateSelect.addEventListener("change", () => {
        updateLeaderboard();
    });

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
            window.location.href = `http://localhost:3000`;
        });
    }

    // Fetch the leaderboard for the default date and language
    updateLeaderboard();
});

// Fetch leaderboard data based on selected date and language
async function updateLeaderboard() {
    const date = document.getElementById("date-select").value; 
    const language = document.getElementById("language-select").value; 

    const url = `/api/scores?date=${date}&language=${language}`; 

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

// Fill the table with username and pre-sorted score information
function fillTable(data) {
    const leaderboardTable = document.getElementById("leaderboard-container").getElementsByTagName("table")[0];
    leaderboardTable.innerHTML = `
        <tr>
            <th id="user" class="userCol">Username</th>
            <th id="score" class="scoreCol">Score</th>
            <th id="words" class="wordsCol">Total Words</th>
            <th id="longest-word" class="longestWordCol">Longest Word</th>
        </tr>
    `;  // Clear previous data and set table headers

    // Fill each column with the appropriate data
    data.users.forEach((user) => {
        const row = document.createElement("tr");

        const usernameCell = document.createElement("td");
        usernameCell.textContent = user.name;
        row.appendChild(usernameCell);

        const scoreCell = document.createElement("td");
        scoreCell.textContent = user.score;
        row.appendChild(scoreCell);

        const wordsCell = document.createElement("td");
        wordsCell.textContent = user.totalWords; 
        row.appendChild(wordsCell);

        const longestWordCell = document.createElement("td");
        longestWordCell.textContent = user.longestWord || "N/A";
        row.appendChild(longestWordCell);

        leaderboardTable.appendChild(row);
    });
}