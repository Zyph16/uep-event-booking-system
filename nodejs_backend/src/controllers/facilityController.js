const FacilityService = require('../services/facilityService');
const path = require('path');
const fs = require('fs');

const logError = (msg) => {
    try {
        fs.appendFileSync('backend-error.log', new Date().toISOString() + ' ' + msg + '\n');
    } catch (e) {
        console.error("Logging failed", e);
    }
};

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
                    rooms_included: arr.room_names,
                    inclusions: {
                        equipment: arr.equipment_details || [],
                        rooms: arr.room_details || []
                    },
                    albums: arr.albums || []
                };
            });

            res.json({ facilities: publicData });
        } catch (e) {
            logError("getPublicFacilities ERROR: " + e.stack);
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

                // Cloudinary returns the full URL in file.path
                if (req.file.path) {
                    data.imagepath = req.file.path;
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
                // Cloudinary returns the full URL in file.path
                if (req.file.path) {
                    data.imagepath = req.file.path;
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

    // --- Facility Albums (Folders) and Images ---

    static async createAlbum(req, res) {
        const facilityId = parseInt(req.params.id);
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Album name is required' });

        try {
            const album = await FacilityService.createAlbum(facilityId, name);
            res.status(201).json({ message: 'Album created successfully', album });
        } catch (e) {
            console.error("Create album error:", e.message);
            res.status(500).json({ error: e.message });
        }
    }

    static async deleteAlbum(req, res) {
        const albumId = parseInt(req.params.albumId);
        try {
            const deleted = await FacilityService.deleteAlbum(albumId);
            if (!deleted) return res.status(404).json({ error: 'Album not found or delete failed' });
            res.json({ message: 'Album deleted successfully' });
        } catch (e) {
            console.error("Delete album error:", e.message);
            res.status(500).json({ error: e.message });
        }
    }

    static async uploadImageToAlbum(req, res) {
        const albumId = parseInt(req.params.albumId);
        if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No images provided' });

        try {
            const newImages = [];
            for (const file of req.files) {
                // Cloudinary returns the full URL directly in file.path
                const imagePath = file.path;
                const newImage = await FacilityService.addImageToAlbum(albumId, imagePath);
                newImages.push(newImage);
            }
            res.status(201).json({ message: 'Images added to album', images: newImages });
        } catch (e) {
            console.error("Upload album images error:", e.message);
            res.status(500).json({ error: e.message });
        }
    }

    static async deleteImage(req, res) {
        const imageId = parseInt(req.params.imageId);
        try {
            const deleted = await FacilityService.deleteImage(imageId);
            if (!deleted) return res.status(404).json({ error: 'Image not found or delete failed' });
            res.json({ message: 'Image deleted successfully' });
        } catch (e) {
            console.error("Delete image error:", e.message);
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = FacilityController;
