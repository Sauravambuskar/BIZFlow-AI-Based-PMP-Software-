"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import BrandHeader from "@/components/BrandHeader";
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

type AppLayoutProps = {
  children: React.ReactNode;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();

  const mainItems = [
    { label: "Dashboard", icon: <LayoutDashboard />, to: "/", badge: "4" },
    { label: "CRM", icon: <Users />, to: "/crm" },
    { label: "Projects", icon: <FolderKanban />, to: "/projects" },
    { label: "Billing", icon: <Receipt />, to: "/billing" },
    { label: "Reports", icon: <BarChart3 />, to: "/reports" },
  ];

  const settingsItems = [{ label: "Preferences", icon: <Settings />, to: "/settings" }];

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="floating">
        <SidebarHeader>
          <SidebarGroupLabel className="font-semibold">Main</SidebarGroupLabel>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {mainItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link to={item.to}>
                        {item.icon}
                        <span>{item.label}</span>
                        {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
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
              {settingsItems.map((item) => {
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
  );
};

export default AppLayout;