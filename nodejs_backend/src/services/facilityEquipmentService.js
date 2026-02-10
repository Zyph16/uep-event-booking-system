const FacilityEquipmentRepository = require('../repositories/facilityEquipmentRepository');

class FacilityEquipmentService {
    static async getByFacilityId(facilityId) {
        return FacilityEquipmentRepository.findByFacilityId(facilityId);
    }

    static async getByEquipmentId(equipmentId) {
        return FacilityEquipmentRepository.findByEquipmentId(equipmentId);
    }

    static async assignToFacility(data) {
        return FacilityEquipmentRepository.create(data);
    }

    static async updateQuantity(facilityId, equipmentId, quantity) {
        return FacilityEquipmentRepository.updateQuantity(facilityId, equipmentId, quantity);
    }

    static async removeFromFacility(facilityId, equipmentId) {
        return FacilityEquipmentRepository.delete(facilityId, equipmentId);
    }

    static async syncForFacility(facilityId, equipmentData) {
        return FacilityEquipmentRepository.syncForFacility(facilityId, equipmentData);
    }
}

module.exports = FacilityEquipmentService;
