const express = require('express');
const router = express.Router();
const EquipmentController = require('../controllers/equipmentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Roles = require('../core/roles');

const adminOnly = [authMiddleware, roleMiddleware(Roles.ADMIN)];

router.get('/', authMiddleware, EquipmentController.findAll);
router.get('/:id', authMiddleware, EquipmentController.findOne);
router.post('/', adminOnly, EquipmentController.create);
router.put('/:id', adminOnly, EquipmentController.update);
router.delete('/:id', adminOnly, EquipmentController.delete);

module.exports = router;
