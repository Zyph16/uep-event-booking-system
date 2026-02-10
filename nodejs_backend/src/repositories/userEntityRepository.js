const { pool } = require('../core/database');
const UserEntity = require('../models/userEntity');

class UserEntityRepository {
    // 🔎 Find user by ID
    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT u.*, r.name AS role_name, pi.fname, pi.lname, pi.mname, pi.email
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN personal_info pi ON pi.userID = u.id
       WHERE u.id = ?`,
            [id]
        );
        return rows.length ? UserEntity.fromRow(rows[0]) : null;
    }

    // 🔎 Find by username
    static async findByUsername(username) {
        const [rows] = await pool.query(
            `SELECT u.*, r.name AS role_name, pi.fname, pi.lname, pi.mname, pi.email
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN personal_info pi ON pi.userID = u.id
       WHERE u.username = ?`,
            [username]
        );
        return rows.length ? UserEntity.fromRow(rows[0]) : null;
    }

    // 🔎 Find users by Role Name
    static async findByRole(roleName) {
        const [rows] = await pool.query(
            `SELECT u.*, r.name AS role_name, pi.fname, pi.lname, pi.mname, pi.email
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN personal_info pi ON pi.userID = u.id
       WHERE r.name = ?`,
            [roleName]
        );
        return rows.map(row => UserEntity.fromRow(row));
    }

    // 📋 Get all users with email
    static async findAll() {
        const [rows] = await pool.query(
            `SELECT u.*, r.name AS role_name, pi.fname, pi.lname, pi.mname, pi.email
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN personal_info pi ON pi.userID = u.id`
        );
        return rows.map(row => UserEntity.fromRow(row));
    }

    // ➕ Create
    static async create(username, roleId, passwordHash) {
        const [result] = await pool.query(
            `INSERT INTO users (username, role_id, password_hash)
       VALUES (?, ?, ?)`,
            [username, roleId, passwordHash]
        );
        return this.findById(result.insertId);
    }

    // ✏️ Update (safe fields only)
    static async update(userId, updates) {
        const allowed = ['username', 'role_id', 'password_hash'];
        const setParts = [];
        const values = [];

        for (const [field, value] of Object.entries(updates)) {
            if (allowed.includes(field)) {
                setParts.push(`${field} = ?`);
                values.push(value);
            }
        }

        if (setParts.length === 0) {
            return this.findById(userId);
        }

        values.push(userId);
        const sql = `UPDATE users SET ${setParts.join(', ')} WHERE id = ?`;
        await pool.query(sql, values);

        return this.findById(userId);
    }

    // ❌ Delete
    static async delete(userId) {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);
        return result.affectedRows > 0;
    }

    // 🔗 Sync Facilities
    static async syncFacilities(userId, facilityIds) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Remove existing
            await connection.query('DELETE FROM user_facilities WHERE user_id = ?', [userId]);

            // 2. Insert new
            if (facilityIds && facilityIds.length > 0) {
                const sql = 'INSERT INTO user_facilities (user_id, facility_id) VALUES ?';
                // Bulk insert expects array of arrays
                const values = facilityIds.map(fid => [userId, fid]);
                await connection.query(sql, [values]);
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // 🔗 Get Assigned Facilities
    static async getAssignedFacilities(userId) {
        const [rows] = await pool.query(
            'SELECT facility_id FROM user_facilities WHERE user_id = ?',
            [userId]
        );
        return rows.map(row => row.facility_id);
    }
}

module.exports = UserEntityRepository;
