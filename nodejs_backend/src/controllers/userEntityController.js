const UserEntityService = require('../services/userEntityService');
const PersonalInfoService = require('../services/personalInfoService');
const RoleService = require('../services/roleService');
const Roles = require('../core/roles');
const Helpers = require('../core/helpers');
const Jwt = require('../core/jwt');

class UserEntityController {

    // Register
    static async register(req, res) {
        const data = req.body;
        const errors = Helpers.validate(data, {
            username: 'required|min:3',
            password: 'required|min:8'
        });

        if (errors) {
            return res.status(422).json({ errors });
        }

        try {
            // Default role_id = 4 ("user"/"client")
            const user = await UserEntityService.register(
                data.username,
                Roles.CLIENT, // 4
                data.password
            );

            // Save Personal Info
            if (data.personalInfo) {
                const pData = data.personalInfo;
                pData.userID = user.id;
                await PersonalInfoService.create(pData);
            }

            const token = Jwt.sign({
                sub: user.id,
                role: user.roleName
            });

            // Matches PHP response structure
            res.status(201).json({
                user: user.toPublicArray ? user.toPublicArray() : user,
                token
            });

        } catch (e) {
            res.status(409).json({ error: e.message });
        }
    }

    // Login
    static async login(req, res) {
        const data = req.body;
        console.log('Login attempt:', data);
        const errors = Helpers.validate(data, {
            username: 'required',
            password: 'required'
        });
        console.log('Validation results:', errors);

        if (errors) {
            return res.status(422).json({ errors });
        }

        try {
            const user = await UserEntityService.login(data.username, data.password);

            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            const token = Jwt.sign({
                sub: user.id,
                role: user.roleName
            });

            const facilities = await UserEntityService.getAssignedFacilities(user.id);
            const userData = user.toPublicArray ? user.toPublicArray() : user;
            userData.assigned_facilities = facilities;

            res.status(200).json({
                user: userData,
                token
            });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // Logout
    static async logout(req, res) {
        res.json({ message: 'Logged out successfully' });
    }

    // Me
    static async me(req, res) {
        const userId = req.user ? req.user.id : parseInt(req.params.userId || 0);

        try {
            const user = await UserEntityService.getUserById(userId);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const facilities = await UserEntityService.getAssignedFacilities(userId);
            const userData = user.toPublicArray ? user.toPublicArray() : user;
            userData.assigned_facilities = facilities;

            res.json({ user: userData });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // Find All
    static async findAll(req, res) {
        try {
            const users = await UserEntityService.getAllUsers();
            res.json({
                users: users.map(u => u.toPublicArray ? u.toPublicArray() : u)
            });
        } catch (e) {
            res.status(500).json({ error: 'Failed to fetch users', detail: e.message });
        }
    }

    // Create (Admin)
    static async create(req, res) {
        const data = req.body;
        const errors = Helpers.validate(data, {
            username: 'required|min:3',
            password: 'required|min:6',
            role: 'required'
        });

        if (errors) {
            return res.status(422).json({ errors });
        }

        try {
            const roleMap = {
                'admin': Roles.ADMIN,
                'president': Roles.UNIVERSITY_PRESIDENT,
                'university_president': Roles.UNIVERSITY_PRESIDENT,
                'project_manager': Roles.PROJECT_MANAGER,
                'organizer': Roles.PROJECT_MANAGER,
                'client': Roles.CLIENT,
                'user': Roles.CLIENT
            };

            let roleId = data.role_id || roleMap[data.role] || null;

            if (!roleId && data.role) {
                const roleObj = await RoleService.getRoleByName(data.role);
                roleId = roleObj ? roleObj.id : Roles.CLIENT;
            } else if (!roleId) {
                roleId = Roles.CLIENT;
            }

            const facilityIds = data.facility_ids || [];

            const user = await UserEntityService.register(
                data.username,
                roleId,
                data.password,
                facilityIds
            );

            res.status(201).json({
                message: 'User created successfully',
                user: user.toPublicArray ? user.toPublicArray() : user,
                assigned_facilities: facilityIds
            });

        } catch (e) {
            res.status(409).json({ error: e.message });
        }
    }

    // Find One
    static async findOne(req, res) {
        const userId = parseInt(req.params.id);

        try {
            const user = await UserEntityService.getUserById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const facilities = await UserEntityService.getAssignedFacilities(userId);

            res.json({
                user: user.toPublicArray ? user.toPublicArray() : user,
                assigned_facilities: facilities
            });
        } catch (e) {
            res.status(500).json({ error: 'Failed to fetch user', detail: e.message });
        }
    }

    // Update
    static async update(req, res) {
        const userId = parseInt(req.params.id);
        const data = req.body;

        try {
            if (data.role) {
                const roleMap = {
                    'admin': Roles.ADMIN,
                    'president': Roles.UNIVERSITY_PRESIDENT,
                    'university_president': Roles.UNIVERSITY_PRESIDENT,
                    'project_manager': Roles.PROJECT_MANAGER,
                    'organizer': Roles.PROJECT_MANAGER,
                    'client': Roles.CLIENT,
                    'user': Roles.CLIENT
                };

                let roleId = roleMap[data.role] || null;
                if (!roleId) {
                    const roleObj = await RoleService.getRoleByName(data.role);
                    roleId = roleObj ? roleObj.id : Roles.CLIENT;
                }
                data.role_id = roleId;
                delete data.role;
            }

            const updated = await UserEntityService.updateUser(userId, data);

            if (!updated) {
                return res.status(400).json({ error: 'Update failed or user not found' });
            }

            const facilities = await UserEntityService.getAssignedFacilities(userId);

            res.json({
                user: updated.toPublicArray ? updated.toPublicArray() : updated,
                assigned_facilities: facilities
            });

        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // Delete
    static async delete(req, res) {
        const userId = parseInt(req.params.id);

        try {
            const deleted = await UserEntityService.deleteUser(userId);
            if (!deleted) {
                return res.status(404).json({ error: 'User not found or delete failed' });
            }
            res.json({ message: 'User deleted successfully' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = UserEntityController;
