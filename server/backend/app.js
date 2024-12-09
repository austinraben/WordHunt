// Server that is run from the terminal

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Use port 5000
const port = 5000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/wordhunt')
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

// Import MongoDB models
const User = require('./user');
const WordGrid = require('./wordGrid');
const Score = require('./scores');

// Parse JSON
app.use(express.json());

// Serve frontend static files (html, css and dictionaries)
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve the root HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Serve game pages
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/game.html'));
});

// Serve leaderboard page
app.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/leaderboard.html'));
});

// Routes for creating users, saving scores, and retrieving data -- these have not been tested
app.post('/create-user', async (req, res) => {
    try {
        const user = new User({ username: req.body.username });
        await user.save();
        res.status(201).send('User created successfully');
    } catch (err) {
        res.status(400).send('Error creating user: ' + err.message);
    }
});

app.get('/get-user/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (user) res.status(200).json(user);
        else res.status(404).send('User not found');
    } catch (err) {
        res.status(400).send('Error retrieving user: ' + err.message);
    }
});

app.get('/get-daily-grid', async (req, res) => {
    try {
        const today = new Date().getDate();  // Get the day of the month
        const grid = await WordGrid.findOne({ day: today });  // Fetch grid for today
        console.log("Fetched grid for today:", grid);
        if (grid) {
            res.status(200).json({ grid: grid.grid });
        } else {
            res.status(404).send('Grid not found for today.');
        }
    } catch (err) {
        res.status(500).send('Error retrieving grid: ' + err.message);
    }
});

const generateDailyGrid = () => {
    // Define letter pools with frequencies
    const vowels = "AEEIOU";
    const consonants = "BCDFGHJKLMNPQRSTVWXYZ";
    const grid = [];

    // Generate a 4x4 grid
    for (let i = 0; i < 4; i++) {
        const row = [];
        for (let j = 0; j < 4; j++) {
            const isVowel = Math.random() < 0.4; // ~40% chance for vowels
            const letterPool = isVowel ? vowels : consonants;
            const letter = letterPool.charAt(Math.floor(Math.random() * letterPool.length));
            row.push(letter);
        }
        grid.push(row);
    }

    return grid;
};

// Generate and save a daily grid. Can use curl in terminal to trigger this post
app.post('/generate-daily-grid', async (req, res) => {
    try {
        const today = new Date().getDate(); // Day of the month
        const language = req.body.language || "English"; // Default to English
        const grid = generateDailyGrid();

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


app.post('/save-score', async (req, res) => {
    try {
        const score = new Score({
            username: req.body.username,
            score: req.body.score,
            gridId: req.body.gridId,
        });
        await score.save();
        res.status(201).send('Score saved successfully');
    } catch (err) {
        res.status(400).send('Error saving score: ' + err.message);
    }
});

app.get('/scores', async (req, res) => {
    try {
        const scores = await Score.find({});
        res.status(200).json(scores);
    } catch (err) {
        res.status(400).send('Error retrieving scores: ' + err.message);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});