import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RoleSelector from '../pages/auth/RoleSelector';
import Login from '../pages/auth/Login';
import PatientLayout from '../layouts/PatientLayout';
import PatientSearch from '../pages/patient/Search';
import VendorLayout from '../layouts/VendorLayout';
import VendorDashboard from '../pages/vendor/Dashboard';
import VendorInventory from '../pages/vendor/Inventory';
import VendorSettings from '../pages/vendor/Settings';
import AdminDashboard from '../pages/admin/AdminDashboard';
import NotFound from '../pages/NotFound';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/select-role" replace />} />
      <Route path="/auth/select-role" element={<RoleSelector />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/vendor/login" element={<Login />} />
      <Route path="/patient/login" element={<Login />} />

      {/* Patient routes */}
      <Route path="/patient" element={<PatientLayout />}>
        <Route index element={<Navigate to="search" replace />} />
        <Route path="search" element={<PatientSearch />} />
      </Route>

      {/* Vendor routes */}
      <Route path="/vendor" element={<VendorLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="inventory" element={<VendorInventory />} />
        <Route path="settings" element={<VendorSettings />} />
      </Route>

      {/* Hidden Admin route — only you know this URL */}
      <Route path="/medprice-admin" element={<AdminDashboard />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
