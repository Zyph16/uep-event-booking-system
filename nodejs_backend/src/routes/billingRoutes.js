const express = require('express');
const router = express.Router();
const BillingController = require('../controllers/billingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Roles = require('../core/roles');

const projectManagerAccess = [
    authMiddleware,
    roleMiddleware(Roles.ADMIN, Roles.PROJECT_MANAGER, Roles.UNIVERSITY_PRESIDENT)
];

router.post('/', projectManagerAccess, BillingController.store);
router.get('/income-stats', projectManagerAccess, BillingController.getIncomeStats);
router.get('/:id', authMiddleware, BillingController.show);

module.exports = router;
