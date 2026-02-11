const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const personalInfoRoutes = require('./personalInfoRoutes');
const facilityRoutes = require('./facilityRoutes');
const bookingRoutes = require('./bookingRoutes');
const notificationRoutes = require('./notificationRoutes');
const roleRoutes = require('./roleRoutes');
const equipmentRoutes = require('./equipmentRoutes');
const roomRoutes = require('./roomRoutes');
const billingRoutes = require('./billingRoutes');


router.use('/users', userRoutes);
router.use('/personalinfo', personalInfoRoutes);

router.use('/facilities', facilityRoutes);
router.use('/bookings', bookingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/roles', roleRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/rooms', roomRoutes);
router.use('/billing', billingRoutes);

// ADMIN route exception in PHP structure
// $router->get('/api/admin/approvals', ...) was mapped in bookingRoutes 
// but since we mount bookingRoutes at /bookings, the path becomes /bookings/admin/approvals
// which differs from /api/admin/approvals
// However, I handled it in bookingRoutes by just adding it under /admin/..., 
// so mounting /bookings will result in /bookings/admin/approvals. 
// I should probably fix that to match EXACTLY /api/admin/approvals if the frontend is strict.
// OR I can mount a separate admin router.
// Let's check bookingRoutes again.
// In bookingRoutes: router.get('/admin/approvals', ...)
// If mounted at /bookings, it becomes /bookings/admin/approvals.
// The PHP route is /api/admin/approvals.
// I will add a separate mount for admin if needed, or just let it diverge if acceptable.
// The user said: "Match input/output behavior".
// So I should match the URL.
// I'll add a specific route here for that one case or remap it.

const BookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Roles = require('../core/roles');
const adminOnly = [authMiddleware, roleMiddleware(Roles.ADMIN)];

router.get('/admin/approvals', adminOnly, BookingController.getApprovalsReport);

module.exports = router;
