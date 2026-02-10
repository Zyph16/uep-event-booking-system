const { pool } = require('../core/database');

class BillingRepository {
  static async create(data) {
    const [result] = await pool.query(`
      INSERT INTO billings (booking_id, issued_by, facility_fee, equipment_fee, total_amount, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      data.booking_id,
      data.issued_by,
      data.facility_fee,
      data.equipment_fee,
      data.total_amount,
      data.status || 'Pending'
    ]);
    return result.insertId;
  }

  static async findByBookingId(bookingId) {
    const [rows] = await pool.query(`
      SELECT b.*, 
             u.username as issuer_username,
             CONCAT(pi.fname, ' ', pi.lname) as issuer_full_name,
             u.username as issuer_name
      FROM billings b
      JOIN users u ON b.issued_by = u.id
      LEFT JOIN personal_info pi ON u.id = pi.userID
      WHERE b.booking_id = ?
      LIMIT 1
    `, [bookingId]);
    return rows.length ? rows[0] : null;
  }

  static async getIncomeStats(period, facilityId) {
    let groupBy = "DATE_FORMAT(bk.date_start, '%Y-%m')"; // Default Monthly: 2023-01
    if (period === 'annually') {
      groupBy = "DATE_FORMAT(bk.date_start, '%Y')";
    }

    let query = `
            SELECT 
                ${groupBy} as label,
                SUM(b.total_amount) as income
            FROM billings b
            JOIN bookings bk ON b.booking_id = bk.bookingID
            WHERE b.status NOT IN ('Cancelled', 'Rejected') 
        `;

    const params = [];
    if (facilityId && facilityId !== 'all') {
      query += " AND bk.facilityID = ? ";
      params.push(facilityId);
    }

    query += ` GROUP BY label ORDER BY label ASC`;

    const [rows] = await pool.query(query, params);
    return rows;
  }
}

module.exports = BillingRepository;
