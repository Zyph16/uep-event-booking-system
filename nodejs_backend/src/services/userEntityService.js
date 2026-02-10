const UserEntityRepository = require('../repositories/userEntityRepository');
const bcrypt = require('bcryptjs');

class UserEntityService {
    static async register(username, roleId, password, facilityIds = []) {
        // Check if username exists
        const existing = await UserEntityRepository.findByUsername(username);
        if (existing) {
            throw new Error('Username already taken');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10); // 10 rounds default

        const user = await UserEntityRepository.create(username, roleId, passwordHash);

        // Sync facilities if provided
        if (user && facilityIds.length > 0) {
            await UserEntityRepository.syncFacilities(user.id, facilityIds);
        }

        return user;
    }

    static async login(username, password) {
        const user = await UserEntityRepository.findByUsername(username);
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return user;
    }

    static async getAllUsers() {
        return UserEntityRepository.findAll();
    }

    static async getUserById(id) {
        return UserEntityRepository.findById(id);
    }

    static async getUserByUsername(username) {
        return UserEntityRepository.findByUsername(username);
    }

    static async updateUser(userId, updates) {
        if (updates.password) {
            updates.password_hash = await bcrypt.hash(updates.password, 10);
            delete updates.password;
        }

        // Extract facility_ids
        let facilityIds = null;
        if (updates.facility_ids) {
            facilityIds = updates.facility_ids;
            delete updates.facility_ids;
        }

        const user = await UserEntityRepository.update(userId, updates);

        if (user && facilityIds && Array.isArray(facilityIds)) {
            await UserEntityRepository.syncFacilities(userId, facilityIds);
        }

        return user;
    }

    static async deleteUser(userId) {
        return UserEntityRepository.delete(userId);
    }

    static async getAssignedFacilities(userId) {
        return UserEntityRepository.getAssignedFacilities(userId);
    }
}

module.exports = UserEntityService;
