"use client";

import React from "react";
import AccessDenied from "@/pages/AccessDenied";
import { useRole, type Role } from "@/context/role-context";

type ProtectedRouteProps = {
  allowed: Role[];
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowed, children }) => {
  const { role } = useRole();
  if (allowed.includes(role)) return <>{children}</>;
  return <AccessDenied />;
};

export default ProtectedRoute;