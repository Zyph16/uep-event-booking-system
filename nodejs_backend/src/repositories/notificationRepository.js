const { pool } = require('../core/database');
const Notification = require('../models/notification');

class NotificationRepository {
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM notifications');
        return rows.map(r => Notification.fromRow(r));
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM notifications WHERE notifID = ?', [id]);
        return rows.length ? Notification.fromRow(rows[0]) : null;
    }

    static async findByUserId(userId) {
        const [rows] = await pool.query('SELECT * FROM notifications WHERE userID = ? ORDER BY sent_at DESC', [userId]);
        return rows.map(r => Notification.fromRow(r));
    }

    static async markAllAsRead(userId) {
        await pool.query("UPDATE notifications SET status = 'READ' WHERE userID = ? AND status = 'UNREAD'", [userId]);
        return true;
    }

    static async create(data) {
        const [result] = await pool.query(`
      INSERT INTO notifications (userID, phone, message, type, status)
      VALUES (?, ?, ?, ?, ?)
    `, [
            data.userID,
            data.phone,
            data.message,
            data.type || 'INFO',
            data.status || 'PENDING'
        ]);
        return this.findById(result.insertId);
    }

    static async update(id, data) {
        const fields = ['userID', 'phone', 'message', 'type', 'status'];
        const set = [];
        const values = [];

        for (const f of fields) {
            if (data[f] !== undefined) {
                set.push(`${f} = ?`);
                values.push(data[f]);
            }
        }

        if (set.length === 0) return this.findById(id);

        values.push(id);
        await pool.query(`UPDATE notifications SET ${set.join(', ')} WHERE notifID = ?`, values);
        return this.findById(id);
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM notifications WHERE notifID = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = NotificationRepository;
