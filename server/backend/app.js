const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Define the port for the server to listen on
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

// Serve frontend static files
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/script', express.static(path.join(__dirname, '../frontend/script')));

// Serve the root HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html')); // Serving index.html at root path
});

// Serve game and leaderboard pages
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/game.html')); // Serving game.html
});

app.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/leaderboard.html')); // Serving leaderboard.html
});

// Routes for creating users, saving scores, and retrieving data
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