// src/App.tsx - COMPLETO CON CONTEXTOS
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/common/Sidebar";
import Footer from "./components/common/Footer";
import { AppProvider } from "./context/AppContext";
import AuthProvider from "./context/AuthContext";

import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Comparison from "./pages/Comparison";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Login from "./pages/Login";

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar fija a la izquierda */}
            <Sidebar />

            {/* Área principal de contenido */}
            <div className="flex flex-col flex-1">
              <main className="flex-1 p-6 overflow-y-auto">
                <Routes>
                  {/* Redirección raíz */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  {/* Rutas públicas */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/home" element={<Home />} />

                  {/* Rutas protegidas */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/comparison" element={<Comparison />} />
                  <Route path="/admin" element={<Admin />} />

                  {/* Ruta 404 */}
                  <Route
                    path="*"
                    element={
                      <div className="text-center text-red-600 font-semibold mt-20">
                        404 | Página no encontrada
                      </div>
                    }
                  />
                </Routes>
              </main>

              {/* Footer global */}
              <Footer />
            </div>
          </div>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}