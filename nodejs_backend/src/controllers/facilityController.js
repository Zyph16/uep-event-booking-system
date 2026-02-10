const FacilityService = require('../services/facilityService');
const path = require('path');
const fs = require('fs');

class FacilityController {
    static async findAll(req, res) {
        try {
            const data = await FacilityService.getAll();
            res.json(data.map(f => f.toArray ? f.toArray() : f));
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async getPublicFacilities(req, res) {
        try {
            // For now returning all, similar to PHP
            const data = await FacilityService.getAll();

            const publicData = data.map(f => {
                const arr = f.toArray ? f.toArray() : f;
                return {
                    facilityID: arr.facilityID,
                    facility_name: arr.facility_name,
                    location: arr.location,
                    capacity: arr.capacity,
                    status: arr.status,
                    imagepath: arr.imagepath,
                    price: arr.price,
                    equipment_included: arr.equipment_names,
                    rooms_included: arr.room_names
                };
            });

            res.json({ facilities: publicData });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async findOne(req, res) {
        const id = parseInt(req.params.id);
        try {
            const item = await FacilityService.getById(id);
            if (!item) return res.status(404).json({ error: 'Not found' });
            res.json({ facility: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async create(req, res) {
        let data;

        // Handle Multipart/Form-Data via Multer (middleware usually puts file in req.file and text fields in req.body)
        if (req.is('multipart/form-data')) {
            data = req.body;
            if (req.file) {
                // Multer usually saves file to destination if configured, or memory.
                // Assuming we configure Multer to save to 'public/uploads/facilities' or we move it here.
                // To match PHP logic exactly (renaming and moving), usually we let Multer handle it or do it here.
                // Let's assume we'll configure Multer Storage Engine to save to the right place.
                // If so, req.file.path or req.file.filename will be available.

                // PHP Logic: uniqid('facility_') + '_' + basename
                // We will trust the upload middleware to have placed the file and give us the path.
                // OR we can manually move it if using memory storage.
                // Simplest: use req.file.path relative to public.

                // If we configure multer to save to public/uploads/facilities:
                if (req.file.filename) {
                    data.imagepath = '/uploads/facilities/' + req.file.filename;
                }
            }
        } else {
            data = req.body;
        }

        try {
            const item = await FacilityService.create(data);
            res.status(201).json({ facility: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async update(req, res) {
        const id = parseInt(req.params.id);
        let data;

        if (req.is('multipart/form-data')) {
            data = req.body;
            if (req.file) {
                if (req.file.filename) {
                    data.imagepath = '/uploads/facilities/' + req.file.filename;
                }
            }
        } else {
            data = req.body;
        }

        try {
            const item = await FacilityService.update(id, data);
            if (!item) return res.status(400).json({ error: 'Update failed' });
            res.json({ facility: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async delete(req, res) {
        const id = parseInt(req.params.id);
        try {
            const deleted = await FacilityService.delete(id);
            if (!deleted) return res.status(404).json({ error: 'Delete failed' });
            res.json({ message: 'Deleted successfully' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = FacilityController;
