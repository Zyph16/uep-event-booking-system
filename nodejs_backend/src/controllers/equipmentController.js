const EquipmentService = require('../services/equipmentService');

class EquipmentController {

    static async findAll(req, res) {
        try {
            const data = await EquipmentService.getAll();
            res.json({ equipment: data.map(e => e.toArray ? e.toArray() : e) });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async findOne(req, res) {
        const id = parseInt(req.params.id);
        try {
            const item = await EquipmentService.getById(id);
            if (!item) return res.status(404).json({ error: 'Equipment not found' });
            res.json({ equipment: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async create(req, res) {
        try {
            const data = req.body;
            const item = await EquipmentService.create(data);
            res.status(201).json({ equipment: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async update(req, res) {
        const id = parseInt(req.params.id);
        try {
            const data = req.body;
            const item = await EquipmentService.update(id, data);
            if (!item) return res.status(400).json({ error: 'Update failed' });
            res.json({ equipment: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async delete(req, res) {
        const id = parseInt(req.params.id);
        try {
            const deleted = await EquipmentService.delete(id);
            if (!deleted) return res.status(404).json({ error: 'Delete failed' });
            res.json({ message: 'Equipment deleted successfully' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = EquipmentController;
