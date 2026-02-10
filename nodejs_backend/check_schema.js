const { pool } = require('./src/core/database');

async function checkSchema() {
    try {
        const [rows] = await pool.query("SHOW CREATE TABLE bookings");
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
checkSchema();
