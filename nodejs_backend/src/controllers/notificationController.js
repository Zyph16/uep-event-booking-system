const NotificationService = require('../services/notificationService');

class NotificationController {

    static async findAll(req, res) {
        try {
            const data = await NotificationService.getAll();
            res.json({ notifications: data.map(n => n.toArray ? n.toArray() : n) });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async getMyNotifications(req, res) {
        try {
            const user = req.user;
            if (!user) return res.status(401).json({ error: 'Unauthorized' });

            const data = await NotificationService.getByUserId(user.id);
            res.json({ notifications: data.map(n => n.toArray ? n.toArray() : n) });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async markAllRead(req, res) {
        try {
            const user = req.user;
            if (!user) return res.status(401).json({ error: 'Unauthorized' });

            await NotificationService.markAllAsRead(user.id);
            res.json({ message: 'All marked as read' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async findOne(req, res) {
        const id = parseInt(req.params.id);
        try {
            const item = await NotificationService.getById(id);
            if (!item) return res.status(404).json({ error: 'Not found' });
            res.json({ notification: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async create(req, res) {
        try {
            const data = req.body;
            const user = req.user;

            if (!user) return res.status(401).json({ error: 'Unauthorized' });

            // If creating for another user, must be Admin/PM
            // validation: data.user_id is target.
            if (data.user_id && data.user_id != user.id) {
                const privilegedRoles = [1, 2, 3];
                if (!privilegedRoles.includes(parseInt(user.role_id))) {
                    return res.status(403).json({ error: 'Forbidden: Cannot create notification for other users' });
                }
            } else {
                // If not specified, default to self (or validation error if required)
                // If specified and same as self, allowed.
                if (!data.user_id) data.user_id = user.id;
            }

            const item = await NotificationService.create(data);
            res.status(201).json({ notification: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async update(req, res) {
        const id = parseInt(req.params.id);
        try {
            const data = req.body;
            const user = req.user;

            // Check ownership
            const existing = await NotificationService.getById(id);
            if (!existing) return res.status(404).json({ error: 'Not found' });

            if (existing.user_id !== user.id) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const item = await NotificationService.update(id, data);
            if (!item) return res.status(400).json({ error: 'Update failed' });
            res.json({ notification: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async delete(req, res) {
        const id = parseInt(req.params.id);
        try {
            const user = req.user;

            // Check ownership
            const existing = await NotificationService.getById(id);
            if (!existing) return res.status(404).json({ error: 'Not found' });

            if (existing.user_id !== user.id) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const deleted = await NotificationService.delete(id);
            if (!deleted) return res.status(404).json({ error: 'Delete failed' });
            res.json({ message: 'Deleted successfully' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = NotificationController;
