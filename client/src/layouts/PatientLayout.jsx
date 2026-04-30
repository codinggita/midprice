import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function PatientLayout() {
  const logout   = useAuthStore(s => s.logout);
  const user     = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/auth/select-role'); };

  return (
    <div style={s.shell}>
      {/* Top nav */}
      <header style={s.nav}>
        <div style={s.brand}>
          <span style={s.brandDot} />
          MedPrice
        </div>
        <div style={s.navLinks}>
          <NavLink to="/patient/search" style={({ isActive }) => ({ ...s.link, ...(isActive ? s.linkActive : {}) })}>
            Search
          </NavLink>
        </div>
        <div style={s.navRight}>
          <span style={s.greeting}>Hi, {user?.name || 'User'}</span>
          <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Page */}
      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  );
}

const s = {
  shell: { minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" },
  nav: {
    height: '56px', background: '#fff', borderBottom: '1px solid #e5e7eb',
    display: 'flex', alignItems: 'center', padding: '0 2rem', gap: '2rem',
    position: 'sticky', top: 0, zIndex: 10,
  },
  brand: { fontWeight: 800, fontSize: '1.2rem', color: '#1D9E75', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '-0.3px' },
  brandDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#1D9E75' },
  navLinks: { flex: 1, display: 'flex', gap: '1rem' },
  link: { textDecoration: 'none', color: '#6b7280', fontWeight: 500, fontSize: '0.9rem', padding: '0.3rem 0.6rem', borderRadius: '8px' },
  linkActive: { color: '#1D9E75', background: '#f0fdf7', fontWeight: 600 },
  navRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  greeting: { fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 },
  logoutBtn: { padding: '0.35rem 0.9rem', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 },
  main: { maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' },
};

export default PatientLayout;
