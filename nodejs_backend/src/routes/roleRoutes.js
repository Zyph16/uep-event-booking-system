const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/roleController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Roles = require('../core/roles');

const adminOnly = [authMiddleware, roleMiddleware(Roles.ADMIN)];

router.get('/', adminOnly, RoleController.findAll);
router.get('/:id', adminOnly, RoleController.findOne);
router.post('/', adminOnly, RoleController.create);
router.put('/:id', adminOnly, RoleController.update);
router.delete('/:id', adminOnly, RoleController.delete);

module.exports = router;
