const { pool } = require('../core/database');

class FacilityRoomRepository {
    // Get all rooms for a facility
    static async findByFacilityId(facilityId) {
        const [rows] = await pool.query(`
      SELECT fr.*, r.room_name, r.capacity
      FROM facility_room fr
      JOIN room r ON r.roomID = fr.roomID
      WHERE fr.facilityID = ?
    `, [facilityId]);
        return rows;
    }

    // Get all facilities containing specific room
    static async findByRoomId(roomId) {
        const [rows] = await pool.query(`
      SELECT fr.*, f.facility_name, f.location
      FROM facility_room fr
      JOIN facilities f ON f.facilityID = fr.facilityID
      WHERE fr.roomID = ?
    `, [roomId]);
        return rows;
    }

    // Link room to facility
    static async create(data) {
        const [result] = await pool.query(`
      INSERT IGNORE INTO facility_room (facilityID, roomID)
      VALUES (?, ?)
    `, [
            data.facilityID,
            data.roomID
        ]);
        return result.affectedRows > 0;
    }

    // Remove room from facility
    static async delete(facilityId, roomId) {
        const [result] = await pool.query(`
      DELETE FROM facility_room 
      WHERE facilityID = ? AND roomID = ?
    `, [facilityId, roomId]);
        return result.affectedRows > 0;
    }

    // Sync all rooms for a facility
    static async syncForFacility(facilityId, roomIds) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query('DELETE FROM facility_room WHERE facilityID = ?', [facilityId]);

            if (roomIds && roomIds.length > 0) {
                for (const roomId of roomIds) {
                    await connection.query(`
            INSERT INTO facility_room (facilityID, roomID)
            VALUES (?, ?)
          `, [
                        facilityId,
                        roomId
                    ]);
                }
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = FacilityRoomRepository;
