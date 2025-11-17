import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-semibold">EduData</h1>
        <nav className="space-x-4">
          <Link to="/" className="hover:text-yellow-300">Inicio</Link>
          <Link to="/dashboard" className="hover:text-yellow-300">Dashboard</Link>
          <Link to="/reports" className="hover:text-yellow-300">Reportes</Link>
          <Link to="/comparison" className="hover:text-yellow-300">Comparar</Link>
          <Link to="/admin" className="hover:text-yellow-300">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
