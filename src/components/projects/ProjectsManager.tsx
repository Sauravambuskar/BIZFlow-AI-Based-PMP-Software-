"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, FolderKanban, Copy, FileDown } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import KanbanBoard from "./KanbanBoard";
import ProjectEditorDialog from "./ProjectEditorDialog";
import { exportToCsv, copyCsvToClipboard } from "@/utils/export";

type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
};

const PROJECTS_LS_KEY = "bizflow_projects_v1";
const boardKey = (projectId: string) => `bizflow_kanban_${projectId}`;

const ProjectsManager: React.FC = () => {
  const [projects, setProjects] = React.useState<Project[]>(() => {
    const raw = localStorage.getItem(PROJECTS_LS_KEY);
    return raw ? (JSON.parse(raw) as Project[]) : [];
  });
  const [selectedId, setSelectedId] = React.useState<string | null>(() => {
    const raw = localStorage.getItem(`${PROJECTS_LS_KEY}_selected`);
    return raw ?? (null as string | null);
  });

  const [newOpen, setNewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem(PROJECTS_LS_KEY, JSON.stringify(projects));
  }, [projects]);

  React.useEffect(() => {
    if (selectedId) localStorage.setItem(`${PROJECTS_LS_KEY}_selected`, selectedId);
  }, [selectedId]);

  const selectedProject = projects.find((p) => p.id === selectedId) ?? null;
  const projectsCsvRows = React.useMemo(
    () =>
      projects.map((p) => ({
        name: p.name,
        description: p.description ?? "",
        createdAt: p.createdAt,
      })),
    [projects]
  );

  const createProject = (name: string, description: string) => {
    const p: Project = { id: `${Date.now()}`, name, description, createdAt: new Date().toISOString() };
    setProjects((prev) => [p, ...prev]);
    setSelectedId(p.id);
    showSuccess("Project created");
    setNewOpen(false);
  };

  const updateProject = (name: string, description: string) => {
    if (!selectedProject) return;
    setProjects((prev) => prev.map((p) => (p.id === selectedProject.id ? { ...p, name, description } : p)));
    showSuccess("Project updated");
    setEditOpen(false);
  };

  const deleteProject = () => {
    if (!selectedProject) return;
    const id = selectedProject.id;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(projects.find((p) => p.id !== id)?.id ?? null);
    // Remove its board data
    localStorage.removeItem(boardKey(id));
    setConfirmOpen(false);
    showSuccess("Project deleted");
  };

  const emptyState = projects.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-cyan-500" />
          Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={() => setNewOpen(true)}>
              <Plus className="h-4 w-4" />
              New Project
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditOpen(true)}
              disabled={!selectedProject}
            >
              <Pencil className="h-4 w-4" />
              Rename
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
              disabled={!selectedProject}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active Project</span>
            <Select
              value={selectedId ?? undefined}
              onValueChange={(v) => setSelectedId(v)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder={emptyState ? "No projects" : "Select a project"} />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projects export/copy */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => exportToCsv("projects.csv", projectsCsvRows)}
              disabled={projects.length === 0}
            >
              <FileDown className="h-4 w-4" />
              Export Projects CSV
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                await copyCsvToClipboard(projectsCsvRows);
                showSuccess("Projects CSV copied to clipboard");
              }}
              disabled={projects.length === 0}
            >
              <Copy className="h-4 w-4" />
              Copy Projects CSV
            </Button>
          </div>
        </div>

        {/* Details */}
        {selectedProject ? (
          <div className="space-y-3">
            {selectedProject.description && (
              <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
                {selectedProject.description}
              </div>
            )}
            <KanbanBoard
              storageKey={boardKey(selectedProject.id)}
              title={`${selectedProject.name} Board`}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            {emptyState ? (
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium text-foreground">No projects yet</div>
                  <div>Create your first project to start organizing tasks.</div>
                </div>
                <Button onClick={() => setNewOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              </div>
            ) : (
              "Select a project to view its board."
            )}
          </div>
        )}

        {/* Dialogs */}
        <ProjectEditorDialog
          open={newOpen}
          onOpenChange={setNewOpen}
          onSave={createProject}
          title="New Project"
        />
        <ProjectEditorDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          onSave={updateProject}
          title="Rename Project"
          initialName={selectedProject?.name ?? ""}
          initialDescription={selectedProject?.description ?? ""}
        />
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this project?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the project and its board from your browser storage. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteProject}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default ProjectsManager;