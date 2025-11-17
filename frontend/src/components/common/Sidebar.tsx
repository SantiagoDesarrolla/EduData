// src/components/common/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { Home, BarChart2, Layers, FileText, Settings } from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { path: "/dashboard", icon: <Home size={20} />, label: "Dashboard" },
    { path: "/reports", icon: <FileText size={20} />, label: "Reportes" },
    { path: "/comparison", icon: <BarChart2 size={20} />, label: "Comparar" },
    { path: "/admin", icon: <Settings size={20} />, label: "Admin" },
  ];

  return (
    <aside className="w-64 h-screen bg-white shadow-md flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-700">EduData</h1>
        <p className="text-sm text-gray-500">Análisis Educativo</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-blue-100"
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        © 2025 EduData
      </div>
    </aside>
  );
};

export default Sidebar;
