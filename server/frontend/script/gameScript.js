/*
gameScript.js
Client-side JavaScript for game.html (word hunt interface)
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
    const skipButton = document.getElementById("skip-btn");
    const hideExplanation = document.getElementById("explanation");


    // Global variables
    let score = 0;
    let currentWord = "";       
    let selectedLetters = [];  
    let wordsFound = [];     
    let dictionaries = { english: [], german: [] }; 
    let gridId = null; // Declare a global variable to store gridId
    let params = new URLSearchParams(window.location.search);
    let selectedLanguage = params.get("lang");
    let username = params.get("user");

    // Load dictionaries using a promise
    Promise.all([
        fetch("/English.txt").then((res) => res.text()),
        fetch("/German.txt").then((res) => res.text())
    ])
        // Words are separated by a new line
        .then(([englishData, germanData]) => {
            dictionaries.english = englishData
                .split("\n")
                .map((word) => word.trim().toLowerCase());

            dictionaries.german = germanData
                .split("\n")
                .map((word) => word.trim().toLowerCase());
        })
        .catch((err) => console.error("Error loading dictionaries:", err));

    // Function to fetch daily grid data from backend
    function fetchGrid() {    
        fetch(`/get-daily-grid?lang=${selectedLanguage}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.grid && data.grid.length === 4) {
                    generateGrid(data.grid);
                    gridId = data.gridId;
                } else {
                    console.error("Invalid grid data:", data);
                }
            })
            .catch((err) => console.error("Error fetching grid:", err));
    }   

    // Function to generate the daily grid in the DOM
    function generateGrid(gridData) {
        const grid = document.getElementById("game-grid");
        grid.innerHTML = ""; 

        gridData.forEach((row, rowIndex) => {
            row.forEach((letter, colIndex) => {
                const cell = document.createElement("div");
                cell.textContent = letter.toUpperCase();
                cell.classList.add("grid-cell");
                cell.dataset.index = `${rowIndex}-${colIndex}`;
                grid.appendChild(cell);

                // Event listeners for interacting with the grid
                cell.addEventListener("click", () => handleCellClick(cell));
                cell.addEventListener("mouseover", () => handleCellHover(cell));
            });
        });
    }

    // Event listener to execute the 'Ready' button
    readyButton.addEventListener("click", () => {
        readyButton.parentElement.classList.add("hidden");
        readyButton.classList.add("hidden");
        hideExplanation.style.display = "none";
        gameBoard.classList.remove("hidden");
        skipButton.classList.remove("hidden");

        fetchGrid();
        startTimer();
    });
    
    // Start the countdown timer: 100 seconds
    let timer = 100;
    let timerInterval = null;   
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

    usernameDisplay.textContent = `Player: ${username}`;

    // Event listener for 'Homepage' button
    homeBtn.addEventListener("click", () => {
        window.location.href = `http://localhost:3000`;
    });

    // Event listener for 'Skip to End' button
    skipButton.addEventListener("click", () => {
        timer = 0; // Set time to 0
        clearInterval(timerInterval); 
        endGame(); 
    });    

    // Click on a letter once to begin forming a word, then again to finalize a word
    function handleCellClick(cell) {
        if (selectedLetters.includes(cell)) {
            finalizeWord();
        } else {
            addToWord(cell);
        }
    }

    // Hover over letters to add to a word
    function handleCellHover(cell) {
        if (
            selectedLetters.length > 0 &&
            isNeighbor(selectedLetters[selectedLetters.length - 1], cell) &&
            !selectedLetters.includes(cell)
        ) {
            addToWord(cell);
        }
    }

    // Check if two cells are neighbors
    function isNeighbor(cell1, cell2) {
        const [row1, col1] = cell1.dataset.index.split("-").map(Number);
        const [row2, col2] = cell2.dataset.index.split("-").map(Number);
        return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1;
    }

    // Add a letter to the current word and mark all its letters as green if a valid word
    function addToWord(cell) {
        selectedLetters.push(cell);
        currentWord += cell.textContent;
        currentWordDisplay.textContent = currentWord;

        // A word is valid if more than 3 letters in the dictionary and not already found
        const isValidWord = currentWord.length >= 3 &&
            dictionaries[selectedLanguage.toLowerCase()].includes(currentWord.toLowerCase()) &&
            !wordsFound.includes(currentWord.toLowerCase());

        selectedLetters.forEach((letter) => {
            letter.classList.remove("valid", "invalid", "formingWord"); // Remove all potential classes first
            if (isValidWord) {
                letter.classList.add("valid");
            }
            else if (wordsFound.includes(currentWord.toLowerCase())) {
                letter.classList.add("invalid");
            }
            else {
                letter.classList.add("formingWord");
            }
        });
    }

    // Process a completed word and decide whether to add points
    function finalizeWord() {
        if (
            currentWord.length >= 3 &&
            dictionaries[selectedLanguage.toLowerCase()].includes(currentWord.toLowerCase()) &&
            !wordsFound.includes(currentWord.toLowerCase())
        ) {
            // If the word is valid, update the wordsFound list, and the word-count and score displays
            wordsFound.push(currentWord.toLowerCase());
            score += calculateWordScore(currentWord);
            document.getElementById("word-count-display").querySelector("span").textContent = wordsFound.length;
            document.getElementById("score-display").querySelector("span").textContent = score;
        }

        // Reset current word to allow for a new word
        selectedLetters.forEach((letter) => letter.classList.remove("valid", "invalid", "formingWord", "selected"));
        selectedLetters = [];
        currentWord = "";
        currentWordDisplay.textContent = "";
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

    // End the game, saving scores and redirecting to leaderboard page
    function endGame() {
        // Find the user's longest word found
        const longestWord = wordsFound.reduce((a, b) => (a.length > b.length ? a : b), '');
        const totalWords = wordsFound.length; 
    
        fetch("/save-score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: username,
                score: score,
                gridId: gridId, 
                language: selectedLanguage,
                longestWord: longestWord, 
                totalWords: totalWords    
            }),
        })
            .then((response) => response.text())
            .then((data) => {
                console.log("Score saved successfully:", data);
                
                // Redirect to the leaderboard
                window.location.href = `/leaderboard?lang=${selectedLanguage}&user=${username}`;
            })
            .catch((err) => console.error("Error saving score:", err));
    }    
});