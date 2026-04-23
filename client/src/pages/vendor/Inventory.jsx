import React, { useState, useMemo } from 'react';

/* ── Hardcoded medicines ── */
const initialMedicines = [
  { id: 1, name: 'Metformin', genericName: 'Metformin HCl', dosage: '500mg', packSize: 'Strip of 15', mrp: 145, sellingPrice: 85, stock: 120, status: 'Listed' },
  { id: 2, name: 'Amlodipine', genericName: 'Amlodipine Besylate', dosage: '5mg', packSize: 'Strip of 10', mrp: 95, sellingPrice: 62, stock: 80, status: 'Listed' },
  { id: 3, name: 'Cetirizine', genericName: 'Cetirizine HCl', dosage: '10mg', packSize: 'Strip of 10', mrp: 45, sellingPrice: 28, stock: 0, status: 'Out of Stock' },
  { id: 4, name: 'Omeprazole', genericName: 'Omeprazole', dosage: '20mg', packSize: 'Strip of 15', mrp: 110, sellingPrice: 72, stock: 45, status: 'Listed' },
  { id: 5, name: 'Azithromycin', genericName: 'Azithromycin', dosage: '250mg', packSize: 'Strip of 6', mrp: 180, sellingPrice: 125, stock: 3, status: 'Listed' },
  { id: 6, name: 'Paracetamol', genericName: 'Acetaminophen', dosage: '500mg', packSize: 'Strip of 15', mrp: 35, sellingPrice: 22, stock: 200, status: 'Listed' },
  { id: 7, name: 'Losartan', genericName: 'Losartan Potassium', dosage: '50mg', packSize: 'Strip of 10', mrp: 130, sellingPrice: 88, stock: 0, status: 'Unlisted' },
  { id: 8, name: 'Atorvastatin', genericName: 'Atorvastatin Calcium', dosage: '10mg', packSize: 'Strip of 10', mrp: 160, sellingPrice: 95, stock: 55, status: 'Listed' },
];

/* ── Styles ── */
const s = {
  page: { maxWidth: '1020px' },

  /* Top bar */
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  searchInput: {
    flex: '0 1 360px',
    padding: '0.7rem 1rem',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  addBtn: {
    padding: '0.7rem 1.4rem',
    borderRadius: '12px',
    border: 'none',
    background: '#1D9E75',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    boxShadow: '0 4px 14px rgba(29,158,117,0.25)',
    whiteSpace: 'nowrap',
  },

  /* Table */
  tableWrap: {
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    border: '1px solid #f3f4f6',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: {
    padding: '0.8rem 0.75rem',
    textAlign: 'left',
    fontWeight: 700,
    color: '#374151',
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #f3f4f6',
    background: '#fafbfc',
  },
  td: {
    padding: '0.75rem',
    borderBottom: '1px solid #f3f4f6',
    color: '#374151',
    verticalAlign: 'middle',
  },
  medName: { fontWeight: 600, color: '#1a1a2e' },
  price: { fontWeight: 700, color: '#1D9E75' },
  mrp: { color: '#9ca3af' },

  /* Status badges */
  badgeListed: {
    display: 'inline-block', padding: '0.18rem 0.55rem', borderRadius: '8px',
    background: '#d1fae5', color: '#065f46', fontSize: '0.72rem', fontWeight: 600,
  },
  badgeUnlisted: {
    display: 'inline-block', padding: '0.18rem 0.55rem', borderRadius: '8px',
    background: '#f3f4f6', color: '#6b7280', fontSize: '0.72rem', fontWeight: 600,
  },
  badgeOos: {
    display: 'inline-block', padding: '0.18rem 0.55rem', borderRadius: '8px',
    background: '#fee2e2', color: '#991b1b', fontSize: '0.72rem', fontWeight: 600,
  },

  /* Action buttons */
  actionRow: { display: 'flex', gap: '0.35rem' },
  iconBtn: {
    width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #e5e7eb',
    background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '0.85rem', transition: 'all 0.15s ease',
  },
  saveBtn: {
    width: '32px', height: '32px', borderRadius: '8px', border: 'none',
    background: '#1D9E75', color: '#fff', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem',
    fontWeight: 700, transition: 'background 0.15s ease',
  },
  cancelEditBtn: {
    width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #e5e7eb',
    background: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem',
    fontWeight: 700, transition: 'all 0.15s ease',
  },

  /* Inline edit input */
  inlineInput: {
    width: '70px', padding: '0.35rem 0.5rem', borderRadius: '8px',
    border: '2px solid #1D9E75', fontSize: '0.85rem', fontWeight: 600,
    outline: 'none', textAlign: 'center',
  },

  /* Empty */
  empty: {
    textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.9rem',
  },

  /* ── Modal ── */
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 100,
  },
  modal: {
    background: '#fff', borderRadius: '20px', width: '600px', maxHeight: '90vh',
    overflowY: 'auto', padding: '2rem', boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
  },
  modalTitle: {
    fontSize: '1.3rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '1.5rem',
  },
  formGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem',
  },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  formGroupFull: {
    display: 'flex', flexDirection: 'column', gap: '0.3rem', gridColumn: '1 / -1',
  },
  formLabel: {
    fontSize: '0.8rem', fontWeight: 600, color: '#374151',
  },
  formInput: {
    padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1.5px solid #e5e7eb',
    fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s ease',
  },
  savingsHint: {
    fontSize: '0.8rem', fontWeight: 600, color: '#22c55e', marginTop: '0.25rem',
  },
  modalActions: {
    display: 'flex', gap: '0.75rem', justifyContent: 'flex-end',
  },
  modalSaveBtn: {
    padding: '0.7rem 1.5rem', borderRadius: '12px', border: 'none',
    background: '#1D9E75', color: '#fff', fontWeight: 700, fontSize: '0.9rem',
    cursor: 'pointer', transition: 'background 0.2s ease',
    boxShadow: '0 4px 14px rgba(29,158,117,0.25)',
  },
  modalCancelBtn: {
    padding: '0.7rem 1.5rem', borderRadius: '12px', border: '1.5px solid #e5e7eb',
    background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: '0.9rem',
    cursor: 'pointer', transition: 'all 0.15s ease',
  },
};

