// backend/src/controllers/IndicatorController.js - COMPLETO
const { Indicator, Region, Dataset, sequelize } = require("../models");
const { Op } = require("sequelize");

const IndicatorController = {
  // 📊 Obtener todos los indicadores (con paginación)
  async getAll(req, res) {
    try {
      const { page = 1, limit = 50, year, region, indicator } = req.query;
      const offset = (page - 1) * limit;
      
      const where = {};
      if (year) where.year = year;
      if (region) where.region_id = region;
      if (indicator) where.indicator_code = indicator;

      const indicators = await Indicator.findAndCountAll({
        where,
        include: [
          { 
            model: Region, 
            attributes: ["id", "name", "code", "type", "latitude", "longitude"] 
          },
          { 
            model: Dataset, 
            attributes: ["id", "name", "source_url"] 
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["year", "DESC"], ["region_id", "ASC"]]
      });

      res.status(200).json({
        data: indicators.rows,
        total: indicators.count,
        page: parseInt(page),
        totalPages: Math.ceil(indicators.count / limit)
      });
    } catch (error) {
      console.error("❌ Error al obtener indicadores:", error);
      res.status(500).json({ message: "Error al obtener indicadores" });
    }
  },

  // 🗺️ Datos para mapa interactivo (RF-01)
  async getMapData(req, res) {
    try {
      const { year = 2024, indicator = 'cobertura_bruta' } = req.query;
      
      const mapData = await Indicator.findAll({
        where: { year, indicator_code: indicator },
        include: [
          { 
            model: Region, 
            attributes: ["id", "name", "code", "type", "latitude", "longitude"],
            where: { type: 'departamento' } // Solo departamentos para mapa principal
          }
        ],
        attributes: ["id", "value", "year", "indicator_name", "unit"]
      });

      // Formatear datos para el mapa
      const formattedData = mapData.map(item => ({
        region: item.Region.name,
        code: item.Region.code,
        value: item.value,
        coordinates: { 
          lat: item.Region.latitude, 
          lng: item.Region.longitude 
        },
        indicator: item.indicator_name,
        year: item.year,
        unit: item.unit
      }));

      res.status(200).json(formattedData);
    } catch (error) {
      console.error("❌ Error al obtener datos para mapa:", error);
      res.status(500).json({ message: "Error al obtener datos del mapa" });
    }
  },

  // 📍 Indicadores por región específica (RF-02)
  async getByRegion(req, res) {
    try {
      const { regionId } = req.params;
      const { year, indicator } = req.query;

      const where = { region_id: regionId };
      if (year) where.year = year;
      if (indicator) where.indicator_code = indicator;

      const indicators = await Indicator.findAll({
        where,
        include: [
          { model: Region, attributes: ["id", "name", "code", "type"] },
          { model: Dataset, attributes: ["id", "name", "source_url"] }
        ],
        order: [["year", "DESC"], ["indicator_code", "ASC"]]
      });

      if (!indicators.length) {
        return res.status(404).json({ 
          message: "No se encontraron indicadores para esta región" 
        });
      }

      res.status(200).json(indicators);
    } catch (error) {
      console.error("❌ Error al obtener indicadores por región:", error);
      res.status(500).json({ message: "Error al obtener indicadores regionales" });
    }
  },

  // ⚖️ Comparar regiones (RF-03)
  async compareRegions(req, res) {
    try {
      const { regionIds, indicator, year = 2024 } = req.body;
      
      if (!regionIds || !Array.isArray(regionIds) || regionIds.length < 2) {
        return res.status(400).json({ 
          message: "Se requieren al menos 2 regiones para comparar" 
        });
      }

      const comparisonData = await Indicator.findAll({
        where: { 
          region_id: regionIds, 
          indicator_code: indicator,
          year 
        },
        include: [
          { 
            model: Region, 
            attributes: ["id", "name", "code", "type"] 
          }
        ],
        order: [["region_id", "ASC"]]
      });

      // Calcular diferencias y brechas (RF-10)
      const regionsData = {};
      comparisonData.forEach(item => {
        if (!regionsData[item.Region.name]) {
          regionsData[item.Region.name] = {
            region: item.Region.name,
            value: item.value,
            unit: item.unit,
            indicator: item.indicator_name
          };
        }
      });

      const regionsArray = Object.values(regionsData);
      
      // Calcular brechas
      const gaps = [];
      for (let i = 0; i < regionsArray.length; i++) {
        for (let j = i + 1; j < regionsArray.length; j++) {
          const gap = Math.abs(regionsArray[i].value - regionsArray[j].value);
          gaps.push({
            region1: regionsArray[i].region,
            region2: regionsArray[j].region,
            gap: gap,
            percentageGap: ((gap / Math.max(regionsArray[i].value, regionsArray[j].value)) * 100).toFixed(2)
          });
        }
      }

      // Identificar alertas de brechas significativas (>20%)
      const alerts = gaps.filter(gap => gap.percentageGap > 20).map(gap => ({
        ...gap,
        alert: 'ALTA_BRECHA',
        message: `Brecha significativa detectada entre ${gap.region1} y ${gap.region2}`
      }));

      res.status(200).json({
        comparison: regionsArray,
        gaps: gaps,
        alerts: alerts,
        metadata: {
          indicator,
          year,
          totalRegions: regionsArray.length
        }
      });
    } catch (error) {
      console.error("❌ Error al comparar regiones:", error);
      res.status(500).json({ message: "Error en comparación de regiones" });
    }
  },

  // 📈 Tendencias históricas (RF-08)
  async getTrends(req, res) {
    try {
      const { regionId, indicator, startYear = 2010, endYear = 2024 } = req.query;

      // Convertir a números enteros
      const region = parseInt(regionId, 10);
      const start = parseInt(startYear, 10);
      const end = parseInt(endYear, 10);

      if (isNaN(region) || isNaN(start) || isNaN(end)) {
        return res.status(400).json({ 
          message: "Los parámetros regionId, startYear y endYear deben ser números válidos" 
        });
      }

      if (!indicator) {
        return res.status(400).json({ 
          message: "El parámetro 'indicator' es requerido" 
        });
      }

      console.log(`📈 Buscando tendencias: región=${region}, indicador=${indicator}, período=${start}-${end}`);

      const trends = await Indicator.findAll({
        where: { 
          region_id: region,
          indicator_code: indicator,
          year: { [Op.between]: [start, end] }
        },
        include: [
          { model: Region, attributes: ["name", "code"] }
        ],
        attributes: ["year", "value", "indicator_name", "unit"],
        order: [["year", "ASC"]]
      });

      if (!trends.length) {
        console.warn(`⚠️ No se encontraron datos: región=${region}, indicador=${indicator}, período=${start}-${end}`);
        return res.status(404).json({ 
          message: "No se encontraron datos de tendencias" 
        });
      }

      res.status(200).json({
        region: trends[0].Region.name,
        indicator: trends[0].indicator_name,
        unit: trends[0].unit,
        trends: trends.map(t => ({
          year: t.year,
          value: t.value
        })),
        period: `${start}-${end}`
      });
    } catch (error) {
      console.error("❌ Error al obtener tendencias:", error);
      res.status(500).json({ message: "Error al obtener tendencias históricas", error: error.message });
    }
  },

  // 🔍 Filtros avanzados (RF-09, RF-16)
  async advancedFilter(req, res) {
    try {
      const { 
        regions = [], 
        indicators = [], 
        years = [], 
        minValue, 
        maxValue 
      } = req.body;

      const where = {};
      
      if (regions.length) where.region_id = { [sequelize.Op.in]: regions };
      if (indicators.length) where.indicator_code = { [sequelize.Op.in]: indicators };
      if (years.length) where.year = { [sequelize.Op.in]: years };
      
      if (minValue !== undefined || maxValue !== undefined) {
        where.value = {};
        if (minValue !== undefined) where.value[sequelize.Op.gte] = minValue;
        if (maxValue !== undefined) where.value[sequelize.Op.lte] = maxValue;
      }

      const results = await Indicator.findAll({
        where,
        include: [
          { 
            model: Region, 
            attributes: ["id", "name", "code", "type", "latitude", "longitude"] 
          },
          { 
            model: Dataset, 
            attributes: ["id", "name", "source_url"] 
          }
        ],
        order: [["year", "DESC"], ["region_id", "ASC"]],
        limit: 1000 // Límite para evitar sobrecarga
      });

      res.status(200).json({
        data: results,
        total: results.length,
        filtersApplied: {
          regions: regions.length,
          indicators: indicators.length,
          years: years.length,
          valueRange: { min: minValue, max: maxValue }
        }
      });
    } catch (error) {
      console.error("❌ Error en filtros avanzados:", error);
      res.status(500).json({ message: "Error al aplicar filtros" });
    }
  },

  // 📋 Lista de indicadores disponibles
  async getAvailableIndicators(req, res) {
    try {
      const indicators = await Indicator.findAll({
        attributes: [
          "indicator_code",
          "indicator_name",
          "unit",
          [sequelize.fn("MIN", sequelize.col("year")), "min_year"],
          [sequelize.fn("MAX", sequelize.col("year")), "max_year"]
        ],
        group: ["indicator_code", "indicator_name", "unit"],
        raw: true
      });

      res.status(200).json(indicators);
    } catch (error) {
      console.error("❌ Error al obtener indicadores disponibles:", error);
      res.status(500).json({ message: "Error al obtener lista de indicadores" });
    }
  }
};

module.exports = IndicatorController;