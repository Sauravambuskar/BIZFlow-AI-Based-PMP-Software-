"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ShieldCheck } from "lucide-react";
import { useRole, type Role } from "@/context/role-context";
import { showSuccess } from "@/utils/toast";

const roles: Role[] = ["Admin", "Manager", "Team Member", "Accountant", "Client"];

const RoleSwitcher: React.FC = () => {
  const { role, setRole } = useRole();

  const onChange = (next: Role) => {
    setRole(next);
    showSuccess(`Role switched to ${next}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">Role:</span> {role}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Select role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roles.map((r) => (
          <DropdownMenuItem key={r} onClick={() => onChange(r)}>
            {r}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RoleSwitcher;