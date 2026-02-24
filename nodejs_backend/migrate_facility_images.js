const { pool } = require('./src/core/database');

async function migrate() {
    console.log("Starting facility_images migration...");

    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS facility_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                facility_id INT UNSIGNED NOT NULL,
                image_path VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (facility_id) REFERENCES facilities(facilityID) ON DELETE CASCADE
            );
        `;

        console.log("Executing SQL:\n", sql);
        await pool.query(sql);
        console.log("Migration successful: Added facility_images table.");
    } catch (err) {
        console.error("Migration failed:", err.message);
    } finally {
        await pool.end();
        console.log("Migration finished.");
    }
}

migrate();
