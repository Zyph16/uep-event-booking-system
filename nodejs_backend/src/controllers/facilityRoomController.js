const FacilityRoomService = require('../services/facilityRoomService');

class FacilityRoomController {

    // GET /api/facilities/:facilityId/rooms
    static async getByFacility(req, res) {
        const facilityId = parseInt(req.params.facilityId);
        try {
            const data = await FacilityRoomService.getByFacilityId(facilityId);
            res.json({ rooms: data });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // POST /api/facilities/:facilityId/rooms
    static async assignToFacility(req, res) {
        const facilityId = parseInt(req.params.facilityId);
        const data = req.body;
        data.facilityID = facilityId;

        try {
            const success = await FacilityRoomService.assignToFacility(data);
            if (!success) return res.status(400).json({ error: 'Failed to assign room' });
            res.status(201).json({ message: 'Room assigned successfully' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // DELETE /api/facilities/:facilityId/rooms/:roomId
    static async removeFromFacility(req, res) {
        const facilityId = parseInt(req.params.facilityId);
        const roomId = parseInt(req.params.roomId);

        try {
            const deleted = await FacilityRoomService.removeFromFacility(facilityId, roomId);
            if (!deleted) return res.status(404).json({ error: 'Delete failed' });
            res.json({ message: 'Room removed from facility' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = FacilityRoomController;
