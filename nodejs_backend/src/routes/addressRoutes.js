const express = require('express');
const router = express.Router();
const AddressController = require('../controllers/AddressController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public or Protected? User needs to be logged in to edit profile, so protected is safer.
// But technically address data is public info.
// Using verifyToken to prevent unauthorized abuse of the proxy.
router.get('/provinces', verifyToken, AddressController.getProvinces);
router.get('/cities', verifyToken, AddressController.getCities);
router.get('/barangays', verifyToken, AddressController.getBarangays);

module.exports = router;
