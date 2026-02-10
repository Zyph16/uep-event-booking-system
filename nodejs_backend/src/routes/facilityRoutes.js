const express = require('express');
const router = express.Router();
const FacilityController = require('../controllers/facilityController');
const FacilityEquipmentController = require('../controllers/facilityEquipmentController');
const FacilityRoomController = require('../controllers/facilityRoomController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Roles = require('../core/roles');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/facilities');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'facility_' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const adminOnly = [authMiddleware, roleMiddleware(Roles.ADMIN)];

// Public
router.get('/public', FacilityController.getPublicFacilities);

// Facilities CRUD
router.get('/', authMiddleware, FacilityController.findAll);
router.get('/:id', authMiddleware, FacilityController.findOne);
router.post('/', adminOnly, upload.single('image'), FacilityController.create);
router.put('/:id', adminOnly, upload.single('image'), FacilityController.update);
router.delete('/:id', adminOnly, FacilityController.delete);

// Facility Equipment (Junction)
router.get('/:facilityId/equipment', adminOnly, FacilityEquipmentController.getByFacility);
router.post('/:facilityId/equipment', adminOnly, FacilityEquipmentController.assignToFacility);
router.put('/:facilityId/equipment/:equipmentId', adminOnly, FacilityEquipmentController.updateQuantity);
router.delete('/:facilityId/equipment/:equipmentId', adminOnly, FacilityEquipmentController.removeFromFacility);

// Facility Room (Junction)
router.get('/:facilityId/rooms', adminOnly, FacilityRoomController.getByFacility);
router.post('/:facilityId/rooms', adminOnly, FacilityRoomController.assignToFacility);
router.delete('/:facilityId/rooms/:roomId', adminOnly, FacilityRoomController.removeFromFacility);

module.exports = router;
