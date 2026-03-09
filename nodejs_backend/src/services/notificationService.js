const NotificationRepository = require('../repositories/notificationRepository');

class NotificationService {
    static async getAll() {
        return NotificationRepository.findAll();
    }

    static async getById(id) {
        return NotificationRepository.findById(id);
    }

    static async getByUserId(userId) {
        return NotificationRepository.findByUserId(userId);
    }

    static async markAllAsRead(userId) {
        return NotificationRepository.markAllAsRead(userId);
    }

    static async create(data) {
        return NotificationRepository.create(data);
    }

    static async update(id, data) {
        return NotificationRepository.update(id, data);
    }

    static async delete(id) {
        return NotificationRepository.delete(id);
    }
    static async deleteMultiple(ids, userId) {
        return NotificationRepository.deleteMultiple(ids, userId);
    }
}

module.exports = NotificationService;
