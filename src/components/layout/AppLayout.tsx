"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import BrandHeader from "@/components/BrandHeader";
import CommandMenu from "@/components/CommandMenu";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarSeparator,
  SidebarFooter,
  SidebarMenuBadge,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Receipt,
  BarChart3,
  Settings,
} from "lucide-react";
import { useRole } from "@/context/role-context";

type AppLayoutProps = {
  children: React.ReactNode;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { role } = useRole();

  const mainItems = [
    { label: "Dashboard", icon: <LayoutDashboard />, to: "/", roles: ["Admin", "Manager", "Team Member", "Accountant", "Client"] },
    { label: "CRM", icon: <Users />, to: "/crm", roles: ["Admin", "Manager"] },
    { label: "Projects", icon: <FolderKanban />, to: "/projects", roles: ["Admin", "Manager", "Team Member", "Client"] },
    { label: "Billing", icon: <Receipt />, to: "/billing", roles: ["Admin", "Accountant", "Manager", "Client"] },
    { label: "Reports", icon: <BarChart3 />, to: "/reports", roles: ["Admin", "Manager", "Accountant"] },
  ];

  const settingsItems = [{ label: "Preferences", icon: <Settings />, to: "/settings", roles: ["Admin", "Manager"] }];

  return (
    <div
      className="min-h-screen bg-background relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          'url("https://static.vecteezy.com/system/resources/previews/023/883/544/non_2x/abstract-background-illustration-abstract-blue-background-illustration-simple-blue-background-for-wallpaper-display-landing-page-banner-or-layout-design-graphic-for-display-free-vector.jpg")',
      }}
    >
      {/* Soft overlay for readability */}
      <div className="absolute inset-0 bg-white/70 dark:bg-black/60" aria-hidden="true" />

      <div className="relative z-10">
        <SidebarProvider defaultOpen>
          <Sidebar variant="floating">
            <SidebarHeader>
              <SidebarGroupLabel className="font-semibold">Main</SidebarGroupLabel>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarMenu>
                  {mainItems
                    .filter((i) => i.roles.includes(role))
                    .map((item) => {
                      const isActive = location.pathname === item.to;
                      return (
                        <SidebarMenuItem key={item.to}>
                          <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                            <Link to={item.to}>
                              {item.icon}
                              <span>{item.label}</span>
                              {item.label === "Dashboard" ? <SidebarMenuBadge>4</SidebarMenuBadge> : null}
                            </Link>
                          </SidebarMenuButton>
                          <SidebarMenuAction aria-label="Pin" title="Pin" />
                        </SidebarMenuItem>
                      );
                    })}
                </SidebarMenu>
              </SidebarGroup>
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel className="font-semibold">Settings</SidebarGroupLabel>
                <SidebarMenu>
                  {settingsItems
                    .filter((i) => i.roles.includes(role))
                    .map((item) => {
                      const isActive = location.pathname === item.to;
                      return (
                        <SidebarMenuItem key={item.to}>
                          <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                            <Link to={item.to}>
                              {item.icon}
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <div className="text-xs text-muted-foreground px-2">Powered by BizFlow</div>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset>
            <BrandHeader />
            <div className="p-4 md:p-6 space-y-6">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default AppLayout;