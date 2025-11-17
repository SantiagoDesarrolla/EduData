// src/pages/Login.tsx
import { useState, useContext } from "react";
import { authService } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await authService.login(email, password);
      login(data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg p-6 rounded-lg w-96"
      >
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">
          EduData Login
        </h2>

        {error && <p className="text-red-500 text-center mb-2">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700">Correo</label>
          <input
            type="email"
            className="border p-2 w-full rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Contraseña</label>
          <input
            type="password"
            className="border p-2 w-full rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="bg-blue-600 w-full text-white py-2 rounded hover:bg-blue-700 transition">
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}
