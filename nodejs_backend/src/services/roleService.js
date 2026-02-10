const RoleRepository = require('../repositories/roleRepository');

class RoleService {
    static async createRole(name) {
        const existing = await RoleRepository.findByName(name);
        if (existing) {
            throw new Error('Role already exists');
        }
        return RoleRepository.create(name);
    }

    static async getAllRoles() {
        return RoleRepository.findAll();
    }

    static async getRoleById(id) {
        return RoleRepository.findById(id);
    }

    static async getRoleByName(name) {
        return RoleRepository.findByName(name);
    }

    static async updateRole(id, updates) {
        return RoleRepository.update(id, updates);
    }

    static async deleteRole(id) {
        return RoleRepository.delete(id);
    }
}

module.exports = RoleService;
