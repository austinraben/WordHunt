/*
Description: Client-side script for the Word Hunt game.
Handles game initialization, word formation logic, word validation,
timer functionality, user interactions with the game grid, and
displaying results at the end of the game.
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
    const usernameDisplay = document.getElementById("username-display");
    const homeBtn = document.getElementById("home-btn");
    const warning = document.getElementById("warning-alert");
    const continueBtn = document.getElementById("continue");
    const exitBtn = document.getElementById("exit");

    // Retrieve the selected language and username from URL query parameters
    const params = new URLSearchParams(window.location.search);
    const selectedLanguage = params.get("lang") || "english";
    const username = params.get("user") || "Guest";
    usernameDisplay.textContent = `Player: ${username}`;

    let timer = 100;            // Countdown timer in seconds
    let timerInterval = null;
    let score = 0;
    let currentWord = "";       // The word currently being formed
    let selectedLetters = [];   // To store selected letters for forming a word
    let wordsFound = [];        // Array to hold words found by the user
    let validWords = new Set(); // Use a set to avoid duplicates
    let dictionaries = { english: [], german: [] };
    let dictionariesLoaded = false;
    let warningDisplay = false;
    let readyClicked = false;

    warning.style.display = "none";

    // If homepage button is clicked give warning before return to index.html 
    homeBtn.addEventListener("click", () => {
        if (!warningDisplay && readyClicked) {
            warning.style.display = "block";
            warningDisplay = true;
        }
        else if(!warningDisplay){
            window.location.href = `http://localhost:3000`;
        }
      
    });

    exitBtn.addEventListener("click", () => {
        
        window.location.href = `http://localhost:3000`;
        
    });

    continueBtn.addEventListener("click", () => {
        
        warning.style.display = "none";
        warningDisplay = false;
        
    });



    // Load dictionaries
    Promise.all([
        fetch("/English.txt").then((res) => res.text()),
        fetch("/German.txt").then((res) => res.text())
    ])
        .then(([englishData, germanData]) => {
            dictionaries.english = englishData
                .split("\n")
                .filter((line) => !line.startsWith("#"))
                .map((word) => word.trim().toLowerCase());

            dictionaries.german = germanData
                .split("\n")
                .map((word) => word.trim().toLowerCase());

            dictionariesLoaded = true;
        })
        .catch((err) => console.error("Error loading dictionaries:", err));

    // Fetch the 4x4 grid from the backend
    function fetchGrid() {
        fetch('/get-daily-grid')
            .then((response) => response.json())
            .then((data) => {
                if (data.grid && data.grid.length === 4) {
                    generateGrid(data.grid);
                } else {
                    console.error("Invalid grid data:", data);
                }
            })
            .catch((err) => console.error("Error fetching grid:", err));
    }

    // Generate the grid in the DOM
    function generateGrid(gridData) {
        const grid = document.getElementById("game-grid");
        grid.innerHTML = ""; // Clear the grid

        gridData.forEach((row, rowIndex) => {
            row.forEach((letter, colIndex) => {
                const cell = document.createElement("div");
                cell.textContent = letter.toUpperCase();
                cell.classList.add("grid-cell");
                cell.dataset.index = `${rowIndex}-${colIndex}`;
                grid.appendChild(cell);

                // Event listeners
                cell.addEventListener("click", () => handleCellClick(cell));
                cell.addEventListener("mouseover", () => handleCellHover(cell));
            });
        });
    }

    // Handle cell click
    function handleCellClick(cell) {
        if (selectedLetters.includes(cell)) {
            finalizeWord();
        } else {
            addToWord(cell);
        }
    }

    // Handle cell hover
    function handleCellHover(cell) {
        if (
            selectedLetters.length > 0 &&
            isNeighbor(selectedLetters[selectedLetters.length - 1], cell) &&
            !selectedLetters.includes(cell)
        ) {
            addToWord(cell);
        }
    }

    // Add a letter to the current word
    function addToWord(cell) {
        selectedLetters.push(cell);
        currentWord += cell.textContent;
        currentWordDisplay.textContent = currentWord;

        const isValidWord = currentWord.length >= 3 &&
            dictionaries[selectedLanguage.toLowerCase()].includes(currentWord.toLowerCase()) &&
            !wordsFound.includes(currentWord.toLowerCase());

        selectedLetters.forEach((letter) => {
            letter.classList.remove("greyed-out", "valid");
            letter.classList.add(isValidWord ? "valid" : "greyed-out");
        });
    }

    // Finalize the current word
    function finalizeWord() {
        if (
            currentWord.length >= 3 &&
            dictionaries[selectedLanguage.toLowerCase()].includes(currentWord.toLowerCase()) &&
            !wordsFound.includes(currentWord.toLowerCase())
        ) {
            wordsFound.push(currentWord.toLowerCase());
            score += calculateWordScore(currentWord);
            document.getElementById("word-count-display").querySelector("span").textContent = wordsFound.length;
            document.getElementById("score-display").querySelector("span").textContent = score;
        }

        // Reset current word
        selectedLetters.forEach((letter) => letter.classList.remove("greyed-out", "valid", "selected"));
        selectedLetters = [];
        currentWord = "";
        currentWordDisplay.textContent = "";
    }

    // Check if two cells are neighbors
    function isNeighbor(cell1, cell2) {
        const [row1, col1] = cell1.dataset.index.split("-").map(Number);
        const [row2, col2] = cell2.dataset.index.split("-").map(Number);
        return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1;
    }

    // Start the countdown timer
    function startTimer() {
        timerInterval = setInterval(() => {
            timer--;
            timerDisplay.textContent = timer;

            if (timer <= 0) {
                clearInterval(timerInterval);
                endGame();
            }
        }, 1000);
    }

    // Calculate the score for a word
    function calculateWordScore(word) {
        const length = word.length;
        if (length === 3) return 100;
        if (length === 4) return 400;
        if (length === 5) return 800;
        if (length === 6) return 1400;
        return length >= 7 ? 1800 + (length - 7) * 400 : 0;
    }

    // Ready button click event
    readyButton.addEventListener("click", () => {
        readyButton.parentElement.classList.add("hidden");
        readyButton.classList.add("hidden");

        readyClicked = true;

        const hideExplanation = document.getElementById("explanation");

        hideExplanation.style.display = "none";

        gameBoard.classList.remove("hidden");

        fetchGrid();
        startTimer();
    });



    // End the game
    function endGame() {
        // Redirect to leaderboard when the game ends
        window.location.href = `/leaderboard?lang=${selectedLanguage}&user=${username}`;
    }
});