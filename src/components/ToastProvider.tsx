"use client";

import React from "react";
import { Toaster } from "@/components/ui/sonner";

const ToastProvider: React.FC = () => {
  return <Toaster position="top-right" richColors closeButton />;
};

export default ToastProvider;