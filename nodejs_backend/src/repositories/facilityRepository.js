const { pool } = require('../core/database');
const Facility = require('../models/facility');

class FacilityRepository {
    // Get all facilities
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM facilities');
        const facilities = [];

        for (const row of rows) {
            const id = row.facilityID;

            // Fetch Equipment IDs
            const [eqRows] = await pool.query('SELECT equipmentID FROM facility_equipment WHERE facilityID = ?', [id]);
            row.equipment = eqRows.map(r => r.equipmentID);

            // Fetch Equipment Names
            const [eqNameRows] = await pool.query(`
        SELECT e.equipment_name 
        FROM facility_equipment fe 
        JOIN equipment e ON fe.equipmentID = e.equipmentID 
        WHERE fe.facilityID = ?
      `, [id]);
            row.equipment_names = eqNameRows.map(r => r.equipment_name);

            // Fetch Room IDs
            const [rmRows] = await pool.query('SELECT roomID FROM facility_room WHERE facilityID = ?', [id]);
            row.rooms = rmRows.map(r => r.roomID);

            // Fetch Room Names
            const [rmNameRows] = await pool.query(`
        SELECT r.room_name 
        FROM facility_room fr 
        JOIN room r ON fr.roomID = r.roomID 
        WHERE fr.facilityID = ?
      `, [id]);
            row.room_names = rmNameRows.map(r => r.room_name);

            facilities.push(Facility.fromRow(row));
        }

        return facilities;
    }

    // Find facility by ID
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM facilities WHERE facilityID = ?', [id]);
        const row = rows[0];

        if (row) {
            // Fetch Equipment IDs
            const [eqRows] = await pool.query('SELECT equipmentID FROM facility_equipment WHERE facilityID = ?', [id]);
            row.equipment = eqRows.map(r => r.equipmentID);

            // Fetch Equipment Names
            const [eqNameRows] = await pool.query(`
        SELECT e.equipment_name 
        FROM facility_equipment fe 
        JOIN equipment e ON fe.equipmentID = e.equipmentID 
        WHERE fe.facilityID = ?
      `, [id]);
            row.equipment_names = eqNameRows.map(r => r.equipment_name);

            // Fetch Room IDs
            const [rmRows] = await pool.query('SELECT roomID FROM facility_room WHERE facilityID = ?', [id]);
            row.rooms = rmRows.map(r => r.roomID);

            // Fetch Room Names
            const [rmNameRows] = await pool.query(`
        SELECT r.room_name 
        FROM facility_room fr 
        JOIN room r ON fr.roomID = r.roomID 
        WHERE fr.facilityID = ?
      `, [id]);
            row.room_names = rmNameRows.map(r => r.room_name);

            return Facility.fromRow(row);
        }

        return null;
    }

    // Create new facility
    static async create(data) {
        const [result] = await pool.query(`
      INSERT INTO facilities (facility_name, location, capacity, price, status, imagepath)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
            data.facility_name,
            data.location,
            data.capacity,
            data.price || 0.00,
            data.status,
            data.imagepath || null
        ]);

        const id = result.insertId;

        // Handle Equipment
        if (data.equipment && Array.isArray(data.equipment)) {
            for (const equipId of data.equipment) {
                if (!isNaN(equipId)) {
                    await pool.query('INSERT INTO facility_equipment (facilityID, equipmentID) VALUES (?, ?)', [id, parseInt(equipId)]);
                }
            }
        }

        // Handle Rooms
        if (data.rooms && Array.isArray(data.rooms)) {
            for (const roomId of data.rooms) {
                if (!isNaN(roomId)) {
                    await pool.query('INSERT INTO facility_room (facilityID, roomID) VALUES (?, ?)', [id, parseInt(roomId)]);
                }
            }
        }

        return this.findById(id);
    }

    // Update facility
    static async update(id, data) {
        const fields = [
            'facility_name = ?',
            'location = ?',
            'capacity = ?',
            'price = ?',
            'status = ?'
        ];
        const params = [
            data.facility_name,
            data.location,
            data.capacity,
            data.price || 0.00,
            data.status
        ];

        if (data.imagepath !== undefined) {
            fields.push('imagepath = ?');
            params.push(data.imagepath);
        }

        params.push(id);
        await pool.query(`UPDATE facilities SET ${fields.join(', ')} WHERE facilityID = ?`, params);

        // Update Equipment Associations
        if (data.equipment && Array.isArray(data.equipment)) {
            await pool.query('DELETE FROM facility_equipment WHERE facilityID = ?', [id]);
            for (const equipId of data.equipment) {
                if (!isNaN(equipId)) {
                    await pool.query('INSERT INTO facility_equipment (facilityID, equipmentID) VALUES (?, ?)', [id, parseInt(equipId)]);
                }
            }
        }

        // Update Room Associations
        if (data.rooms && Array.isArray(data.rooms)) {
            await pool.query('DELETE FROM facility_room WHERE facilityID = ?', [id]);
            for (const roomId of data.rooms) {
                if (!isNaN(roomId)) {
                    await pool.query('INSERT INTO facility_room (facilityID, roomID) VALUES (?, ?)', [id, parseInt(roomId)]);
                }
            }
        }

        return this.findById(id);
    }

    // Delete facility
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM facilities WHERE facilityID = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = FacilityRepository;
