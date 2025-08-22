const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

const initDb = () => {
    db.serialize(() => {
        // Create users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating users table', err);
            } else {
                // Insert default users if table is empty
                db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
                    if (row.count === 0) {
                        const stmt = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
                        stmt.run('admin', 'password123', 'admin'); // In a real app, use hashed passwords
                        stmt.run('user', 'password123', 'user');
                        stmt.finalize();
                        console.log('Inserted default users');
                    }
                });
            }
        });

        // Create royalties table
        db.run(`CREATE TABLE IF NOT EXISTS royalties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            recipient TEXT NOT NULL,
            status TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating royalties table', err);
            }
        });

        // Create contracts table
        db.run(`CREATE TABLE IF NOT EXISTS contracts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            partyA TEXT NOT NULL,
            partyB TEXT NOT NULL,
            startDate TEXT NOT NULL,
            endDate TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating contracts table', err);
            }
        });
    });
};

module.exports = { db, initDb };
