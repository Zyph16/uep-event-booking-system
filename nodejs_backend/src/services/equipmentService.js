const EquipmentRepository = require('../repositories/equipmentRepository');

class EquipmentService {
    static async getAll() {
        return EquipmentRepository.findAll();
    }

    static async getById(id) {
        return EquipmentRepository.findById(id);
    }

    static async create(data) {
        return EquipmentRepository.create(data);
    }

    static async update(id, data) {
        return EquipmentRepository.update(id, data);
    }

    static async delete(id) {
        return EquipmentRepository.delete(id);
    }
}

module.exports = EquipmentService;
