const RoomService = require('../services/roomService');

class RoomController {
    static async findAll(req, res) {
        try {
            const data = await RoomService.getAll();
            res.json({ rooms: data.map(r => r.toArray ? r.toArray() : r) });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async findOne(req, res) {
        const id = parseInt(req.params.id);
        try {
            const item = await RoomService.getById(id);
            if (!item) return res.status(404).json({ error: 'Room not found' });
            res.json({ room: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async create(req, res) {
        try {
            const data = req.body;
            const item = await RoomService.create(data);
            res.status(201).json({ room: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async update(req, res) {
        const id = parseInt(req.params.id);
        try {
            const data = req.body;
            const item = await RoomService.update(id, data);
            if (!item) return res.status(400).json({ error: 'Update failed' });
            res.json({ room: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async delete(req, res) {
        const id = parseInt(req.params.id);
        try {
            const deleted = await RoomService.delete(id);
            if (!deleted) return res.status(404).json({ error: 'Delete failed' });
            res.json({ message: 'Room deleted successfully' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = RoomController;
