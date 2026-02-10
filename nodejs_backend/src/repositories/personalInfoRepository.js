const { pool } = require('../core/database');
const PersonalInfo = require('../models/personalInfo');

class PersonalInfoRepository {
    // Find by ID
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM personal_info WHERE personalinfoID = ?', [id]);
        return rows.length ? PersonalInfo.fromRow(rows[0]) : null;
    }

    // Find by userID
    static async findByUserId(userID) {
        const [rows] = await pool.query('SELECT * FROM personal_info WHERE userID = ?', [userID]);
        return rows.length ? PersonalInfo.fromRow(rows[0]) : null;
    }

    // Get all
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM personal_info');
        return rows.map(r => PersonalInfo.fromRow(r));
    }

    // Create
    static async create(data) {
        const [result] = await pool.query(
            `INSERT INTO personal_info (userID, fname, mname, lname, email, phone, street, city, province) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.userID,
                data.fname,
                data.mname || null,
                data.lname,
                data.email,
                data.phone || null,
                data.street || null,
                data.city || null,
                data.province || null
            ]
        );
        return this.findById(result.insertId);
    }

    // Update
    static async update(id, data) {
        const fields = ['fname', 'mname', 'lname', 'email', 'phone', 'street', 'city', 'province'];
        const setParts = [];
        const values = [];

        for (const f of fields) {
            if (data[f] !== undefined) {
                setParts.push(`${f} = ?`);
                values.push(data[f]);
            }
        }

        if (setParts.length === 0) return this.findById(id);

        values.push(id);
        const sql = `UPDATE personal_info SET ${setParts.join(', ')} WHERE personalinfoID = ?`;
        await pool.query(sql, values);

        return this.findById(id);
    }

    // Delete
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM personal_info WHERE personalinfoID = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = PersonalInfoRepository;
