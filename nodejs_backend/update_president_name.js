const { pool } = require('./src/core/database');

async function update() {
    try {
        console.log("Updating President's Name...");
        // Assuming ID 20 is the president based on previous debug output
        const updateSql = `
            UPDATE personal_info 
            SET fname = 'Juan', lname = 'Dela Cruz', mname = 'Santos' 
            WHERE userID = 20
        `;

        const [result] = await pool.query(updateSql);
        console.log("Update Result:", result);

        if (result.affectedRows === 0) {
            console.log("No rows updated. Trying insert...");
            const insertSql = `
                INSERT INTO personal_info (userID, fname, lname, mname) 
                VALUES (20, 'Juan', 'Dela Cruz', 'Santos')
            `;
            const [insertResult] = await pool.query(insertSql);
            console.log("Insert Result:", insertResult);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
}

update();
