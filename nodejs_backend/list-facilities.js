const { pool } = require('./src/core/database');

async function listFacilities() {
    try {
        const [rows] = await pool.query('SELECT facilityID, facility_name, imagepath FROM facilities');
        console.log('Current Facilities:');
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error('Error listing facilities:', err);
        process.exit(1);
    }
}

listFacilities();
