"use client";

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSupabaseSession } from "@/context/supabase-session";

const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useSupabaseSession();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Checking authentication…
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthenticatedRoute;