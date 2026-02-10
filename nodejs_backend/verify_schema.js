const fs = require('fs');
const { pool } = require('./src/core/database');

async function verifySchema() {
    let report = "Verifying Database Schema for Deployment...\n\n";
    function log(msg) {
        console.log(msg);
        report += msg + "\n";
    }

    try {
        // 1. Check Users Table
        const [usersCols] = await pool.query("DESCRIBE users");
        const passCol = usersCols.find(c => c.Field === 'password' || c.Field === 'password_hash');
        if (passCol) {
            log(`[users] password column: ${passCol.Field} (${passCol.Type})`);
            if (!passCol.Type.includes('varchar(255)') && !passCol.Type.includes('text')) {
                log("  ⚠️  WARNING: Password column might be too short for hashes.");
            } else {
                log("  ✅ Password column length looks strictly okay.");
            }
        } else {
            log("  ❌ ERROR: users table missing 'password' or 'password_hash' column.");
        }

        // 2. Check Billings Table (Financials)
        const [billingsCols] = await pool.query("DESCRIBE billings");
        const amountCol = billingsCols.find(c => c.Field === 'total_amount');
        if (amountCol) {
            log(`[billings] total_amount type: ${amountCol.Type}`);
            if (amountCol.Type.includes('float') || amountCol.Type.includes('double')) {
                log("  ⚠️  WARNING: Using FLOAT/DOUBLE for money is not recommended. Use DECIMAL(10,2).");
            } else if (amountCol.Type.includes('decimal')) {
                log("  ✅ Using DECIMAL for money.");
            }
        }

        // 3. Check Foreign Keys (Sampling)
        // We check if foreign keys are indexed
        async function checkIndex(table, col) {
            try {
                const [indexes] = await pool.query(`SHOW INDEX FROM ${table} WHERE Column_name = '${col}'`);
                if (indexes.length > 0) {
                    log(`  ✅ ${table}.${col} is indexed.`);
                } else {
                    log(`  ⚠️  WARNING: ${table}.${col} is NOT indexed. Performance impact on joins.`);
                }
            } catch (e) {
                log(`  ❌ ERROR checking index ${table}.${col}: ${e.message}`);
            }
        }

        log("\nChecking Indexes on Foreign Keys:");
        await checkIndex('bookings', 'facilityID');
        await checkIndex('bookings', 'userID');
        await checkIndex('billings', 'booking_id');
        await checkIndex('facility_equipment', 'facilityID');
        await checkIndex('facility_equipment', 'equipmentID');

        // 4. Check for Test Data
        const [usersCount] = await pool.query("SELECT COUNT(*) as count FROM users");
        log(`\n[users] Total users: ${usersCount[0].count}`);

        const [bookingsCount] = await pool.query("SELECT COUNT(*) as count FROM bookings");
        log(`[bookings] Total bookings: ${bookingsCount[0].count}`);

    } catch (e) {
        log("Verification failed: " + e.message);
    } finally {
        fs.writeFileSync('verification_report.txt', report);
        process.exit();
    }
}

verifySchema();
