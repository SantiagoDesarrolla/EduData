// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Reports from "../pages/Reports";
import Comparison from "../pages/Comparison";
import Admin from "../pages/Admin";
import Home from "../pages/Home";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/comparison" element={<Comparison />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/home" element={<Home />} />
        {/* Ruta 404 */}
        <Route path="*" element={<div className="p-10 text-center text-red-600 font-semibold">404 | Página no encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}
