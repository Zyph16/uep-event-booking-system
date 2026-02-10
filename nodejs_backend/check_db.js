const { pool } = require('./src/core/database');

async function checkDatabase() {
    try {
        console.log("Checking database schema...");
        const [tables] = await pool.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);

        for (const table of tableNames) {
            console.log(`\n--- TABLE: ${table} ---`);

            const [columns] = await pool.query(`DESCRIBE ${table}`);
            console.log("Columns:");
            columns.forEach(c => {
                console.log(`  ${c.Field} (${c.Type}) - Null: ${c.Null} - Key: ${c.Key} - Default: ${c.Default} - Extra: ${c.Extra}`);
            });

            const [indexes] = await pool.query(`SHOW INDEX FROM ${table}`);
            console.log("Indexes:");
            indexes.forEach(i => {
                console.log(`  ${i.Key_name}: ${i.Column_name} (Unique: ${i.Non_unique === 0})`);
            });

            const [createTable] = await pool.query(`SHOW CREATE TABLE ${table}`);
            console.log("Create Statement Snippet (Constraints):");
            // Extract constraints if possible, or just print the whole logic
            console.log(Object.values(createTable[0])[1]);
        }

    } catch (e) {
        console.error("Database check failed:", e);
    } finally {
        process.exit();
    }
}

checkDatabase();
