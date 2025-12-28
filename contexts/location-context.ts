"use client";

import { createContext, useContext } from "react";

export type Location = {
  lat: number;
  lng: number;
};

export type LocationContextType = {
  location: Location | null;
  setLocation: (location: Location | null) => void;
  refreshLocation: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

export const LocationContext = createContext<LocationContextType | null>(null);

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return ctx;
};
