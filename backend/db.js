const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool instance to connect to the database
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// This function will run when the server starts
const initializeDatabase = async () => {
    try {
        // SQL command to create the 'users' table if it doesn't already exist
        const createUserTable = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        // --- THIS IS THE CORRECTED PART ---
        // We define the primary key directly inside the CREATE TABLE statement.
        // This makes the entire operation safe to run multiple times.
        const createSessionTable = `
            CREATE TABLE IF NOT EXISTS "session" (
                "sid" varchar NOT NULL PRIMARY KEY,
                "sess" json NOT NULL,
                "expire" timestamp(6) NOT NULL
            );
        `;

        // Execute the queries
        await pool.query(createUserTable);
        await pool.query(createSessionTable);
        
        console.log("Database tables checked/created successfully.");

    } catch (err) {
        console.error("Error initializing database:", err);
        // Exit the process if we can't set up the database
        process.exit(1);
    }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Export the pool for the session store
  initializeDatabase, // Export the initialization function
};