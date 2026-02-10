const { pool } = require('../core/database');
const Room = require('../models/room');

class RoomRepository {
    // Get all rooms
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM room');
        return rows.map(row => Room.fromRow(row));
    }

    // Find room by ID
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM room WHERE roomID = ?', [id]);
        return rows.length ? Room.fromRow(rows[0]) : null;
    }

    // Create new room
    static async create(data) {
        const [result] = await pool.query(`
      INSERT INTO room (room_name, capacity, price)
      VALUES (?, ?, ?)
    `, [
            data.room_name,
            data.capacity || null,
            data.price || 0.00
        ]);
        return this.findById(result.insertId);
    }

    // Update room
    static async update(id, data) {
        await pool.query(`
      UPDATE room 
      SET room_name = ?, capacity = ?, price = ?
      WHERE roomID = ?
    `, [
            data.room_name,
            data.capacity || null,
            data.price || 0.00,
            id
        ]);
        return this.findById(id);
    }

    // Delete room
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM room WHERE roomID = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = RoomRepository;
