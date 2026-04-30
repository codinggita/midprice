import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Plus, Trash2, Edit2, Check, X, Package } from 'lucide-react';

export default function VendorInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ medicineName: '', price: '', stockQty: '' });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Inline edit
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ price: '', stockQty: '' });

  const load = () => {
    setLoading(true);
    api.get('/api/vendor/inventory')
      .then(r => setItems(r.data.inventory || []))
      .catch(() => setError('Failed to load medicines.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!form.medicineName.trim()) return setAddError('Medicine name required.');
    if (!form.price || Number(form.price) <= 0) return setAddError('Price must be greater than 0.');
    setAdding(true);
    try {
      await api.post('/api/vendor/inventory', {
        medicineName: form.medicineName.trim(),
        price: Number(form.price),
        stockQty: Number(form.stockQty) || 0,
      });
      setForm({ medicineName: '', price: '', stockQty: '' });
      setShowAdd(false);
      load();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine from your inventory?')) return;
    try {
      await api.delete(`/api/vendor/inventory/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
    } catch {
      alert('Failed to delete.');
    }
  };

  const startEdit = (item) => {
    setEditId(item._id);
    setEditData({ price: item.sellingPrice, stockQty: item.stockQty });
  };

  const saveEdit = async () => {
    try {
      const { data } = await api.patch(`/api/vendor/inventory/${editId}`, {
        price: Number(editData.price),
        stockQty: Number(editData.stockQty),
      });
      setItems(prev => prev.map(i => i._id === editId ? data : i));
      setEditId(null);
    } catch {
      alert('Failed to save.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.title}>My Medicines</h1>
          <p style={s.sub}>{items.length} medicine{items.length !== 1 ? 's' : ''} in your inventory</p>
        </div>
        <button style={s.addBtn} onClick={() => { setShowAdd(!showAdd); setAddError(''); }}>
          <Plus size={16} /> Add Medicine
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={handleAdd} style={s.addForm}>
          <div style={s.addFormTitle}>Add New Medicine</div>
          <div style={s.formGrid}>
            <input
              style={s.input}
              placeholder="Medicine name (e.g. Paracetamol 500mg)"
              value={form.medicineName}
              onChange={e => setForm(p => ({ ...p, medicineName: e.target.value }))}
            />
            <input
              style={s.input}
              type="number"
              placeholder="Price (₹)"
              value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              min="0"
            />
            <input
              style={s.input}
              type="number"
              placeholder="Stock qty"
              value={form.stockQty}
              onChange={e => setForm(p => ({ ...p, stockQty: e.target.value }))}
              min="0"
            />
          </div>
          {addError && <div style={s.errMsg}>{addError}</div>}
          <div style={s.formActions}>
            <button type="submit" style={s.saveBtn} disabled={adding}>{adding ? 'Adding...' : 'Add Medicine'}</button>
            <button type="button" style={s.cancelBtn} onClick={() => { setShowAdd(false); setAddError(''); }}>Cancel</button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div style={s.center}><div style={s.spinner} /></div>
      ) : error ? (
        <div style={s.errBanner}>{error} <button style={s.retryLink} onClick={load}>Retry</button></div>
      ) : items.length === 0 ? (
        <div style={s.empty}>
          <Package size={40} color="#d1d5db" />
          <div>No medicines added yet.</div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Click "Add Medicine" to get started.</div>
        </div>
      ) : (
        <div style={s.list}>
          {items.map(item => (
            <div key={item._id} style={{ ...s.row, ...(item.stockQty === 0 ? s.rowOos : {}) }}>
              <div style={s.rowLeft}>
                <div style={{ ...s.dot, background: item.stockQty > 5 ? '#22c55e' : item.stockQty > 0 ? '#f59e0b' : '#ef4444' }} />
                <div>
                  <div style={s.medName}>{item.medicineId?.name}</div>
                  <div style={s.medQty}>Stock: {item.stockQty} {item.stockQty === 0 && <span style={s.oosBadge}>Out of Stock</span>}</div>
                </div>
              </div>

              {editId === item._id ? (
                <div style={s.editRow}>
                  <input style={s.miniInput} type="number" value={editData.price} onChange={e => setEditData(p => ({ ...p, price: e.target.value }))} placeholder="Price" />
                  <input style={s.miniInput} type="number" value={editData.stockQty} onChange={e => setEditData(p => ({ ...p, stockQty: e.target.value }))} placeholder="Qty" />
                  <button style={s.iconBtn('#1D9E75')} onClick={saveEdit}><Check size={15} /></button>
                  <button style={s.iconBtn('#6b7280')} onClick={() => setEditId(null)}><X size={15} /></button>
                </div>
              ) : (
                <div style={s.rowRight}>
                  <div style={s.price}>₹{item.sellingPrice}</div>
                  <button style={s.iconBtn('#3b82f6')} title="Edit" onClick={() => startEdit(item)}><Edit2 size={15} /></button>
                  <button style={s.iconBtn('#ef4444')} title="Delete" onClick={() => handleDelete(item._id)}><Trash2 size={15} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const iconBtn = (color) => ({
  width: '30px', height: '30px', borderRadius: '8px', border: 'none',
  background: `${color}15`, color, cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
});

const s = {
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' },
  spinner: { width: '26px', height: '26px', border: '3px solid #e5e7eb', borderTop: '3px solid #1D9E75', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' },
  title: { fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' },
  sub: { fontSize: '0.82rem', color: '#9ca3af', margin: '2px 0 0' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.1rem', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' },

  addForm: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem' },
  addFormTitle: { fontWeight: 700, fontSize: '0.95rem', color: '#111827', marginBottom: '0.85rem' },
  formGrid: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  input: { flex: '1 1 160px', padding: '0.6rem 0.85rem', border: '1.5px solid #e5e7eb', borderRadius: '9px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', color: '#111827' },
  errMsg: { marginTop: '0.5rem', color: '#ef4444', fontSize: '0.82rem', fontWeight: 500 },
  formActions: { display: 'flex', gap: '0.6rem', marginTop: '0.85rem' },
  saveBtn: { padding: '0.55rem 1.2rem', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  cancelBtn: { padding: '0.55rem 1.2rem', background: '#fff', color: '#6b7280', border: '1.5px solid #e5e7eb', borderRadius: '9px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },

  errBanner: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.85rem 1rem', color: '#ef4444', fontSize: '0.875rem' },
  retryLink: { background: 'none', border: 'none', color: '#ef4444', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 },

  empty: { textAlign: 'center', padding: '3rem', color: '#6b7280', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },

  list: { display: 'flex', flexDirection: 'column', gap: '6px' },
  row: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' },
  rowOos: { opacity: 0.7, borderStyle: 'dashed' },
  rowLeft: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 },
  dot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  medName: { fontWeight: 600, fontSize: '0.9rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  medQty: { fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' },
  oosBadge: { background: '#fef2f2', color: '#ef4444', padding: '0.1rem 0.4rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 },
  rowRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  price: { fontWeight: 700, fontSize: '1rem', color: '#1D9E75', minWidth: '55px', textAlign: 'right' },
  editRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  miniInput: { width: '70px', padding: '0.4rem 0.5rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.82rem', outline: 'none', textAlign: 'center' },
  iconBtn,
};
