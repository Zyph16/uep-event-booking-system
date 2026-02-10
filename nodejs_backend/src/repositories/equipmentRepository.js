const { pool } = require('../core/database');
const Equipment = require('../models/equipment');

class EquipmentRepository {
    // Get all equipment
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM equipment');
        return rows.map(row => Equipment.fromRow(row));
    }

    // Find equipment by ID
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM equipment WHERE equipmentID = ?', [id]);
        return rows.length ? Equipment.fromRow(rows[0]) : null;
    }

    // Create new equipment
    static async create(data) {
        const [result] = await pool.query(`
      INSERT INTO equipment (equipment_name, description, price)
      VALUES (?, ?, ?)
    `, [
            data.equipment_name,
            data.description || null,
            data.price || 0.00
        ]);
        return this.findById(result.insertId);
    }

    // Update equipment
    static async update(id, data) {
        await pool.query(`
      UPDATE equipment 
      SET equipment_name = ?, description = ?, price = ?
      WHERE equipmentID = ?
    `, [
            data.equipment_name,
            data.description || null,
            data.price || 0.00,
            id
        ]);
        return this.findById(id);
    }

    // Delete equipment
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM equipment WHERE equipmentID = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = EquipmentRepository;
