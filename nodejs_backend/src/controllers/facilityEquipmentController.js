const FacilityEquipmentService = require('../services/facilityEquipmentService');

class FacilityEquipmentController {

    // GET /api/facilities/:facilityId/equipment
    static async getByFacility(req, res) {
        const facilityId = parseInt(req.params.facilityId);
        try {
            const data = await FacilityEquipmentService.getByFacilityId(facilityId);
            res.json({ equipment: data });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // POST /api/facilities/:facilityId/equipment
    static async assignToFacility(req, res) {
        const facilityId = parseInt(req.params.facilityId);
        const data = req.body;
        data.facilityID = facilityId;

        try {
            const success = await FacilityEquipmentService.assignToFacility(data);
            if (!success) return res.status(400).json({ error: 'Failed to assign equipment' });
            res.status(201).json({ message: 'Equipment assigned successfully' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // PUT /api/facilities/:facilityId/equipment/:equipmentId
    static async updateQuantity(req, res) {
        const facilityId = parseInt(req.params.facilityId);
        const equipmentId = parseInt(req.params.equipmentId);
        const data = req.body;
        const quantity = data.quantity || 1;

        try {
            const success = await FacilityEquipmentService.updateQuantity(facilityId, equipmentId, quantity);
            if (!success) return res.status(400).json({ error: 'Update failed' });
            res.json({ message: 'Quantity updated successfully' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // DELETE /api/facilities/:facilityId/equipment/:equipmentId
    static async removeFromFacility(req, res) {
        const facilityId = parseInt(req.params.facilityId);
        const equipmentId = parseInt(req.params.equipmentId);

        try {
            const deleted = await FacilityEquipmentService.removeFromFacility(facilityId, equipmentId);
            if (!deleted) return res.status(404).json({ error: 'Delete failed' });
            res.json({ message: 'Equipment removed from facility' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = FacilityEquipmentController;
