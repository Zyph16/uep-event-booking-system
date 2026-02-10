const RoomRepository = require('../repositories/roomRepository');

class RoomService {
    static async getAll() {
        return RoomRepository.findAll();
    }

    static async getById(id) {
        return RoomRepository.findById(id);
    }

    static async create(data) {
        return RoomRepository.create(data);
    }

    static async update(id, data) {
        return RoomRepository.update(id, data);
    }

    static async delete(id) {
        return RoomRepository.delete(id);
    }
}

module.exports = RoomService;
