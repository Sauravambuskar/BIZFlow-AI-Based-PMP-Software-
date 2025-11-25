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

function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/crm" element={<Crm />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;