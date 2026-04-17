const mongoose = require("mongoose");
const mysql = require("mysql2/promise"); // Use promise version for async/await

// Main function to call db based on type of db
exports.ConnectDataBase = async () => {
    const type = process.env.DB_TYPE;
    if (type === "mongo") {
        await exports.connectMONGODB();
    } else if (type === "Mysql") {
        await exports.connectMySQL();
    } else {
        console.error("Invalid DB_TYPE. Check your .env file.");
    }
};

// ----------------- MONGODB CONNECTION -----------------//
exports.connectMONGODB = async () => {
    try {
        // Use await OR .then(), not both. Await is cleaner.
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB Connected successfully..");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1); // Exit ONLY on failure
    }
};

// ----------------- MySQL CONNECTION -----------------//
exports.connectMySQL = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.SQL_HOST,
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            database: process.env.SQL_DATABASE,
        });

        console.log("MySQL connected successfully...");
        return connection;
    } catch (error) {
        console.error("MySQL connection error:", error.message);
        process.exit(1); // Exit ONLY on failure
    }
};