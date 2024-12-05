/*
Description: Client-side script for the Word Hunt game. 
Handles game initialization, word formation logic, word validation,
timer functionality, user interactions with the game grid, and 
and displaying results at the end of the game. 
*/

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const readyButton = document.getElementById("ready-button");
    const gameBoard = document.getElementById("game-board");
    const timerDisplay = document.getElementById("time-remaining");
    const resultsScreen = document.getElementById("results-screen");
    const resultsContainer = document.getElementById("results-container");
    const wordList = document.getElementById("word-list");
    const continueButton = document.getElementById("continue-button");
    const currentWordDisplay = document.getElementById("current-word");

    // Retrieve the selected language from URL query parameter
    const params = new URLSearchParams(window.location.search);
    const selectedLanguage = params.get("lang") || "english";  // Default to English if no language is specified



    let timer = 100;            // Countdown timer in seconds
    let timerInterval;
    let score = 0;
    let currentWord = "";       // The word currently being formed
    let selectedLetters = [];   // To store selected letters for forming a word
    let wordsFound = [];        // Array to hold words found by the user
    let validWords = new Set(); // Use a set to avoid duplicates
    let dictionaries = { english: [], german: [] };

    // Load dictionary files using promises. .all ensures all are resolved before proceeding
    Promise.all([
        fetch("server/english.txt").then((res) => res.text()),
        fetch("server/german.txt").then((res) => res.text())
    ])
        .then(([englishData, germanData]) => {
            dictionaries.english = englishData.split("\n").map((word) => word.trim().toLowerCase());
            dictionaries.german = germanData.split("\n").map((word) => word.trim().toLowerCase());
        })
        .catch((err) => console.error("Error loading dictionaries: ", err));  // Should never reach here

    // Show game board and start timer once "Ready" is clicked
    readyButton.addEventListener("click", () => {
        document.getElementById("ready-container").classList.add("hidden");
        gameBoard.classList.remove("hidden");
        readyButton.style.display = 'none';
        generateGrid();  // Generate the grid
        findAllWords();  // Identify all valid words in the grid
        startTimer();    // Start the timer once the board is ready to be played
    });

    // Function to start the countdown timer
    function startTimer() {
        timerInterval = setInterval(() => {
            timer--;
            timerDisplay.textContent = timer;

            if (timer === 0) {
                clearInterval(timerInterval);
                endGame();
            }
        }, 1000);
    }

    // Generate a 4x4 grid (replace with backend data later)
    function generateGrid() {
        const grid = document.getElementById("game-grid");
        grid.innerHTML = ""; // Clear existing grid

        // Define letter pools for English and German
        const letterPools = {
            english: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            german: "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß"
        };

        // Select the appropriate letter pool based on the selected language
        const letters = letterPools[selectedLanguage.toLowerCase()] || letterPools.english;

        for (let i = 0; i < 16; i++) {
            const cell = document.createElement("div");
            cell.textContent = letters.charAt(Math.floor(Math.random() * letters.length));
            cell.classList.add("grid-cell");
            cell.dataset.index = i; // Assign a unique index to each cell for easy neighbor identification
            grid.appendChild(cell);

            // Add event listeners for selecting and hovering over letters
            cell.addEventListener("click", () => selectLetter(cell));
            cell.addEventListener("mouseover", () => hoverLetter(cell));
        }
    }

    // Function to select a letter and start forming a word
    function selectLetter(cell) {
        // If current word is empty, start forming it. Otherwise, finalize the current word
        if (!selectedLetters.includes(cell)) {
            addToWord(cell);
        } else {
            finalizeWord();
        }
    }

    // Add a letter to the current word
    function addToWord(cell) {
        // Only add a letter if it is the first letter, a neighbor of the previous letter, and not already selected
        if ((selectedLetters.length === 0 || isNeighbor(cell)) && !selectedLetters.includes(cell)) {
            currentWord += cell.textContent;
            selectedLetters.push(cell);
            cell.classList.add("selected");
            currentWordDisplay.textContent = currentWord;

            // If the current word is valid, mark all letters as valid
            if (validWords.has(currentWord.toLowerCase())) {
                // For each element in the array, mark all letters as valid (green) and remove selected
                selectedLetters.forEach((letter) => {
                    letter.classList.add("valid");
                    letter.classList.remove("selected");
                });

                // Calculate score based on word length
                const wordLength = currentWord.length;
                let wordScore = 0;

                score += calculateWordScore(currentWord);
                wordsFound.push(currentWord);
                currentWord = ""; // Reset the current word
                selectedLetters = []; // Reset selected letters
            }
        }
    }

    // Function to handle hovering over words
    function hoverLetter(cell) {
        // Add letter to word if not the first letter, not already selected and is a valid neighbor
        if (selectedLetters.length > 0 && !selectedLetters.includes(cell) && isNeighbor(cell)) {
            addToWord(cell);
        }
    }

    // Function to check if a cell is a neighbor of the last selected cell
    function isNeighbor(cell) {
        const lastCell = selectedLetters[selectedLetters.length - 1];
        const gridSize = 4;
        const lastIndex = parseInt(lastCell.dataset.index);
        const currentIndex = parseInt(cell.dataset.index);

        // Calculate the row difference between the two cells (|row # of last cell - row # of current cell|)
        const rowDifference = Math.abs(Math.floor(lastIndex / gridSize) - Math.floor(currentIndex / gridSize));

        // Calculate the column difference between the two cells (|col # of last cell - col # of current cell|)
        const colDifference = Math.abs((lastIndex % gridSize) - (currentIndex % gridSize));

        return rowDifference <= 1 && colDifference <= 1;  // Neighbor if within one row/column
    }

    // Finalize the current word
    function finalizeWord() {
        if (validWords.has(currentWord.toLowerCase())) {
            // If the word is valid, mark letters as green
            selectedLetters.forEach((cell) => {
                cell.classList.add("valid");
                cell.classList.remove("selected");
            });

            wordsFound.push(currentWord); // Store the valid word
        } else {
            // If the word is not valid, mark letters as grey
            selectedLetters.forEach((cell) => {
                cell.classList.add("greyed-out");
                cell.classList.remove("selected");
            });
        }

    // Reset for the next word
    currentWord = ""; // Clear the current word
    selectedLetters = []; // Reset selected letters
    currentWordDisplay.textContent = ""; // Clear the current word display
}


    // Find all valid words on the board
    function findAllWords() {
        // querySelectorAll selects all elements with class name 'grid-cell' and returns an array of strings of letters
        const grid = Array.from(document.querySelectorAll(".grid-cell")).map((cell) => cell.textContent);
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

        const dictionary = dictionaries[selectedLanguage.toLowerCase()] || dictionaries.english;

        // Recursive function to perform depth-first search to find all valid words
        function dfs(row, col, visited, word) {
            // If the current word is valid, add it to valid words array
            if (word.length > 2 && dictionaries.english.includes(word.toLowerCase())) {
                validWords.add(word.toLowerCase());
            }

            // Explore all neighbors of the current cell
            for (const [dx, dy] of directions) {
                const newRow = row + dx;
                const newCol = col + dy;
                const index = newRow * 4 + newCol;

                // Continue exploring if the new cell is within the grid boundaries and not visited already
                if (
                    newRow >= 0 && newRow < 4 &&
                    newCol >= 0 && newCol < 4 &&
                    !visited.has(index)
                ) {
                    // Mark the new cell as visited and perform DFS on it
                    visited.add(index);
                    dfs(newRow, newCol, visited, word + grid[index]);
                    visited.delete(index);
                }
            }
        }

        // Iterate through each cell in the 4x4 grid as a starting point for finding words
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const visited = new Set();  // Create a set to track unique visited cells for this DFS
                visited.add(row * 4 + col); // Mark the current cell as visited
                dfs(row, col, visited, grid[row * 4 + col]);  // Start a DFS traversal from the current cell
            }
        }
    }

    // End the game and display results
    function endGame() {
        // Hide the game board and show the results screen
        gameBoard.classList.add("hidden");
        resultsScreen.classList.add("visible");

        // Clear previous results from the results screen
        resultsContainer.innerHTML = "";

        // Add a header to the results screen
        const header = document.createElement("h2");
        header.textContent = "Your Results";
        resultsContainer.appendChild(header);

        // Display all found valid words and their scores
        const wordListElement = document.createElement("ul");
        wordsFound.forEach((word) => {
            const wordScore = calculateWordScore(word); 
            const listItem = document.createElement("li");
            listItem.textContent = `${word} (+${wordScore} points)`;
            wordListElement.appendChild(listItem);
        });
        resultsContainer.appendChild(wordListElement);

        // Display the final score
        const scoreDisplay = document.createElement("p");
        scoreDisplay.textContent = `Final Score: ${score}`;
        resultsContainer.appendChild(scoreDisplay);

        // Add a "Continue to Leaderboard" button
        const leaderboardButton = document.createElement("button");
        leaderboardButton.id = "continue-button";
        leaderboardButton.textContent = "Continue to Leaderboard";
        leaderboardButton.addEventListener("click", () => {
            window.location.href = "http://337WordHunt.com/leaderboard";
        });
        resultsContainer.appendChild(leaderboardButton);
    }

    // Calculate the score for a word based on its length
    function calculateWordScore(word) {
        const wordLength = word.length;
        if (wordLength === 3) return 100;
        if (wordLength === 4) return 400;
        if (wordLength === 5) return 800;
        if (wordLength === 6) return 1400;
        if (wordLength >= 7) return 1800 + 400 * (wordLength - 7);
        return 0; // Shouldn't happen since words < 3 are invalid
    }
});
