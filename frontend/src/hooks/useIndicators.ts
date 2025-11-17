import { useEffect, useState } from "react";
import { indicatorService } from "../services/indicatorService";
import type { Indicator } from "../types/indicator.types";

export const useIndicators = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    indicatorService
      .getAll()
      .then((data) => setIndicators(Array.isArray(data) ? data : []))
      .catch(() => setError("No se pudieron cargar los indicadores"))
      .finally(() => setLoading(false));
  }, []);

  return { indicators, loading, error };
};
