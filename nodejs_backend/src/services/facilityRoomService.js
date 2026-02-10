const FacilityRoomRepository = require('../repositories/facilityRoomRepository');

class FacilityRoomService {
    static async getByFacilityId(facilityId) {
        return FacilityRoomRepository.findByFacilityId(facilityId);
    }

    static async getByRoomId(roomId) {
        return FacilityRoomRepository.findByRoomId(roomId);
    }

    static async assignToFacility(data) {
        return FacilityRoomRepository.create(data);
    }

    static async removeFromFacility(facilityId, roomId) {
        return FacilityRoomRepository.delete(facilityId, roomId);
    }

    static async syncForFacility(facilityId, roomIds) {
        return FacilityRoomRepository.syncForFacility(facilityId, roomIds);
    }
}

module.exports = FacilityRoomService;
