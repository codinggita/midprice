const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const { getPharmacy, upsertPharmacy } = require('../controllers/pharmacyController');

router.use(protect, requireRole('vendor'));

router.get('/',  getPharmacy);
router.put('/',  upsertPharmacy);

module.exports = router;
