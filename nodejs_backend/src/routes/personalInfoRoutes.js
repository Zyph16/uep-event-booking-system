const express = require('express');
const router = express.Router();
const PersonalInfoController = require('../controllers/personalInfoController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Roles = require('../core/roles');

const adminOnly = [authMiddleware, roleMiddleware(Roles.ADMIN)];

router.post('/', authMiddleware, PersonalInfoController.create);
router.get('/', adminOnly, PersonalInfoController.findAll);
router.get('/me', authMiddleware, PersonalInfoController.getByUserId);
router.get('/:id', adminOnly, PersonalInfoController.findOne);
router.put('/:id', authMiddleware, PersonalInfoController.update);
router.delete('/:id', adminOnly, PersonalInfoController.delete);

module.exports = router;
