const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Roles = require('../core/roles');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const receiptsDir = path.join(__dirname, '../../public/uploads/receipts');
if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
}

// Multer Config for Receipts
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/receipts');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'receipt_' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const adminOnly = [authMiddleware, roleMiddleware(Roles.ADMIN)];
const projectManagerAccess = [
    authMiddleware,
    roleMiddleware(Roles.ADMIN, Roles.PROJECT_MANAGER, Roles.UNIVERSITY_PRESIDENT)
];

// Public
router.get('/public', BookingController.getPublicSchedule);

// User
router.post('/', authMiddleware, BookingController.create);
router.get('/user', authMiddleware, BookingController.getMyBookings);
router.get('/my', authMiddleware, BookingController.getMyBookings);
router.get('/details', projectManagerAccess, BookingController.getWithDetails);
router.get('/', adminOnly, BookingController.findAll);

// Reports
router.get('/admin/approvals', adminOnly, BookingController.getApprovalsReport); // Note path change in express, handled by mounting or specific path

// Individual
router.get('/:id', authMiddleware, BookingController.findOne);
router.get('/:id/history', authMiddleware, BookingController.getHistory);
router.get('/:id/billing-context', authMiddleware, BookingController.getBillingContext);
router.put('/:id', authMiddleware, BookingController.update);
router.delete('/:id', adminOnly, BookingController.delete);

// Receipt Upload
router.post('/:id/upload-receipt', authMiddleware, upload.single('receipt'), BookingController.uploadReceipt);

module.exports = router;
