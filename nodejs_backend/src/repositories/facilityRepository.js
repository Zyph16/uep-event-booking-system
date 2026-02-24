const { pool } = require('../core/database');
const Facility = require('../models/facility');

class FacilityRepository {
    // Get all facilities
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM facilities');
        const facilities = [];

        for (const row of rows) {
            const id = row.facilityID;

            // Fetch Equipment Details (ID + Name)
            const [eqRows] = await pool.query(`
                SELECT e.equipmentID, e.equipment_name 
                FROM facility_equipment fe 
                JOIN equipment e ON fe.equipmentID = e.equipmentID 
                WHERE fe.facilityID = ?
            `, [id]);

            row.equipment_details = eqRows.map(r => ({ id: r.equipmentID, name: r.equipment_name }));
            row.equipment = eqRows.map(r => r.equipmentID); // Keep for backward compatibility if needed
            row.equipment_names = eqRows.map(r => r.equipment_name);

            // Fetch Room Details (ID + Name)
            const [rmRows] = await pool.query(`
                SELECT r.roomID, r.room_name 
                FROM facility_room fr 
                JOIN room r ON fr.roomID = r.roomID 
                WHERE fr.facilityID = ?
            `, [id]);

            row.room_details = rmRows.map(r => ({ id: r.roomID, name: r.room_name }));
            row.rooms = rmRows.map(r => r.roomID);
            row.room_names = rmRows.map(r => r.room_name);

            // Fetch Albums and Images
            const [albumRows] = await pool.query(`SELECT * FROM facility_albums WHERE facility_id = ? ORDER BY created_at ASC`, [id]);
            for (const album of albumRows) {
                const [imgRows] = await pool.query(`SELECT id, image_path FROM facility_images WHERE album_id = ? ORDER BY created_at ASC`, [album.id]);
                album.images = imgRows;
            }
            row.albums = albumRows;

            facilities.push(Facility.fromRow(row));
        }

        return facilities;
    }

    // Find facility by ID
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM facilities WHERE facilityID = ?', [id]);
        const row = rows[0];

        if (row) {
            // Fetch Equipment Details (ID + Name)
            const [eqRows] = await pool.query(`
                SELECT e.equipmentID, e.equipment_name 
                FROM facility_equipment fe 
                JOIN equipment e ON fe.equipmentID = e.equipmentID 
                WHERE fe.facilityID = ?
            `, [id]);

            row.equipment_details = eqRows.map(r => ({ id: r.equipmentID, name: r.equipment_name }));
            row.equipment = eqRows.map(r => r.equipmentID);
            row.equipment_names = eqRows.map(r => r.equipment_name);

            // Fetch Room Details
            const [rmRows] = await pool.query(`
                SELECT r.roomID, r.room_name 
                FROM facility_room fr 
                JOIN room r ON fr.roomID = r.roomID 
                WHERE fr.facilityID = ?
            `, [id]);

            row.room_details = rmRows.map(r => ({ id: r.roomID, name: r.room_name }));
            row.rooms = rmRows.map(r => r.roomID);
            row.room_names = rmRows.map(r => r.room_name);

            // Fetch Albums and Images
            const [albumRows] = await pool.query(`SELECT * FROM facility_albums WHERE facility_id = ? ORDER BY created_at ASC`, [id]);
            for (const album of albumRows) {
                const [imgRows] = await pool.query(`SELECT id, image_path FROM facility_images WHERE album_id = ? ORDER BY created_at ASC`, [album.id]);
                album.images = imgRows;
            }
            row.albums = albumRows;

            return Facility.fromRow(row);
        }

        return null;
    }

    // Create new facility
    static async create(data) {
        const [result] = await pool.query(`
      INSERT INTO facilities (facility_name, location, capacity, price, status, imagepath, billing_template)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
            data.facility_name,
            data.location,
            data.capacity,
            data.price || 0.00,
            data.status,
            data.imagepath || null,
            data.billing_template || 'default'
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

        if (data.billing_template !== undefined) {
            fields.push('billing_template = ?');
            params.push(data.billing_template);
        }

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

    // --- Facility Albums (Folders) and Images ---

    static async getAlbums(facilityId) {
        const [albums] = await pool.query('SELECT * FROM facility_albums WHERE facility_id = ? ORDER BY created_at ASC', [facilityId]);
        for (const album of albums) {
            const [images] = await pool.query('SELECT id, image_path FROM facility_images WHERE album_id = ? ORDER BY created_at ASC', [album.id]);
            album.images = images;
        }
        return albums;
    }

    static async createAlbum(facilityId, name) {
        const [result] = await pool.query('INSERT INTO facility_albums (facility_id, name) VALUES (?, ?)', [facilityId, name]);
        return { id: result.insertId, facility_id: facilityId, name, images: [] };
    }

    static async deleteAlbum(albumId) {
        const [result] = await pool.query('DELETE FROM facility_albums WHERE id = ?', [albumId]);
        return result.affectedRows > 0;
    }

    static async addImageToAlbum(albumId, imagePath) {
        const [result] = await pool.query('INSERT INTO facility_images (album_id, image_path) VALUES (?, ?)', [albumId, imagePath]);
        return { id: result.insertId, album_id: albumId, image_path: imagePath };
    }

    static async deleteImage(imageId) {
        const [result] = await pool.query('DELETE FROM facility_images WHERE id = ?', [imageId]);
        return result.affectedRows > 0;
    }
}

module.exports = FacilityRepository;
