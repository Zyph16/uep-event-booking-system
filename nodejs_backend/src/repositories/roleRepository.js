const { pool } = require('../core/database');
const Role = require('../models/role');

class RoleRepository {
    // 🔎 Find role by ID
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
        return rows.length ? Role.fromRow(rows[0]) : null;
    }

    // 🔎 Find role by name
    static async findByName(name) {
        const [rows] = await pool.query('SELECT * FROM roles WHERE name = ?', [name]);
        return rows.length ? Role.fromRow(rows[0]) : null;
    }

    // 📋 Get all roles
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM roles');
        return rows.map(row => Role.fromRow(row));
    }

    // ➕ Create role
    static async create(name, roleSpecification = 'Regular Account') {
        const [result] = await pool.query('INSERT INTO roles (name, role_specification) VALUES (?, ?)', [name, roleSpecification]);
        return this.findById(result.insertId);
    }

    // ✏️ Update role
    static async update(id, updates) {
        const allowed = ['name', 'role_specification'];
        const setParts = [];
        const values = [];

        for (const [field, value] of Object.entries(updates)) {
            if (allowed.includes(field)) {
                setParts.push(`${field} = ?`);
                values.push(value);
            }
        }

        if (setParts.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const sql = `UPDATE roles SET ${setParts.join(', ')} WHERE id = ?`;
        await pool.query(sql, values);

        return this.findById(id);
    }

    // ❌ Delete role
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM roles WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = RoleRepository;
