const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
  createReservation,
  getMyReservations,
  getVendorReservations,
  updateReservationStatus,
} = require('../controllers/reservationController');

// ── Patient routes ──
// POST   /api/reservations          → create reservation
router.post('/', protect, requireRole('patient'), createReservation);

// GET    /api/reservations          → list my reservations
router.get('/', protect, requireRole('patient'), getMyReservations);

// ── Vendor routes ──
// GET    /api/vendor/reservations   → list pharmacy reservations
router.get('/vendor', protect, requireRole('vendor'), getVendorReservations);

// PATCH  /api/vendor/reservations/:id/status → update status
router.patch('/vendor/:id/status', protect, requireRole('vendor'), updateReservationStatus);

module.exports = router;