const statusBadge = (status) => {
  if (status === 'Listed') return s.badgeListed;
  if (status === 'Unlisted') return s.badgeUnlisted;
  return s.badgeOos;
};

/* ── Component ── */
function Inventory() {
  const [medicines, setMedicines] = useState(initialMedicines);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [showModal, setShowModal] = useState(false);

  /* New medicine form state */
  const [newMed, setNewMed] = useState({
    name: '', genericName: '', dosage: '', packSize: '',
    mrp: '', sellingPrice: '', stock: '',
  });

  /* Filter by search */
  const filtered = useMemo(() =>
    medicines.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase())
    ), [medicines, search]);

  /* Start editing */
  const startEdit = (med) => {
    setEditingId(med.id);
    setEditPrice(String(med.sellingPrice));
    setEditStock(String(med.stock));
  };

  /* Save edit */
  const saveEdit = (id) => {
    setMedicines((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, sellingPrice: Number(editPrice), stock: Number(editStock) }
          : m
      )
    );
    setEditingId(null);
  };

  /* Cancel edit */
  const cancelEdit = () => setEditingId(null);

  /* Delete medicine */
  const deleteMed = (id) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  /* Update new medicine form field */
  const updateNew = (field, val) => {
    setNewMed((prev) => ({ ...prev, [field]: val }));
  };

  /* Save new medicine */
  const saveNew = () => {
    if (!newMed.name) return;
    const med = {
      id: Date.now(),
      name: newMed.name,
      genericName: newMed.genericName,
      dosage: newMed.dosage,
      packSize: newMed.packSize,
      mrp: Number(newMed.mrp) || 0,
      sellingPrice: Number(newMed.sellingPrice) || 0,
      stock: Number(newMed.stock) || 0,
      status: Number(newMed.stock) > 0 ? 'Listed' : 'Out of Stock',
    };
    setMedicines((prev) => [...prev, med]);
    setNewMed({ name: '', genericName: '', dosage: '', packSize: '', mrp: '', sellingPrice: '', stock: '' });
    setShowModal(false);
  };

  const newSavings =
    newMed.mrp && newMed.sellingPrice
      ? Number(newMed.mrp) - Number(newMed.sellingPrice)
      : 0;

  return (
    <div style={s.page}>
      {/* ── Top Bar ── */}
      <div style={s.topBar}>
        <input
          style={s.searchInput}
          type="text"
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = '#1D9E75')}
          onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
        />
        <button
          style={s.addBtn}
          onClick={() => setShowModal(true)}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#178c65')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#1D9E75')}
        >
          + Add Medicine
        </button>
      </div>

      {/* ── Table ── */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Medicine Name</th>
              <th style={s.th}>Dosage</th>
              <th style={s.th}>Pack</th>
              <th style={s.th}>MRP</th>
              <th style={s.th}>Your Price</th>
              <th style={s.th}>Stock</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={s.empty}>
                  No medicines found.
                </td>
              </tr>
            ) : (
              filtered.map((med) => {
                const isEditing = editingId === med.id;

                return (
                  <tr key={med.id}>
                    <td style={{ ...s.td, ...s.medName }}>{med.name}</td>
                    <td style={s.td}>{med.dosage}</td>
                    <td style={s.td}>{med.packSize}</td>
                    <td style={{ ...s.td, ...s.mrp }}>₹{med.mrp}</td>

                    {/* Price — editable */}
                    <td style={s.td}>
                      {isEditing ? (
                        <input
                          style={s.inlineInput}
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                        />
                      ) : (
                        <span style={s.price}>₹{med.sellingPrice}</span>
                      )}
                    </td>

                    {/* Stock — editable */}
                    <td style={s.td}>
                      {isEditing ? (
                        <input
                          style={s.inlineInput}
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                        />
                      ) : (
                        med.stock
                      )}
                    </td>

                    {/* Status */}
                    <td style={s.td}>
                      <span style={statusBadge(med.status)}>{med.status}</span>
                    </td>

                    {/* Actions */}
                    <td style={s.td}>
                      <div style={s.actionRow}>
                        {isEditing ? (
                          <>
                            <button
                              style={s.saveBtn}
                              onClick={() => saveEdit(med.id)}
                              title="Save"
                            >
                              ✓
                            </button>
                            <button
                              style={s.cancelEditBtn}
                              onClick={cancelEdit}
                              title="Cancel"
                            >
                              ✗
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              style={s.iconBtn}
                              onClick={() => startEdit(med)}
                              title="Edit"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#1D9E75';
                                e.currentTarget.style.background = '#f0fdf7';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.background = '#fff';
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              style={s.iconBtn}
                              onClick={() => deleteMed(med.id)}
                              title="Delete"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#ef4444';
                                e.currentTarget.style.background = '#fef2f2';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.background = '#fff';
                              }}
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add Medicine Modal ── */}
      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalTitle}>Add New Medicine</div>

            <div style={s.formGrid}>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Medicine Name</label>
                <input
                  style={s.formInput}
                  placeholder="e.g. Paracetamol"
                  value={newMed.name}
                  onChange={(e) => updateNew('name', e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = '#1D9E75')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Generic Name</label>
                <input
                  style={s.formInput}
                  placeholder="e.g. Acetaminophen"
                  value={newMed.genericName}
                  onChange={(e) => updateNew('genericName', e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = '#1D9E75')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Dosage</label>
                <input
                  style={s.formInput}
                  placeholder="e.g. 500mg"
                  value={newMed.dosage}
                  onChange={(e) => updateNew('dosage', e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = '#1D9E75')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Pack Size</label>
                <input
                  style={s.formInput}
                  placeholder="e.g. Strip of 10"
                  value={newMed.packSize}
                  onChange={(e) => updateNew('packSize', e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = '#1D9E75')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>MRP (₹)</label>
                <input
                  style={s.formInput}
                  type="number"
                  placeholder="e.g. 150"
                  value={newMed.mrp}
                  onChange={(e) => updateNew('mrp', e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = '#1D9E75')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Your Price (₹)</label>
                <input
                  style={s.formInput}
                  type="number"
                  placeholder="e.g. 95"
                  value={newMed.sellingPrice}
                  onChange={(e) => updateNew('sellingPrice', e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = '#1D9E75')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
                {newSavings > 0 && (
                  <div style={s.savingsHint}>
                    You're saving customers ₹{newSavings}
                  </div>
                )}
              </div>
              <div style={s.formGroupFull}>
                <label style={s.formLabel}>Stock Quantity</label>
                <input
                  style={s.formInput}
                  type="number"
                  placeholder="e.g. 100"
                  value={newMed.stock}
                  onChange={(e) => updateNew('stock', e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = '#1D9E75')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>
            </div>

            <div style={s.modalActions}>
              <button
                style={s.modalCancelBtn}
                onClick={() => setShowModal(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#9ca3af';
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  ...s.modalSaveBtn,
                  ...(!newMed.name
                    ? { background: '#d1d5db', cursor: 'not-allowed', boxShadow: 'none' }
                    : {}),
                }}
                disabled={!newMed.name}
                onClick={saveNew}
                onMouseEnter={(e) => {
                  if (newMed.name) e.currentTarget.style.background = '#178c65';
                }}
                onMouseLeave={(e) => {
                  if (newMed.name) e.currentTarget.style.background = '#1D9E75';
                }}
              >
                Save Medicine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
