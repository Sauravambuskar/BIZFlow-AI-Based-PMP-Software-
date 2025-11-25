"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BadgeDollarSign } from "lucide-react";
import RoleSwitcher from "@/components/RoleSwitcher";

const BrandHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <BadgeDollarSign className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
              BizFlow
            </span>
          </span>
        </div>
      </div>
      <div className="flex-1 max-w-xl">
        <Input placeholder="Search customers, projects, invoices..." />
      </div>
      <div className="flex items-center gap-2">
        <RoleSwitcher />
        <ThemeToggle />
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-500" aria-label="User avatar" />
      </div>
    </div>
  );
};

export default BrandHeader;