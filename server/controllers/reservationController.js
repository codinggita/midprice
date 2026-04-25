const Reservation = require('../models/Reservation');
const Pharmacy = require('../models/Pharmacy');

// @desc    Create a reservation
// @route   POST /api/reservations
// @access  Private (patient)
const createReservation = async (req, res) => {
  try {
    const { pharmacyId, medicineId, qty } = req.body;

    if (!pharmacyId || !medicineId) {
      return res.status(400).json({ message: 'pharmacyId and medicineId are required' });
    }

    const reservationCode = 'MED-' + Date.now().toString().slice(-6);

    const reservation = await Reservation.create({
      patientId: req.user._id,
      pharmacyId,
      medicineId,
      qty: qty || 1,
      status: 'pending',
      reservationCode,
    });

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient's reservations
// @route   GET /api/reservations
// @access  Private (patient)
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ patientId: req.user._id })
      .populate('pharmacyId')
      .populate('medicineId')
      .sort({ createdAt: -1 });

    res.status(200).json({ count: reservations.length, reservations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor's pharmacy reservations
// @route   GET /api/vendor/reservations
// @access  Private (vendor)
const getVendorReservations = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ vendorId: req.user._id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found. Please register your pharmacy first.' });
    }

    // Build query — optionally filter by status
    const query = { pharmacyId: pharmacy._id };
    if (req.query.status) {
      query.status = req.query.status;
    }

    const reservations = await Reservation.find(query)
      .populate('patientId', 'name phone')
      .populate('medicineId')
      .sort({ createdAt: -1 });

    res.status(200).json({ count: reservations.length, reservations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update reservation status
// @route   PATCH /api/vendor/reservations/:id/status
// @access  Private (vendor)
const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['ready', 'completed', 'cancelled'];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${allowed.join(', ')}`,
      });
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    reservation.status = status;
    await reservation.save();

    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getVendorReservations,
  updateReservationStatus,
};
