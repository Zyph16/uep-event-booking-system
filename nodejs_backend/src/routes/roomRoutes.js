const express = require('express');
const router = express.Router();
const RoomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Roles = require('../core/roles');

const adminOnly = [authMiddleware, roleMiddleware(Roles.ADMIN)];

router.get('/', authMiddleware, RoomController.findAll);
router.get('/:id', authMiddleware, RoomController.findOne);
router.post('/', adminOnly, RoomController.create);
router.put('/:id', adminOnly, RoomController.update);
router.delete('/:id', adminOnly, RoomController.delete);

module.exports = router;
