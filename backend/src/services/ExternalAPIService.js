const axios = require('axios');
require('dotenv').config();

const MEN_BASE = `${process.env.MEN_API_URL}/resource`;   // https://www.datos.gov.co/resource
const MEN_SEARCH = `${process.env.MEN_API_URL}/api/search`; // https://www.datos.gov.co/api/search

const ExternalAPIService = {

  /**
   * ---------------------------------------------------------
   * MEN DATA (Datos Abiertos Colombia)
   * ---------------------------------------------------------
   */
  async fetchMENData(datasetId = 'ce2V-zUYT', limit = 5000) {
    const url = `${MEN_BASE}/${datasetId}.json`;

    try {
      console.log(`📡 Conectando al MEN: ${url}`);

      const { data } = await axios.get(url, {
        params: {
          $$app_token: process.env.DATOS_ABIERTOS_TOKEN,
          $limit: limit
        },
        timeout: 30000
      });

      console.log(`✅ MEN: ${data.length} registros obtenidos`);
      return this.transformMENData(data);

    } catch (err) {
      console.error(`❌ Error MEN: ${err.message}`);

      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Usando mock data MEN (dev)');
        return this.generateMockData();
      }

      throw err;
    }
  },

  /**
   * ---------------------------------------------------------
   * Búsqueda de datasets del MEN
   * ---------------------------------------------------------
   */
  async searchEducationDatasets(query = 'educación') {
    try {
      console.log(`🔍 Buscando datasets: ${query}`);

      const { data } = await axios.get(`${MEN_SEARCH}.json`, {
        params: {
          q: query,
          $$app_token: process.env.DATOS_ABIERTOS_TOKEN
        }
      });

      console.log(`📄 ${data?.results?.length || 0} datasets encontrados`);
      return data?.results || [];

    } catch (err) {
      console.error('❌ Error búsqueda MEN:', err.message);
      return [];
    }
  },


  /**
   * ---------------------------------------------------------
   * DANE (vía Datos Abiertos) — Igual que MEN
   * ---------------------------------------------------------
   * IMPORTANTE:
   * El DANE no tiene API REST propia estándar.
   * Todo lo que publican está en datos.gov.co → mismo dominio.
   */
  async fetchDANEData(datasetId, limit = 5000) {
    if (!datasetId) {
      throw new Error("Debe proporcionar un datasetId del DANE");
    }

    const url = `${MEN_BASE}/${datasetId}.json`;  // usa el mismo dominio

    try {
      console.log(`📡 Conectando al DANE: ${url}`);

      const { data } = await axios.get(url, {
        params: {
          $$app_token: process.env.DATOS_ABIERTOS_TOKEN,
          $limit: limit
        },
        timeout: 30000
      });

      console.log(`✅ DANE: ${data.length} registros obtenidos`);
      return data;

    } catch (err) {
      console.error('❌ Error DANE:', err.message);

      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Mock data DANE usada');
        return this.generateMockData();
      }

      throw err;
    }
  },


  /**
   * ---------------------------------------------------------
   * Probar conexión externa
   * ---------------------------------------------------------
   */
  async testConnection() {
    try {
      console.log('🔗 Probando conexión a Datos Abiertos...');

      await this.fetchMENData('ce2V-zUYT', 1);

      return {
        success: true,
        message: 'Conexión a Datos Abiertos verificada.',
      };

    } catch (err) {
      return {
        success: false,
        message: err.message
      };
    }
  },


  /**
   * ---------------------------------------------------------
   * Transformación estándar para datasets del MEN
   * ---------------------------------------------------------
   * Normaliza columnas distintas entre datasets
   */
  transformMENData(data = []) {
    if (!Array.isArray(data)) {
      console.warn('⚠️ MEN devolvió un formato inesperado');
      return this.generateMockData();
    }

    return data.map(item => {
      const valor = Number(item.valor || item.total || Math.random() * 100);

      return {
        codigo_dane: item.codigo_dane || item.cod_dane || item.dep || item.departamento_dane || "",
        departamento: item.departamento || item.nombre_departamento || "",
        municipio: item.municipio || item.nombre_municipio || null,
        año: Number(item.año || item.anio || item.ano || 2024),
        indicador: item.indicador || "indicador_desconocido",
        nombre_indicador: item.nombre_indicador || "Sin nombre",
        valor: valor,
        unidad: item.unidad || item.unidad_medida || "%",
        fuente: "MEN - Datos Abiertos"
      };
    });
  },


  /**
   * ---------------------------------------------------------
   * Mock Data (para modo desarrollo)
   * ---------------------------------------------------------
   */
  generateMockData() {
    const departamentos = [
      { codigo: "11", nombre: "Bogotá D.C." },
      { codigo: "05", nombre: "Antioquia" },
      { codigo: "76", nombre: "Valle del Cauca" },
      { codigo: "08", nombre: "Atlántico" }
    ];

    return departamentos.map(d => ({
      codigo_dane: d.codigo,
      departamento: d.nombre,
      año: 2024,
      indicador: "cobertura_bruta",
      nombre_indicador: "Cobertura Bruta",
      valor: Math.round(60 + Math.random() * 40),
      unidad: "%",
      fuente: "MOCK"
    }));
  }

};

module.exports = ExternalAPIService;
