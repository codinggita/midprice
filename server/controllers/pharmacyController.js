const Pharmacy = require('../models/Pharmacy');

// @desc  Get vendor's pharmacy profile
// @route GET /api/vendor/pharmacy
const getPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ vendorId: req.user._id });
    if (!pharmacy) return res.status(404).json({ message: 'No pharmacy profile yet.' });
    res.json(pharmacy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create or update vendor's pharmacy profile
// @route PUT /api/vendor/pharmacy
const upsertPharmacy = async (req, res) => {
  try {
    const { name, address, lat, lng, hours } = req.body;
    if (!name) return res.status(400).json({ message: 'Shop name is required.' });

    let pharmacy = await Pharmacy.findOne({ vendorId: req.user._id });
    if (pharmacy) {
      pharmacy.name    = name;
      pharmacy.address = address || pharmacy.address;
      pharmacy.lat     = lat     !== undefined ? lat  : pharmacy.lat;
      pharmacy.lng     = lng     !== undefined ? lng  : pharmacy.lng;
      pharmacy.hours   = hours   || pharmacy.hours;
      await pharmacy.save();
    } else {
      pharmacy = await Pharmacy.create({
        vendorId: req.user._id,
        name,
        address: address || '',
        lat:     lat     || 0,
        lng:     lng     || 0,
        hours:   hours   || '',
      });
    }
    res.json(pharmacy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPharmacy, upsertPharmacy };
