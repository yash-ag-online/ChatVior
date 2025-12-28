import Info from "@/components/info";
import LocationWrapper from "@/components/LocationWrapper";
import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Info />
      <LocationWrapper>{children}</LocationWrapper>
    </>
  );
};

export default layout;
