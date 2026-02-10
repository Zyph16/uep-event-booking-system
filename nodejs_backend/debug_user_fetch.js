const { pool } = require('./src/core/database');
const UserEntityRepository = require('./src/repositories/userEntityRepository');

async function debug() {
    try {
        console.log("Fetching user 'president'...");
        const user = await UserEntityRepository.findByUsername('president');

        if (user) {
            console.log("User Found:", JSON.stringify(user, null, 2));
            console.log("Public Array:", JSON.stringify(user.toPublicArray(), null, 2));

            const [rows] = await pool.query('SELECT * FROM personal_info WHERE userID = ?', [user.id]);
            console.log("Personal Info Rows:", JSON.stringify(rows, null, 2));
        } else {
            console.log("User 'president' not found.");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
}

debug();
