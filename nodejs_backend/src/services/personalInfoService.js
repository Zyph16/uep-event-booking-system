const PersonalInfoRepository = require('../repositories/personalInfoRepository');

class PersonalInfoService {
    static async getAll() {
        return PersonalInfoRepository.findAll();
    }

    static async getById(id) {
        return PersonalInfoRepository.findById(id);
    }

    static async getByUserId(userId) {
        return PersonalInfoRepository.findByUserId(userId);
    }

    static async create(data) {
        return PersonalInfoRepository.create(data);
    }

    static async update(id, data) {
        return PersonalInfoRepository.update(id, data);
    }

    static async delete(id) {
        return PersonalInfoRepository.delete(id);
    }
}

module.exports = PersonalInfoService;
