"use client";

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ToastProvider from "@/components/ToastProvider";
import Index from "@/pages/Index";
import Crm from "@/pages/Crm";
import Projects from "@/pages/Projects";
import Billing from "@/pages/Billing";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import { RoleProvider } from "@/context/role-context";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import AccessDenied from "@/pages/AccessDenied";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <RoleProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/crm"
            element={
              <ProtectedRoute allowed={["Admin", "Manager"]}>
                <Crm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute allowed={["Admin", "Manager", "Team Member", "Client"]}>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute allowed={["Admin", "Accountant", "Manager", "Client"]}>
                <Billing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowed={["Admin", "Manager", "Accountant"]}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowed={["Admin", "Manager"]}>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Optional direct route for the AccessDenied page */}
          <Route path="/no-access" element={<AccessDenied />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </RoleProvider>
    </BrowserRouter>
  );
}

export default App;