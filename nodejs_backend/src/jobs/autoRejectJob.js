const cron = require('node-cron');
const { pool } = require('../core/database');
const NotificationService = require('../services/notificationService');

const autoRejectJob = cron.schedule('0 0 * * *', async () => { // Runs every midnight at 00:00
    console.log(`[${new Date().toISOString()}] Running Auto-Reject Job...`);
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Identify Bookings to Reject
        // Criteria: Status is 'Pending' AND date_start is within 2 days (or in the past)
        const [bookingsToReject] = await connection.query(`
            SELECT bookingID, userID, facilityID, date_start, date_requested 
            FROM bookings 
            WHERE status = 'Pending' 
            AND (date_start <= DATE_ADD(CURDATE(), INTERVAL 2 DAY))
        `);

        if (bookingsToReject.length === 0) {
            console.log('No bookings to auto-reject.');
            await connection.rollback();
            return;
        }

        console.log(`Found ${bookingsToReject.length} bookings to auto-reject.`);

        // 2. Update Status to 'Rejected'
        const ids = bookingsToReject.map(b => b.bookingID);
        await connection.query(`
            UPDATE bookings 
            SET status = 'Rejected' 
            WHERE bookingID IN (?)
        `, [ids]);

        // 3. Create Audit Logs
        // We can batch insert or loop. Loop is safer for small batches, batch for large.
        // Given this runs daily, volume shouldn't be massive.
        for (const booking of bookingsToReject) {
            await connection.query(`
                INSERT INTO booking_approvals 
                (booking_id, approver_id, approval_stage, approver_role, decision, remarks) 
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                booking.bookingID,
                null, // System has no ID
                'System Auto-Rejection',
                'SYSTEM',
                'Rejected',
                'Auto-rejected: Booking must be approved at least 2 days before the event.'
            ]);

            // 4. Notify User
            await NotificationService.create({
                userID: booking.userID,
                message: `Your booking (ID #${booking.bookingID}) has been auto-rejected because it was not approved 2 days prior to the event date.`,
                type: 'SYSTEM_ALERT',
                status: 'UNREAD'
            });
        }

        await connection.commit();
        console.log('Auto-reject job completed successfully.');

    } catch (error) {
        await connection.rollback();
        console.error('Auto-reject job failed:', error);
    } finally {
        connection.release();
    }
}, {
    scheduled: false // Don't start immediately, let server.js start it
});

module.exports = autoRejectJob;
