const Inventory = require('../models/Inventory');
const Pharmacy  = require('../models/Pharmacy');
const Medicine  = require('../models/Medicine');

// Helper — get or create medicine by name
async function findOrCreateMedicine(name) {
  const clean = name.trim();
  let med = await Medicine.findOne({ name: new RegExp(`^${clean}$`, 'i') });
  if (!med) med = await Medicine.create({ name: clean });
  return med;
}

// GET /api/vendor/inventory
const getInventory = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ vendorId: req.user._id });
    if (!pharmacy) return res.status(404).json({ message: 'Set up your pharmacy profile first.' });

    const inventory = await Inventory.find({ pharmacyId: pharmacy._id, isListed: true })
      .populate('medicineId')
      .sort({ updatedAt: -1 });

    res.json({ inventory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/vendor/inventory  — body: { medicineName, price, stockQty }
const addInventory = async (req, res) => {
  try {
    const { medicineName, price, stockQty } = req.body;

    if (!medicineName) return res.status(400).json({ message: 'Medicine name is required.' });
    if (!price || Number(price) <= 0) return res.status(400).json({ message: 'Price must be greater than 0.' });

    const pharmacy = await Pharmacy.findOne({ vendorId: req.user._id });
    if (!pharmacy) return res.status(404).json({ message: 'Set up your pharmacy profile first.' });

    const medicine = await findOrCreateMedicine(medicineName);

    // Check if this medicine is already in inventory
    const existing = await Inventory.findOne({ pharmacyId: pharmacy._id, medicineId: medicine._id });
    if (existing) {
      // Re-list and update
      existing.isListed     = true;
      existing.sellingPrice = Number(price);
      existing.mrp          = Number(price);
      existing.stockQty     = Number(stockQty) || existing.stockQty;
      existing.updatedAt    = Date.now();
      await existing.save();
      const populated = await existing.populate('medicineId');
      return res.json(populated);
    }

    const item = await Inventory.create({
      pharmacyId:   pharmacy._id,
      medicineId:   medicine._id,
      mrp:          Number(price),
      sellingPrice: Number(price),
      stockQty:     Number(stockQty) || 0,
    });

    const populated = await item.populate('medicineId');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/vendor/inventory/:id  — body: { price?, stockQty? }
const updateInventory = async (req, res) => {
  try {
    const { price, stockQty } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    if (price     !== undefined) { item.sellingPrice = Number(price); item.mrp = Number(price); }
    if (stockQty  !== undefined) item.stockQty = Number(stockQty);
    item.updatedAt = Date.now();
    await item.save();

    const populated = await item.populate('medicineId');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/vendor/inventory/:id  — hard delete
const deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getInventory, addInventory, updateInventory, deleteInventory };
