import { useEffect, useState } from "react";
import { regionService } from "../services/regionService";
import type { Region } from "../types/region.types";

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    regionService
      .getAll()
      .then((data) => setRegions(Array.isArray(data) ? data : []))
      .catch(() => setError("No se pudieron cargar las regiones"))
      .finally(() => setLoading(false));
  }, []);

  return { regions, loading, error };
};

