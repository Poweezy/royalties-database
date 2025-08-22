const express = require('express');
const cors = require('cors');
const { db, initDb } = require('./database');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDb();

// Basic route
app.get('/', (req, res) => {
    res.send('Mining Royalties Manager Backend is running!');
});

// Auth endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            // In a real app, you'd return a JWT here
            res.json({ message: 'Login successful', user: { id: row.id, username: row.username, role: row.role } });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;
