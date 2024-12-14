/*
gameScript.js
Client-side JavaScript for game.html (word hunt interface)
*/

document.addEventListener("DOMContentLoaded", () => {
    // Initialize DOM Elements
    const readyButton = document.getElementById("ready-button");
    const gameBoard = document.getElementById("game-board");
    const timerDisplay = document.getElementById("time-remaining");
    const currentWordDisplay = document.getElementById("current-word");
    const usernameDisplay = document.getElementById("username-display");
    const homeBtn = document.getElementById("home-btn");
    const skipButton = document.getElementById("skip-btn");
    const hideExplanation = document.getElementById("explanation");
    const warning = document.getElementById("warning-alert");
    const continueBtn = document.getElementById("continueBtn");
    const exitBtn = document.getElementById("exitBtn");
    const grid = document.getElementById("game-grid");

    // Initialize global variables
    let score = 0;
    let currentWord = "";
    let selectedLetters = [];
    let wordsFound = [];
    let dictionaries = { english: [], german: [] };
    let gridId = null;
    let params = new URLSearchParams(window.location.search);
    let selectedLanguage = params.get("lang");
    let username = params.get("user");
    let readyClicked = false;
    let warningDisplay = false;
    let touchedLetters = [];
    let currentTouchWord = "";
    let mouseIsDown = false;

    // Is the user using mobile (touch-based) or computer (click-based)
    const isMobile = isMobileDevice();
    function isMobileDevice() {
        return /Mobi|Android/i.test(navigator.userAgent);
    }    

    // Mobile: touch-based interaction
    if (isMobile) {

        // Start touching: Add letter to word
        grid.addEventListener("touchstart", (event) => {
            event.preventDefault();
            const cell = event.target.closest(".grid-cell");
            if (cell) {
                currentTouchWord += cell.textContent;
                addToWord(cell);
                touchedLetters = [cell];
            }
        });

        // Dragging a finger: Add letter to word if a neighbor
        grid.addEventListener("touchmove", (event) => {
            event.preventDefault(); 

            // Track if the finger is on a cell
            const touch = event.touches[0]; 
            const element = document.elementFromPoint(touch.clientX, touch.clientY); 
            if (!element) return; 

            const cell = element.closest(".grid-cell");
            if (cell && !touchedLetters.includes(cell)) {
                const lastCell = touchedLetters[touchedLetters.length - 1];
                if (lastCell && isNeighbor(lastCell, cell)) {
                    touchedLetters.push(cell);
                    currentTouchWord += cell.textContent;
                    addToWord(cell);
                    currentWordDisplay.textContent = currentTouchWord;
                }
            }
        });    
        
        // Lifting a finger: Finalize word
        grid.addEventListener("touchend", (event) => {
            event.preventDefault();
            if (touchedLetters.length > 0) {
                finalizeWord(touchedLetters, currentTouchWord, true);
            }

            touchedLetters = [];
            currentTouchWord = "";
        });

    // Desktop: "click and hold" OR "click twice" based interaction
    } else {

        // Mouse pressed down: Add letter to word 
        grid.addEventListener("mousedown", (event) => {
            const cell = event.target.closest(".grid-cell");
            if (cell) {
                mouseIsDown = true;  // Track if click is being held down
                addToWord(cell);
                clickedCell = cell;
            }
        });
        
        // Finger lifted off mouse click: finalize word
        document.addEventListener("mouseup", () => {
            if (mouseIsDown) {
                    finalizeWord(selectedLetters, currentWord, false);
            }
            mouseIsDown = false;
            clickedCell = null;
        });
        
        // Click is held down and hovering a letter: Add to word
        grid.addEventListener("mouseover", (event) => {
            if (mouseIsDown) {
                const cell = event.target.closest(".grid-cell");
                if (cell && !selectedLetters.includes(cell)) {
                    handleCellHover(cell);
                }
            }
        });
    }  
    
    // Is the URL the IP address or domain name
    const baseHost = window.location.host;
    let baseURL;

    if (baseHost === "64.23.152.52:3000") {
        baseURL = "http://64.23.152.52:3000";
    } else {
        baseURL = "http://www.DailyWordHunt.com";
    }

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

                // Event listeners for cell hovering
                cell.addEventListener("mouseover", () => handleCellHover(cell));
            });
        });
        grid.classList.remove("hidden");
    }

    // Event listener to execute the 'Ready' button
    if (readyButton) {
        readyButton.addEventListener("click", () => {
            readyClicked = true;
            readyButton.parentElement.classList.add("hidden");
            readyButton.classList.add("hidden");
            hideExplanation.style.display = "none";
            gameBoard.classList.remove("hidden");
            skipButton.classList.remove("hidden");

            fetchGrid();
            startTimer();
        });
    }

    warning.style.display = "none";
    // If homepage button is clicked give warning before return to index.html 
    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            if (readyClicked) {
                warning.classList.remove("hidden");
                warning.style.display = "block";
            } else {
                window.location.href = baseURL;
            }
        });
    }

    // If exit button is clicked, return to index.html
    if (exitBtn) {
        exitBtn.addEventListener("click", () => {
            window.location.href = baseURL;
        });
    }

    // If continue button is clicked, stay on the website
    if (continueBtn) {
        continueBtn.addEventListener("click", () => {
            warning.style.display = "none";
            warningDisplay = false;
        });
    }

    // Event listener for 'Skip to End' button
    if (skipButton) {
        skipButton.addEventListener("click", () => {
            timer = 0;
            clearInterval(timerInterval);
            endGame();
        });
    }

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

    // Display the user's name
    usernameDisplay.textContent = `Player: ${username}`;  

    // Hover over letters to add to a word
    function handleCellHover(cell) {
        if (!cell || !selectedLetters.length) return;
        const lastCell = selectedLetters[selectedLetters.length - 1];
        if (isNeighbor(lastCell, cell) && !selectedLetters.includes(cell)) {
            addToWord(cell);
        }
    }

    // Check if two cells are neighbors
    function isNeighbor(cell1, cell2) {
        if (!cell1 || !cell2) return false;
        const [row1, col1] = cell1.dataset.index.split("-").map(Number);
        const [row2, col2] = cell2.dataset.index.split("-").map(Number);
        const result = Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1;
        return result;
    }

    // Add a letter to the current word and mark all its letters as green if a valid word
    function addToWord(cell) {
        if (selectedLetters.includes(cell)) {
            return;  // Prevent adding the same cell again (cheating!)
        }

        selectedLetters.push(cell);
        currentWord += cell.textContent;

        currentWordDisplay.textContent = currentWord;
    
        // A word is valid if it has 3+ letters, is in the dictionary, and isn't already found
        const isValidWord = currentWord.length >= 3 &&
            dictionaries[selectedLanguage.toLowerCase()].includes(currentWord.toLowerCase()) &&
            !wordsFound.includes(currentWord.toLowerCase());

        // Update the styling for the current letters
        selectedLetters.forEach((letter) => {
            letter.classList.remove("valid", "invalid", "formingWord", "selected");
            if (isValidWord) {
                letter.classList.add("valid");
            } else if (wordsFound.includes(currentWord.toLowerCase())) {
                letter.classList.add("invalid");
            } else {
                letter.classList.add("formingWord");
            }
        });
    }

    // Process a completed word and decide whether to add points
    function finalizeWord(letters = selectedLetters, word = currentWord, isTouch = false) {            
        if (
            word.length >= 3 &&
            dictionaries[selectedLanguage.toLowerCase()].includes(word.toLowerCase()) &&
            !wordsFound.includes(word.toLowerCase())
        ) {
            // If the word is valid, update the wordsFound list, and the word-count and score displays
            wordsFound.push(word.toLowerCase());
            score += calculateWordScore(word);
            document.getElementById("word-count-display").querySelector("span").textContent = wordsFound.length;
            document.getElementById("score-display").querySelector("span").textContent = score;
        } else {
            console.log("finalizeWord - Word is invalid or already found:", word);
        }
    
        // Reset the letters and word
        letters.forEach((letter) => {
            letter.classList.remove("valid", "invalid", "formingWord", "selected");
        }); 

        selectedLetters = [];
        currentWord = "";
        currentWordDisplay.textContent = "";
        if (isTouch) {
            touchedLetters.forEach((cell) => {
                cell.classList.remove("valid", "invalid", "formingWord", "selected");
            });
            touchedLetters = [];
            currentTouchWord = "";
        }
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