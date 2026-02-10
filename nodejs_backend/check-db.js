const { pool } = require('./src/core/database');

async function listFacilities() {
    try {
        const [rows] = await pool.query('SELECT facilityID, facility_name, imagepath FROM facilities');
        rows.forEach(row => {
            console.log(`ID:${row.facilityID} | NAME:${row.facility_name} | PATH:${row.imagepath}`);
        });
        process.exit(0);
    } catch (err) {
        console.error('Error listing facilities:', err);
        process.exit(1);
    }
}

listFacilities();
