const UserEntityRepository = require('../repositories/userEntityRepository');
const bcrypt = require('bcryptjs');
const Roles = require('../core/roles');

class UserEntityService {
    static async register(username, roleId, password, facilityIds = []) {
        // Check if username exists
        const existing = await UserEntityRepository.findByUsername(username);
        if (existing) {
            throw new Error('Username already taken');
        }

        // Check for unique University President
        if (roleId === Roles.UNIVERSITY_PRESIDENT) {
            const allUsers = await UserEntityRepository.findAll();
            if (allUsers.some(u => u.role_id === Roles.UNIVERSITY_PRESIDENT)) {
                throw new Error('A University President already exists. Only one user can hold this role.');
            }
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

        // Check for unique University President
        if (updates.role_id === Roles.UNIVERSITY_PRESIDENT) {
            const allUsers = await UserEntityRepository.findAll();
            const existingPresident = allUsers.find(u => u.role_id === Roles.UNIVERSITY_PRESIDENT);
            if (existingPresident && existingPresident.id !== userId) {
                throw new Error('A University President already exists. Only one user can hold this role.');
            }
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
