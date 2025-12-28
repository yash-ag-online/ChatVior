"use client";

import { LocationContext, type Location } from "./location-context";
import { getUserLocation } from "@/helpers";
import { type ReactNode, useEffect, useState } from "react";

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loc = await getUserLocation(false);
        if (!cancelled) {
          setLocation(loc);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          setError(errorMessage);
          console.error("Failed to fetch location:", err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loc = await getUserLocation(true);
      setLocation(loc);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error("Failed to refresh location:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LocationContext.Provider
      value={{ location, setLocation, refreshLocation, isLoading, error }}
    >
      {children}
    </LocationContext.Provider>
  );
};
