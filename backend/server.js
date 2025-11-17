require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 3000;

const { sequelize } = require("./src/models/Index"); // ✅ ruta corregida

(async () => {
  try {
    await sequelize.sync({ force: false }); // ✅ evita ALTER problemáticos
    console.log("✅ Modelos sincronizados con la base de datos MySQL");
  } catch (error) {
    console.error("❌ Error al sincronizar modelos:", error);
  }
})();

app.listen(PORT, () => {
  console.log(`🚀 Servidor EduData ejecutándose en puerto ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
});
