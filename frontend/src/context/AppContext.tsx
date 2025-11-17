import { createContext, useState, ReactNode } from "react";

interface AppContextType {
  selectedRegion: number | null;
  setSelectedRegion: (id: number | null) => void;
}

export const AppContext = createContext<AppContextType>({
  selectedRegion: null,
  setSelectedRegion: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

  return (
    <AppContext.Provider value={{ selectedRegion, setSelectedRegion }}>
      {children}
    </AppContext.Provider>
  );
};
