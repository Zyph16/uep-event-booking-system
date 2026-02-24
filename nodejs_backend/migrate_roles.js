const { pool } = require('./src/core/database');

async function migrate() {
    try {
        await pool.query('ALTER TABLE roles ADD COLUMN role_specification VARCHAR(255) DEFAULT "Regular Account"');
        console.log("Migration successful");
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists");
        } else {
            console.error(e);
        }
    } finally {
        process.exit();
    }
}

migrate();
