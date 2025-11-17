/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 👈 importante para detectar componentes
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FBBF24", // amarillo suave EduData
        secondary: "#1E293B", // azul oscuro
      },
    },
  },
  plugins: [],
};
