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
import CustomerDetails from "@/pages/CustomerDetails";
import NotFound from "@/pages/NotFound";
import { RoleProvider } from "@/context/role-context";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import AccessDenied from "@/pages/AccessDenied";
import { SupabaseSessionProvider } from "@/context/supabase-session";
import AuthenticatedRoute from "@/components/routing/AuthenticatedRoute";
import Login from "@/pages/Login";
import BlackHole from "./pages/BlackHole";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <SupabaseSessionProvider>
        <RoleProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <AuthenticatedRoute>
                  <Index />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/crm"
              element={
                <AuthenticatedRoute>
                  <ProtectedRoute allowed={["Admin", "Manager"]}>
                    <Crm />
                  </ProtectedRoute>
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/crm/customers/:id"
              element={
                <AuthenticatedRoute>
                  <ProtectedRoute allowed={["Admin", "Manager"]}>
                    <CustomerDetails />
                  </ProtectedRoute>
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <AuthenticatedRoute>
                  <ProtectedRoute allowed={["Admin", "Manager", "Team Member", "Client"]}>
                    <Projects />
                  </ProtectedRoute>
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <AuthenticatedRoute>
                  <ProtectedRoute allowed={["Admin", "Accountant", "Manager", "Client"]}>
                    <Billing />
                  </ProtectedRoute>
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <AuthenticatedRoute>
                  <ProtectedRoute allowed={["Admin", "Manager", "Accountant"]}>
                    <Reports />
                  </ProtectedRoute>
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthenticatedRoute>
                  <ProtectedRoute allowed={["Admin", "Manager"]}>
                    <Settings />
                  </ProtectedRoute>
                </AuthenticatedRoute>
              }
            />

            <Route path="/black-hole" element={<BlackHole />} />

            {/* Optional direct route for the AccessDenied page */}
            <Route path="/no-access" element={<AccessDenied />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </RoleProvider>
      </SupabaseSessionProvider>
    </BrowserRouter>
  );
}

export default App;