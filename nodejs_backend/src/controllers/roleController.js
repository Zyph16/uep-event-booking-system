const RoleService = require('../services/roleService');
const Helpers = require('../core/helpers');

class RoleController {
    static async create(req, res) {
        const data = req.body;
        const errors = Helpers.validate(data, {
            name: 'required|min:3'
        });

        if (errors) {
            return res.status(422).json({ errors });
        }

        try {
            const role = await RoleService.createRole(data.name);
            // Assuming role model has toPublicArray or we just sanitize manually
            res.status(201).json({ role: role.toPublicArray ? role.toPublicArray() : role });
        } catch (e) {
            res.status(409).json({ error: e.message });
        }
    }

    static async findAll(req, res) {
        try {
            const roles = await RoleService.getAllRoles();
            res.json({
                roles: roles.map(r => r.toPublicArray ? r.toPublicArray() : r)
            });
        } catch (e) {
            res.status(500).json({ error: 'Failed to fetch roles', detail: e.message });
        }
    }

    static async findOne(req, res) {
        const id = parseInt(req.params.id);
        try {
            const role = await RoleService.getRoleById(id);
            if (!role) {
                return res.status(404).json({ error: 'Role not found' });
            }
            res.json({ role: role.toPublicArray ? role.toPublicArray() : role });
        } catch (e) {
            res.status(500).json({ error: 'Failed to fetch role', detail: e.message });
        }
    }

    static async update(req, res) {
        const id = parseInt(req.params.id);
        const data = req.body;
        try {
            const updated = await RoleService.updateRole(id, data);
            if (!updated) {
                return res.status(400).json({ error: 'Update failed or role not found' });
            }
            res.json({ role: updated.toPublicArray ? updated.toPublicArray() : updated });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async delete(req, res) {
        const id = parseInt(req.params.id);
        try {
            const deleted = await RoleService.deleteRole(id);
            if (!deleted) {
                return res.status(404).json({ error: 'Role not found or delete failed' });
            }
            res.json({ message: 'Role deleted successfully' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = RoleController;
