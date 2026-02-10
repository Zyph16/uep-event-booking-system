const { pool } = require('./src/core/database');

async function updateImagePaths() {
    try {
        const [rows] = await pool.query('SELECT facilityID, imagepath FROM facilities');
        for (const row of rows) {
            if (row.imagepath && !row.imagepath.startsWith('/uploads/')) {
                const newPath = '/uploads/facilities/' + row.imagepath;
                await pool.query('UPDATE facilities SET imagepath = ? WHERE facilityID = ?', [newPath, row.facilityID]);
                console.log(`Updated ID:${row.facilityID} - New Path: ${newPath}`);
            } else {
                console.log(`Skipping ID:${row.facilityID} - Path: ${row.imagepath}`);
            }
        }
        console.log('Database update complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating database:', err);
        process.exit(1);
    }
}

updateImagePaths();
