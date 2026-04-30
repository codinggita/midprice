import React, { useState } from 'react';
import api from '../../lib/api';
import { Search, MapPin, Clock, IndianRupee, Store, Navigation, Package } from 'lucide-react';

export default function PatientSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userLoc, setUserLoc] = useState({ lat: 0, lng: 0, detected: false });
  const [detecting, setDetecting] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported.');
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude, detected: true });
        setDetecting(false);
      },
      () => { alert('Could not detect location.'); setDetecting(false); }
    );
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const { data } = await api.get('/api/medicines/search', {
        params: { q: query.trim(), lat: userLoc.lat, lng: userLoc.lng },
      });
      setResults(data.results || []);
      setSearched(true);
    } catch {
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero search */}
      <div style={s.hero}>
        <h1 style={s.heroTitle}>Find Medicines Near You</h1>
        <p style={s.heroSub}>Compare prices from pharmacies in your area</p>

        <form onSubmit={handleSearch} style={s.searchForm}>
          <div style={s.searchBox}>
            <Search size={18} color="#9ca3af" style={{ flexShrink: 0 }} />
            <input
              style={s.searchInput}
              placeholder="Search medicine name..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" style={s.searchBtn} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Location */}
        <div style={s.locRow}>
          {userLoc.detected ? (
            <span style={s.locDetected}>
              <MapPin size={14} /> Location detected
            </span>
          ) : (
            <button style={s.locBtn} onClick={detectLocation} disabled={detecting}>
              <Navigation size={14} />
              {detecting ? 'Detecting...' : 'Use my location for nearby results'}
            </button>
          )}
          {userLoc.detected && (
            <span style={s.locCoord}>{userLoc.lat.toFixed(3)}, {userLoc.lng.toFixed(3)}</span>
          )}
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div style={s.resultsSection}>
          {results.length === 0 ? (
            <div style={s.empty}>
              <Package size={42} color="#d1d5db" />
              <div style={s.emptyTitle}>No medicines found</div>
              <div style={s.emptySub}>
                {!userLoc.detected
                  ? 'Try detecting your location to see nearby pharmacies.'
                  : `No pharmacy near you has "${query}". Try a different name.`}
              </div>
            </div>
          ) : (
            <>
              <div style={s.resultsMeta}>
                Found <strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for "{query}"
              </div>
              <div style={s.cards}>
                {results.map((r, i) => (
                  <div key={r.inventoryId} style={{ ...s.card, ...(i === 0 ? s.bestCard : {}) }}>
                    {i === 0 && <div style={s.bestBadge}>Best Price</div>}
                    <div style={s.cardTop}>
                      <div>
                        <div style={s.medName}>{r.medicine.name}</div>
                        {r.medicine.dosage && <div style={s.medDosage}>{r.medicine.dosage}</div>}
                      </div>
                      <div style={s.priceBlock}>
                        <div style={s.price}><IndianRupee size={14} />{r.sellingPrice}</div>
                        {r.mrp !== r.sellingPrice && <div style={s.mrp}>MRP ₹{r.mrp}</div>}
                      </div>
                    </div>

                    <div style={s.divider} />

                    <div style={s.shopInfo}>
                      <div style={s.shopRow}>
                        <Store size={14} color="#1D9E75" />
                        <span style={s.shopName}>{r.pharmacy.name}</span>
                      </div>
                      {r.pharmacy.address && (
                        <div style={s.shopRow}>
                          <MapPin size={13} color="#6b7280" />
                          <span style={s.shopAddr}>{r.pharmacy.address}</span>
                        </div>
                      )}
                      {r.pharmacy.hours && (
                        <div style={s.shopRow}>
                          <Clock size={13} color="#6b7280" />
                          <span style={s.shopAddr}>{r.pharmacy.hours}</span>
                        </div>
                      )}
                    </div>

                    <div style={s.cardBottom}>
                      {r.distance > 0 && (
                        <span style={s.dist}><MapPin size={12} /> {r.distance} km away</span>
                      )}
                      <span style={{ ...s.stockBadge, background: r.stockQty > 5 ? '#dcfce7' : r.stockQty > 0 ? '#fef9c3' : '#fee2e2', color: r.stockQty > 5 ? '#15803d' : r.stockQty > 0 ? '#854d0e' : '#b91c1c' }}>
                        {r.stockQty > 0 ? `${r.stockQty} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!searched && (
        <div style={s.placeholder}>
          <Search size={48} color="#e5e7eb" />
          <div style={{ color: '#9ca3af', fontSize: '0.95rem' }}>Type a medicine name above to search</div>
        </div>
      )}
    </div>
  );
}

const s = {
  hero: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', textAlign: 'center' },
  heroTitle: { fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: '0 0 6px', letterSpacing: '-0.4px' },
  heroSub: { fontSize: '0.9rem', color: '#9ca3af', margin: '0 0 1.25rem', fontWeight: 400 },

  searchForm: { marginBottom: '0.75rem' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '0.5rem 0.85rem', background: '#f9fafb', transition: 'border-color 0.2s' },
  searchInput: { flex: 1, border: 'none', background: 'transparent', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', color: '#111827' },
  searchBtn: { padding: '0.5rem 1.2rem', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', whiteSpace: 'nowrap' },

  locRow: { display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' },
  locBtn: { display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, padding: '0.2rem 0' },
  locDetected: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: '#1D9E75', fontWeight: 600 },
  locCoord: { fontSize: '0.75rem', color: '#9ca3af' },

  resultsSection: { },
  resultsMeta: { fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem' },

  cards: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.1rem 1.3rem', position: 'relative', overflow: 'hidden' },
  bestCard: { border: '2px solid #1D9E75' },
  bestBadge: { position: 'absolute', top: 0, right: 0, background: '#1D9E75', color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '0 14px 0 10px', letterSpacing: '0.3px' },

  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' },
  medName: { fontWeight: 700, fontSize: '1rem', color: '#111827' },
  medDosage: { fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' },
  priceBlock: { textAlign: 'right' },
  price: { display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 800, fontSize: '1.25rem', color: '#1D9E75', justifyContent: 'flex-end' },
  mrp: { fontSize: '0.75rem', color: '#9ca3af', textDecoration: 'line-through', textAlign: 'right' },

  divider: { height: '1px', background: '#f3f4f6', margin: '0 -1.3rem 0.75rem', },
  shopInfo: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '0.75rem' },
  shopRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  shopName: { fontWeight: 600, fontSize: '0.88rem', color: '#111827' },
  shopAddr: { fontSize: '0.78rem', color: '#6b7280' },

  cardBottom: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  dist: { display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 },
  stockBadge: { fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '20px' },

  empty: { textAlign: 'center', padding: '3rem', color: '#6b7280', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  emptyTitle: { fontWeight: 700, fontSize: '1rem', color: '#374151' },
  emptySub: { fontSize: '0.85rem', color: '#9ca3af', maxWidth: '300px' },

  placeholder: { textAlign: 'center', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
};
