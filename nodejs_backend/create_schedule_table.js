const { pool } = require('./src/core/database');

async function createTable() {
    try {
        const connection = await pool.getConnection();
        console.log("Connected to database. Creating table...");

        await connection.query(`
            CREATE TABLE IF NOT EXISTS booking_schedules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                booking_id INT UNSIGNED NOT NULL,
                date DATE NOT NULL,
                time_start TIME NOT NULL,
                time_end TIME NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_booking_schedules_booking FOREIGN KEY (booking_id) REFERENCES bookings(bookingID) ON DELETE CASCADE
            )
        `);

        console.log("Table 'booking_schedules' created successfully.");
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error("Error creating table:", error);
        process.exit(1);
    }
}

createTable();
