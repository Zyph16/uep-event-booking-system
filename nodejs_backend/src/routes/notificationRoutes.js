const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Roles = require('../core/roles');

const adminOnly = [authMiddleware, roleMiddleware(Roles.ADMIN)];

router.post('/', authMiddleware, NotificationController.create);
router.get('/my', authMiddleware, NotificationController.getMyNotifications);
router.put('/read-all', authMiddleware, NotificationController.markAllRead);
router.get('/', adminOnly, NotificationController.findAll);
router.get('/:id', authMiddleware, NotificationController.findOne);
router.put('/:id', authMiddleware, NotificationController.update);
router.delete('/:id', authMiddleware, NotificationController.delete);

module.exports = router;
