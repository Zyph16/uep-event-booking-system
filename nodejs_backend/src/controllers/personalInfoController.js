const PersonalInfoService = require('../services/personalInfoService');

class PersonalInfoController {

    static async findAll(req, res) {
        try {
            const data = await PersonalInfoService.getAll();
            res.json({ personalinfo: data.map(p => p.toArray ? p.toArray() : p) });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async findOne(req, res) {
        const id = parseInt(req.params.id);
        try {
            const item = await PersonalInfoService.getById(id);
            if (!item) return res.status(404).json({ error: 'Not found' });
            res.json({ personalinfo: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async create(req, res) {
        try {
            const user = req.user;
            const data = req.body;

            if (!user) return res.status(401).json({ error: 'Unauthorized' });

            data.userID = user.id;

            // Check if personal info already exists for this user
            const existing = await PersonalInfoService.getByUserId(user.id);
            if (existing) {
                // Determine ID to update
                const idToUpdate = existing.personalinfoID || existing.id; // handle case where model property might differ
                console.log(`[PersonalInfo] User ${user.id} has existing info ${idToUpdate}. Updating instead of creating.`);
                const item = await PersonalInfoService.update(idToUpdate, data);
                // 200 OK for update
                return res.status(200).json({ personalinfo: item.toArray ? item.toArray() : item });
            }

            const item = await PersonalInfoService.create(data);
            res.status(201).json({ personalinfo: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            const data = req.body;
            const item = await PersonalInfoService.update(id, data);
            if (!item) return res.status(400).json({ error: 'Update failed' });
            res.json({ personalinfo: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            const deleted = await PersonalInfoService.delete(id);
            if (!deleted) return res.status(404).json({ error: 'Delete failed' });
            res.json({ message: 'Deleted successfully' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async getByUserId(req, res) {
        try {
            const user = req.user;
            if (!user) return res.status(401).json({ error: 'Unauthorized' });

            const item = await PersonalInfoService.getByUserId(user.id);

            // Return null with 200 OK (empty) if not found, mirroring PHP behavior
            if (!item) {
                return res.json({ personalinfo: null });
            }

            res.json({ personalinfo: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = PersonalInfoController;
