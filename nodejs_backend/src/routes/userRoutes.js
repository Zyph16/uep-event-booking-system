const express = require('express');
const router = express.Router();
const UserEntityController = require('../controllers/userEntityController');
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Roles = require('../core/roles');

// Public
router.post('/register', UserEntityController.register);
router.post('/login', UserEntityController.login); // UserEntityController handles login in PHP
router.post('/logout', UserEntityController.logout);

// Auth Only
router.get('/me', authMiddleware, UserEntityController.me);

// Admin Only
const adminOnly = [authMiddleware, roleMiddleware(Roles.ADMIN)];

router.get('/', adminOnly, UserEntityController.findAll);
router.post('/', adminOnly, UserEntityController.create);
router.get('/:id', adminOnly, UserEntityController.findOne);
router.put('/:id', adminOnly, UserEntityController.update);
router.delete('/:id', adminOnly, UserEntityController.delete);

module.exports = router;
