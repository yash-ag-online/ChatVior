"use client";
import { useLocation } from "@/contexts/location-context";
import { ReactNode } from "react";

const LocationWrapper = ({ children }: { children: ReactNode }) => {
  const locationCtx = useLocation();
  if (!locationCtx || !locationCtx.location) return <></>;
  return <>{children}</>;
};

export default LocationWrapper;
