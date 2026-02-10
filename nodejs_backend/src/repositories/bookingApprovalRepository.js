const { pool } = require('../core/database');

class BookingApprovalRepository {
    static async create(data) {
        await pool.query(`
      INSERT INTO booking_approvals (booking_id, approver_id, approval_stage, approver_role, decision, remarks)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
            data.booking_id,
            data.approver_id,
            data.approval_stage,
            data.approver_role,
            data.decision,
            data.remarks || null
        ]);
    }

    static async findByBookingId(bookingId) {
        const [rows] = await pool.query(`
      SELECT ba.*, u.username as approver_name 
      FROM booking_approvals ba
      LEFT JOIN users u ON ba.approver_id = u.id
      WHERE ba.booking_id = ?
      ORDER BY ba.created_at ASC
    `, [bookingId]);
        return rows;
    }

    static async findAll() {
        const [rows] = await pool.query(`
      SELECT 
        ba.approval_id,
        ba.booking_id,
        ba.created_at,
        ba.approval_stage,
        ba.decision,
        ba.approver_role,
        ba.remarks,
        u.username as approver_name,
        b.purpose as booking_purpose,
        f.facility_name
      FROM booking_approvals ba
      LEFT JOIN users u ON ba.approver_id = u.id
      LEFT JOIN bookings b ON ba.booking_id = b.bookingID
      LEFT JOIN facilities f ON b.facilityID = f.facilityID
      ORDER BY ba.created_at DESC
    `);
        return rows;
    }
}

module.exports = BookingApprovalRepository;
