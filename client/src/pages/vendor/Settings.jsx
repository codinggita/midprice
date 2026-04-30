import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { MapPin, Clock, Save, Navigation } from 'lucide-react';

export default function VendorSettings() {
  const user = useAuthStore(s => s.user);
  const [form, setForm] = useState({ name: '', address: '', hours: '', lat: '', lng: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/api/vendor/pharmacy')
      .then(r => setForm({
        name:    r.data.name    || '',
        address: r.data.address || '',
        hours:   r.data.hours   || '',
        lat:     r.data.lat     || '',
        lng:     r.data.lng     || '',
      }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return setErr('Geolocation not supported by your browser.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(p => ({ ...p, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }));
        setLocating(false);
        setMsg('Location fetched! Save to apply.');
      },
      () => { setErr('Could not get location. Please allow location access.'); setLocating(false); }
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (!form.name.trim()) return setErr('Shop name is required.');
    setSaving(true);
    try {
      await api.put('/api/vendor/pharmacy', {
        name:    form.name.trim(),
        address: form.address.trim(),
        hours:   form.hours.trim(),
        lat:     form.lat !== '' ? Number(form.lat) : undefined,
        lng:     form.lng !== '' ? Number(form.lng) : undefined,
      });
      setMsg('Shop profile saved successfully!');
    } catch (e) {
      setErr(e.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={s.center}><div style={s.spinner} /></div>;

  return (
    <div>
      <div style={s.pageHeader}>
        <h1 style={s.title}>Shop Setup</h1>
        <p style={s.sub}>Configure your pharmacy location and details</p>
      </div>

      <form onSubmit={handleSave} style={s.card}>
        {/* Shop Name */}
        <div style={s.field}>
          <label style={s.label}>Shop Name *</label>
          <input style={s.input} placeholder="e.g. Sharma Medical Store"
            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>

        {/* Address */}
        <div style={s.field}>
          <label style={s.label}><MapPin size={13} /> Address</label>
          <input style={s.input} placeholder="Full shop address"
            value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
        </div>

        {/* Hours */}
        <div style={s.field}>
          <label style={s.label}><Clock size={13} /> Operating Hours</label>
          <input style={s.input} placeholder="e.g. 9:00 AM – 9:00 PM"
            value={form.hours} onChange={e => setForm(p => ({ ...p, hours: e.target.value }))} />
        </div>

        {/* Location */}
        <div style={s.field}>
          <label style={s.label}><Navigation size={13} /> Location (GPS coordinates)</label>
          <div style={s.locRow}>
            <input style={{ ...s.input, flex: 1 }} placeholder="Latitude" type="number" step="any"
              value={form.lat} onChange={e => setForm(p => ({ ...p, lat: e.target.value }))} />
            <input style={{ ...s.input, flex: 1 }} placeholder="Longitude" type="number" step="any"
              value={form.lng} onChange={e => setForm(p => ({ ...p, lng: e.target.value }))} />
            <button type="button" style={s.locBtn} onClick={useCurrentLocation} disabled={locating}>
              <Navigation size={15} />
              {locating ? 'Detecting...' : 'Use My Location'}
            </button>
          </div>
          <div style={s.hint}>This lets patients find your shop nearby. Click "Use My Location" for automatic detection.</div>
        </div>

        {msg && <div style={s.successBanner}>{msg}</div>}
        {err && <div style={s.errBanner}>{err}</div>}

        <button type="submit" style={s.saveBtn} disabled={saving}>
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Shop Profile'}
        </button>
      </form>
    </div>
  );
}

const s = {
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' },
  spinner: { width: '26px', height: '26px', border: '3px solid #e5e7eb', borderTop: '3px solid #1D9E75', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  pageHeader: { marginBottom: '1.25rem' },
  title: { fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' },
  sub: { fontSize: '0.82rem', color: '#9ca3af', margin: '2px 0 0' },

  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' },
  input: { padding: '0.65rem 0.9rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', color: '#111827', transition: 'border-color 0.15s' },
  locRow: { display: 'flex', gap: '0.6rem', flexWrap: 'wrap' },
  locBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '0.65rem 1rem', background: '#f0fdf7', color: '#1D9E75', border: '1.5px solid #bbf7d0', borderRadius: '10px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' },
  hint: { fontSize: '0.73rem', color: '#9ca3af' },

  successBanner: { background: '#f0fdf7', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.7rem 1rem', color: '#166534', fontSize: '0.875rem', fontWeight: 500 },
  errBanner: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', color: '#ef4444', fontSize: '0.875rem' },

  saveBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', width: 'fit-content' },
};
