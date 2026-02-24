const { pool } = require('./src/core/database');

async function migrate() {
    console.log("Starting album folders migration...");

    try {
        const createAlbumsSql = `
            CREATE TABLE IF NOT EXISTS facility_albums (
                id INT AUTO_INCREMENT PRIMARY KEY,
                facility_id INT UNSIGNED NOT NULL,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (facility_id) REFERENCES facilities(facilityID) ON DELETE CASCADE
            );
        `;

        console.log("Executing SQL:\n", createAlbumsSql);
        await pool.query(createAlbumsSql);
        console.log("Migration successful: Added facility_albums table.");

        // Drop the old images table
        const dropImagesSql = `DROP TABLE IF EXISTS facility_images;`;
        console.log("Executing SQL:\n", dropImagesSql);
        await pool.query(dropImagesSql);
        console.log("Dropped old facility_images table.");

        // Recreate the images table linking to albums
        const createImagesSql = `
            CREATE TABLE facility_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                album_id INT NOT NULL,
                image_path VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (album_id) REFERENCES facility_albums(id) ON DELETE CASCADE
            );
        `;
        console.log("Executing SQL:\n", createImagesSql);
        await pool.query(createImagesSql);
        console.log("Migration successful: Recreated facility_images table.");

    } catch (err) {
        console.error("Migration failed:", err.message);
    } finally {
        await pool.end();
        console.log("Migration finished.");
    }
}

migrate();
