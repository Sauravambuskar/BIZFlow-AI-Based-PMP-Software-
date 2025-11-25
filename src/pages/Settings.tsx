"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { showSuccess } from "@/utils/toast";

const Settings: React.FC = () => {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage preferences, integrations, and access.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <ThemeToggle />
              <span className="text-sm text-muted-foreground">Toggle dark/light mode</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button onClick={() => showSuccess("Supabase will be connected next")}>Connect Supabase</Button>
              <Button variant="secondary" onClick={() => showSuccess("Clerk will be configured next")}>
                Connect Clerk
              </Button>
              <Button variant="outline" onClick={() => showSuccess("AI provider (Gemini/OpenAI/Claude) will be added")}>
                Connect AI Provider
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;