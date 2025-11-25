"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, CalendarDays, Timer } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import ProjectsManager from "@/components/projects/ProjectsManager";
import TimesheetTimer from "@/components/timers/TimesheetTimer";

const Projects: React.FC = () => {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground">Create projects, assign teams, and track progress.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => showSuccess("New Project")}>
              <FolderKanban className="h-4 w-4" />
              New Project
            </Button>
            <Button variant="secondary" onClick={() => showSuccess("Start Timer")}>
              <Timer className="h-4 w-4" />
              Start Timer
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ProjectsManager />

          <Card>
            <CardHeader>
              <CardTitle>
                <div className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-cyan-500" />
                  Timeline & Calendar
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Gantt and calendar views for planning milestones and deadlines.
              </div>
              <div className="mt-4">
                <TimesheetTimer />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Projects;