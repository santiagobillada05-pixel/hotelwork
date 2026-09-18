import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoomsPage from './pages/RoomsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import MyReservationsPage from './pages/MyReservationsPage';
import DashboardPage from './pages/admin/DashboardPage';
import ManageRoomsPage from './pages/admin/ManageRoomsPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import RegisterStaffPage from './pages/admin/RegisterStaffPage';
import CheckInOutPage from './pages/staff/CheckInOutPage';
import PagadosPage from './pages/admin/PagadosPage';
import RecaudacionPage from './pages/RecaudacionPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RoomsPage />} />
            <Route path="/rooms/:id" element={<RoomDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Guest Protected Routes */}
            <Route
              path="/my-reservations"
              element={
                <ProtectedRoute allowedRoles={['guest', 'staff', 'admin']}>
                  <MyReservationsPage />
                </ProtectedRoute>
              }
            />

            {/* Staff & Admin Protected Routes */}
            <Route
              path="/check-in-out"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <CheckInOutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pagados"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <PagadosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recaudacion"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <RecaudacionPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Only Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rooms"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageRoomsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/empleados/nuevo"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RegisterStaffPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
