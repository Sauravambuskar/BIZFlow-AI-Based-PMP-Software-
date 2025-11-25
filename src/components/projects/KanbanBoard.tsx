"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { showSuccess } from "@/utils/toast";

type Task = { id: string; title: string };
type Columns = "todo" | "doing" | "done";
type BoardState = Record<Columns, Task[]>;

const LS_KEY = "bizflow_kanban";

const initialState: BoardState = {
  todo: [
    { id: "t1", title: "Setup project template" },
    { id: "t2", title: "Collect requirements" },
  ],
  doing: [{ id: "t3", title: "Homepage UI" }],
  done: [{ id: "t4", title: "Create repo" }],
};

const Column: React.FC<{
  label: string;
  name: Columns;
  tasks: Task[];
  onDropTask: (taskId: string, from: Columns, to: Columns) => void;
}> = ({ label, name, tasks, onDropTask }) => {
  const onDrop = (e: React.DragEvent) => {
    const taskId = e.dataTransfer.getData("taskId");
    const from = e.dataTransfer.getData("from") as Columns;
    if (taskId && from) onDropTask(taskId, from, name);
  };

  return (
    <div
      className="rounded-lg border bg-background/50 p-3"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="space-y-2 min-h-[120px]">
        {tasks.map((t) => (
          <div
            key={t.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("taskId", t.id);
              e.dataTransfer.setData("from", name);
            }}
            className="cursor-grab rounded-md border bg-card p-3 text-sm hover:bg-accent"
          >
            {t.title}
          </div>
        ))}
      </div>
    </div>
  );
};

const KanbanBoard: React.FC = () => {
  const [board, setBoard] = React.useState<BoardState>(() => {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as BoardState) : initialState;
  });
  const [newTitle, setNewTitle] = React.useState("");

  React.useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(board));
  }, [board]);

  const moveTask = (taskId: string, from: Columns, to: Columns) => {
    if (from === to) return;
    const task = board[from].find((t) => t.id === taskId);
    if (!task) return;
    setBoard((prev) => ({
      ...prev,
      [from]: prev[from].filter((t) => t.id !== taskId),
      [to]: [...prev[to], task],
    }));
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    const task: Task = { id: `${Date.now()}`, title: newTitle.trim() };
    setBoard((prev) => ({ ...prev, todo: [task, ...prev.todo] }));
    setNewTitle("");
    showSuccess("Task added");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kanban</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="New task title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Button onClick={addTask}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Column label="Todo" name="todo" tasks={board.todo} onDropTask={moveTask} />
          <Column label="Doing" name="doing" tasks={board.doing} onDropTask={moveTask} />
          <Column label="Done" name="done" tasks={board.done} onDropTask={moveTask} />
        </div>
      </CardContent>
    </Card>
  );
};

export default KanbanBoard;