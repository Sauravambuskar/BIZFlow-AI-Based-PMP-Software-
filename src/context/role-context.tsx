"use client";

import React from "react";

export type Role = "Admin" | "Manager" | "Team Member" | "Accountant" | "Client";

type RoleContextValue = {
  role: Role;
  setRole: (r: Role) => void;
};

const RoleContext = React.createContext<RoleContextValue | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = React.useState<Role>(() => {
    const stored = localStorage.getItem("bizflow_role") as Role | null;
    return stored ?? "Admin";
  });

  React.useEffect(() => {
    localStorage.setItem("bizflow_role", role);
  }, [role]);

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const ctx = React.useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
};