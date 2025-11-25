"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useRole } from "@/context/role-context";
import { Link } from "react-router-dom";

const AccessDenied: React.FC = () => {
  const { role } = useRole();

  return (
    <AppLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-semibold mb-2">Access denied</h1>
          <p className="text-muted-foreground mb-6">
            Your current role (<span className="font-medium">{role}</span>) doesn’t have permission to view this page.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md border bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/settings"
              className="inline-flex items-center justify-center rounded-md border bg-background hover:bg-accent h-9 px-4"
            >
              Open Settings
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Tip: Use the role switcher in the header to change roles.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default AccessDenied;