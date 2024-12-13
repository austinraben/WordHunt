/*
 * app.js
 * Word Hunt Backend Server
 * 
 * Dependencies: Express, Mongoose, Path
 * Port: 3000
*/

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/wordhunt')
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

// Import MongoDB schemas
const User = require('./user');
const WordGrid = require('./wordGrid');
const Score = require('./scores');


// Parse JSON
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve welcome, game, and leaderboard pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/game.html'));
});
app.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/leaderboard.html'));
});

// GET to find user details in 'User' schema
app.get('/get-user/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (user) res.status(200).json(user);
        else res.status(404).send('User not found');
    } catch (err) {
        res.status(400).send('Error retrieving user: ' + err.message);  // 400: Bad Request
    }
});

// GET to find daily grid information in 'WordGrid' schema
app.get('/get-daily-grid', async (req, res) => {
    try {
        const { lang } = req.query;
        const today = new Date().getDate();

        const grid = await WordGrid.findOne({ day: today, language: lang });

        if (grid) {
            res.status(200).json({ grid: grid.grid, gridId: grid._id });
        } else {
            res.status(404).send('Grid not found for the specified language.');
        }
    } catch (err) {
        res.status(500).send('Error retrieving grid: ' + err.message);  // 500: Internal Server Error
    }
});

// GET to find score information in 'Score' schema
app.get('/scores', async (req, res) => {
    try {
        const scores = await Score.find({});
        res.status(200).json(scores);
    } catch (err) {
        res.status(400).send('Error retrieving scores: ' + err.message);
    }
});

// GET to find scores in 'Score' schema and sort them for the leaderboard to display
app.get('/api/scores', async (req, res) => {
    try {
        const { date, language } = req.query;

        // If the daily word grid has not been generated, return empty user data
        const wordGrid = await WordGrid.findOne({ day: parseInt(date), language });
        if (!wordGrid) {
            console.log('No WordGrid found for date and language:', { date, language });
            return res.status(200).json({ users: [] });
        }

        const scores = await Score.find({ gridId: wordGrid._id });

        // Key: username; Value: score, longestWord, totalWords
        const userScores = {};
        scores.forEach((score) => {
            // Update user's scores if they earned a high score
            if (!userScores[score.username] || userScores[score.username].score < score.score) {
                userScores[score.username] = {
                    score: score.score,
                    longestWord: score.longestWord,
                    totalWords: score.totalWords
                };
            }
        });

        // .entries(): Convert userScores to an array of [username, data] pairs
        const sortedScores = Object.entries(userScores)
            // .map(): Transform each [username, data] pair into an object with name, score, longestWord, totalWords
            .map(([username, data]) => ({
                name: username,
                score: data.score,
                longestWord: data.longestWord,
                totalWords: data.totalWords
            }))
            // Arrange leaderboard entries in descending order by highest score
            .sort((a, b) => b.score - a.score);

        res.status(200).json({ users: sortedScores });
    } catch (error) {
        console.error('Error fetching scores:', error.message);
        res.status(500).json({ message: 'Error fetching scores: ' + error.message });  // 500: Internal Server Error
    }
});

// POST to create and save a new username in the 'User' schema
//   - 201 Created: User successfully created in the database
//   - 409 Conflict: If the username already exists in the database
//   - 400 Bad Request: For any other errors
app.post('/create-user', async (req, res) => {
    try {
        const username = req.body.username.toLowerCase();
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists.' });
        }

        const user = new User({ username });
        await user.save();
        res.status(201).send('User created successfully');
    } catch (err) {
        res.status(400).send('Error creating user: ' + err.message);
    }
});

// POST to save the user's score information in the 'Score' schema
app.post('/save-score', async (req, res) => {
    try {
        const { username, score, gridId, longestWord, totalWords } = req.body;

        const scoreData = new Score({
            username,
            score,
            gridId,
            longestWord,
            totalWords
        });

        await scoreData.save();
        console.log('Score saved successfully:', scoreData);

        res.status(201).send('Score saved successfully');
    } catch (err) {
        console.error('Error saving score:', err.message);
        res.status(400).send('Error saving score: ' + err.message);
    }
});

// POST to create and save a daily grid in the 'WordGrid' schema
app.post('/generate-daily-grid', async (req, res) => {
    try {
        const today = new Date().getDate();
        const language = req.body.language;
        const grid = generateDailyGrid(language);

        // Save the grid in the database
        const newGrid = new WordGrid({
            day: today,
            language: language,
            grid: grid,
        });

        await newGrid.save();
        res.status(201).json({ message: 'Daily grid generated', grid: grid });
    } catch (err) {
        res.status(500).send('Error generating daily grid: ' + err.message);
    }
});

// Backend algorithm to generate a juiced 4x4 grid
// Letter selection is pseudorandom and has bias to create fun grids :)
const generateDailyGrid = (language) => {
    const grid = [];

    // Letter pools based on language
    const normalizedLanguage = language ? language.trim().toLowerCase() : "english";
    const vowels = normalizedLanguage === "german" ? "EEAIOUÄÖÜ" : "EEAIOU"; 
    const commonConsonants = "RDNSTL";
    const lessCommonConsonants = "BCFGHMPWY";
    const rareConsonants = "KJXQZV";


    // Helper function to pick from the letter pool
    const pickFromPool = (pool) => pool.charAt(Math.floor(Math.random() * pool.length));

    // Generate a 4x4 grid
    for (let i = 0; i < 4; i++) {
        const row = [];
        for (let j = 0; j < 4; j++) {
            let letter;

            if (Math.random() < 0.35) {
                // 35% chance to place a vowel
                letter = pickFromPool(vowels);
            } else if (Math.random() < 0.7) {
                // 35% chance to place a common consonant
                letter = pickFromPool(commonConsonants);
            } else if (Math.random() < 0.95) {
                // 25% chance to place a less common consonant
                letter = pickFromPool(lessCommonConsonants);
            } else {
                // 5% chance to place a rare consonant
                letter = pickFromPool(rareConsonants);
            }

            row.push(letter);
        }
        grid.push(row);
    }

    // Ensure more 'juiced' grids by adjusting some placements post-generation
    const adjustGrid = () => {
        // Add more 'R', 'D', 'S' near 'E'
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 'E') {
                    // Add an 'R' or 'D' or 'S' to neighboring cells with some probability
                    const neighbors = [
                        [i - 1, j], [i + 1, j],         // Vertical neighbors
                        [i, j - 1], [i, j + 1],         // Horizontal neighbors
                        [i - 1, j - 1], [i - 1, j + 1], // Diagonal neighbors
                        [i + 1, j - 1], [i + 1, j + 1]
                    ];

                    neighbors.forEach(([ni, nj]) => {
                        // 10% chance for a neighbor of 'E' to become 'R', 'D', 'S'
                        if (ni >= 0 && ni < 4 && nj >= 0 && nj < 4 && Math.random() < 0.10) {
                            grid[ni][nj] = pickFromPool("RDS");
                        }
                    });
                }
            }
        }
    };

    adjustGrid();

    return grid;
};

// POST to clear all schemas in the database
// **Used for testing purposes ONLY**
app.post('/clear-database', async (req, res) => {
    try {
        const collections = await mongoose.connection.db.collections();

        for (let collection of collections) {
            await collection.deleteMany(); // Deletes all documents in the collection
        }

        res.status(200).send('Database cleared successfully\n');
    } catch (err) {
        res.status(500).send('Error clearing database: ' + err.message);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});