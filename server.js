const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const saltRounds = 10;

// --- MIDDLEWARE SETUP ---
// VERIFY THIS CODE BLOCK IS EXACTLY LIKE THIS

app.use(cors({
    origin: [
        'http://127.0.0.1:5500', // For VS Code Live Server
        'http://localhost:3000'   // For npx serve
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    store: new PgSession({
        pool: db.pool,
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false, 
    }
}));

// --- WELCOME ROUTE ---
// A simple informational route for the API's root URL.
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Welcome to the Auth App API!',
        info: 'The API is running correctly.',
        frontend: 'Please access the application through the frontend URL, typically http://127.0.0.1:5500'
    });
});


// --- AUTHENTICATION MIDDLEWARE (Defined only ONCE here) ---
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next(); // User is authenticated, proceed to the requested route
    } else {
        res.status(401).json({ message: 'You are not authorized. Please log in.' });
    }
};


// --- API ENDPOINTS ---

// Signup: Create a new user
app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const passwordHash = await bcrypt.hash(password, saltRounds);
        await db.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', [email, passwordHash]);
        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});

// Login: Authenticate a user and create a session
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        req.session.userId = user.id;
        res.status(200).json({ message: 'Logged in successfully.', userId: user.id });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Forgot/Reset Password (Simulated)
app.post('/api/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required." });
    }
    try {
        const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(200).json({ message: "If an account with that email exists, the password has been reset." });
        }
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);
        await db.query('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, email]);
        res.status(200).json({ message: "Password has been reset successfully." });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Server error during password reset.' });
    }
});

// Logout: Destroy the user's session
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out, please try again.' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully.' });
    });
});

// Protected Dashboard Route: Only accessible if logged in
app.get('/api/dashboard', isAuthenticated, async (req, res) => {
    try {
        const result = await db.query('SELECT id, email FROM users WHERE id = $1', [req.session.userId]);
        res.status(200).json({ user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});


// --- START THE SERVER ---
const startServer = async () => {
    await db.initializeDatabase();
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

startServer();