const FacilityRepository = require('../repositories/facilityRepository');

class FacilityService {
    static async getAll() {
        return FacilityRepository.findAll();
    }

    static async getById(id) {
        return FacilityRepository.findById(id);
    }

    static async create(data) {
        return FacilityRepository.create(data);
    }

    static async update(id, data) {
        return FacilityRepository.update(id, data);
    }

    static async delete(id) {
        return FacilityRepository.delete(id);
    }
}

module.exports = FacilityService;
