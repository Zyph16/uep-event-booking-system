const { pool } = require('../core/database');

class FacilityEquipmentRepository {
    // Get all equipment for a facility
    static async findByFacilityId(facilityId) {
        const [rows] = await pool.query(`
      SELECT fe.*, e.equipment_name, e.description
      FROM facility_equipment fe
      JOIN equipment e ON e.equipmentID = fe.equipmentID
      WHERE fe.facilityID = ?
    `, [facilityId]);
        return rows;
    }

    // Get all facilities using specific equipment
    static async findByEquipmentId(equipmentId) {
        const [rows] = await pool.query(`
      SELECT fe.*, f.facility_name, f.location
      FROM facility_equipment fe
      JOIN facilities f ON f.facilityID = fe.facilityID
      WHERE fe.equipmentID = ?
    `, [equipmentId]);
        return rows;
    }

    // Link equipment to facility
    static async create(data) {
        const [result] = await pool.query(`
      INSERT INTO facility_equipment (facilityID, equipmentID, quantity)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)
    `, [
            data.facilityID,
            data.equipmentID,
            data.quantity || 1
        ]);
        return result.affectedRows > 0;
    }

    // Update quantity
    static async updateQuantity(facilityId, equipmentId, quantity) {
        const [result] = await pool.query(`
      UPDATE facility_equipment 
      SET quantity = ?
      WHERE facilityID = ? AND equipmentID = ?
    `, [quantity, facilityId, equipmentId]);
        return result.affectedRows > 0;
    }

    // Remove equipment from facility
    static async delete(facilityId, equipmentId) {
        const [result] = await pool.query(`
      DELETE FROM facility_equipment 
      WHERE facilityID = ? AND equipmentID = ?
    `, [facilityId, equipmentId]);
        return result.affectedRows > 0;
    }

    // Sync all equipment for a facility
    static async syncForFacility(facilityId, equipmentData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query('DELETE FROM facility_equipment WHERE facilityID = ?', [facilityId]);

            if (equipmentData && equipmentData.length > 0) {
                for (const equipment of equipmentData) {
                    await connection.query(`
            INSERT INTO facility_equipment (facilityID, equipmentID, quantity)
            VALUES (?, ?, ?)
          `, [
                        facilityId,
                        equipment.equipmentID,
                        equipment.quantity || 1
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

module.exports = FacilityEquipmentRepository;
