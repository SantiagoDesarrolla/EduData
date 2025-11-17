export default function Home() {
  return (
    <div className="text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Bienvenido a EduData</h1>
      <p className="text-lg text-gray-600 mb-8">
        Una plataforma interactiva para la visualización de indicadores educativos
        en Colombia. Explora datos, genera reportes y analiza tendencias.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition">
          <h2 className="font-semibold text-xl mb-2">Explora Indicadores</h2>
          <p>Accede al mapa interactivo y consulta indicadores por región y año.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition">
          <h2 className="font-semibold text-xl mb-2">Genera Reportes</h2>
          <p>Crea reportes personalizados y descarga tus resultados en CSV o PDF.</p>
        </div>
      </div>
    </div>
  );
}
