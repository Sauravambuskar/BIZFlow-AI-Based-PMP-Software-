"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import TaskEditorDialog from "./TaskEditorDialog";
import { exportToCsv } from "@/utils/export";

type Task = { id: string; title: string };
type Columns = "todo" | "doing" | "done";
type BoardState = Record<Columns, Task[]>;

const LS_KEY = "bizflow_kanban";

type KanbanBoardProps = {
  storageKey?: string;
  title?: string;
};

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
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}> = ({ label, name, tasks, onDropTask, onEditTask, onDeleteTask }) => {
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
            className="group cursor-grab rounded-md border bg-card p-3 text-sm hover:bg-accent"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">{t.title}</span>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => onEditTask(t.id)}
                  aria-label="Edit task"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => onDeleteTask(t.id)}
                  aria-label="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ storageKey, title }) => {
  const key = storageKey ?? LS_KEY;
  const [board, setBoard] = React.useState<BoardState>(() => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as BoardState) : initialState;
  });
  const [newTitle, setNewTitle] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(board));
  }, [board, key]);

  const filteredBoard = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return board;
    const filter = (arr: Task[]) => arr.filter((t) => t.title.toLowerCase().includes(q));
    return {
      todo: filter(board.todo),
      doing: filter(board.doing),
      done: filter(board.done),
    } as BoardState;
  }, [board, query]);

  const totals = React.useMemo(() => {
    const todo = board.todo.length;
    const doing = board.doing.length;
    const done = board.done.length;
    const total = todo + doing + done;
    return { total, todo, doing, done };
  }, [board]);

  const flattenForCsv = (state: BoardState) => {
    return [
      ...state.todo.map((t) => ({ column: "Todo", title: t.title })),
      ...state.doing.map((t) => ({ column: "Doing", title: t.title })),
      ...state.done.map((t) => ({ column: "Done", title: t.title })),
    ];
  };
  const exportAll = () => exportToCsv("tasks-all.csv", flattenForCsv(board));
  const exportFiltered = () => exportToCsv("tasks-filtered.csv", flattenForCsv(filteredBoard));

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

  const findTaskColumn = (taskId: string): Columns | null => {
    if (board.todo.some((t) => t.id === taskId)) return "todo";
    if (board.doing.some((t) => t.id === taskId)) return "doing";
    if (board.done.some((t) => t.id === taskId)) return "done";
    return null;
  };

  const updateTaskTitle = (taskId: string, title: string) => {
    const col = findTaskColumn(taskId);
    if (!col) return;
    setBoard((prev) => ({
      ...prev,
      [col]: prev[col].map((t) => (t.id === taskId ? { ...t, title } : t)),
    }));
    showSuccess("Task updated");
  };

  const deleteTask = (taskId: string) => {
    const col = findTaskColumn(taskId);
    if (!col) return;
    setBoard((prev) => ({
      ...prev,
      [col]: prev[col].filter((t) => t.id !== taskId),
    }));
    showSuccess("Task deleted");
    if (editingId === taskId) setEditingId(null);
  };

  const clearDone = () => {
    const count = board.done.length;
    if (count === 0) return;
    setBoard((prev) => ({ ...prev, done: [] }));
    showSuccess("Cleared done tasks");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title ?? "Kanban"}</CardTitle>
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
          <Button variant="outline" onClick={clearDone}>
            Clear Done
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr,auto,auto]">
          <Input
            placeholder="Search tasks by title"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="outline" onClick={exportFiltered} className="whitespace-nowrap">
            Export Filtered CSV
          </Button>
          <Button variant="outline" onClick={exportAll} className="whitespace-nowrap">
            Export All CSV
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Total: {totals.total}</span>
          <span>Todo: {totals.todo}</span>
          <span>Doing: {totals.doing}</span>
          <span>Done: {totals.done}</span>
          {query.trim() ? (
            <span>
              Filtered: {filteredBoard.todo.length + filteredBoard.doing.length + filteredBoard.done.length}
            </span>
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Column
            label="Todo"
            name="todo"
            tasks={query.trim() ? filteredBoard.todo : board.todo}
            onDropTask={moveTask}
            onEditTask={(id) => setEditingId(id)}
            onDeleteTask={deleteTask}
          />
          <Column
            label="Doing"
            name="doing"
            tasks={query.trim() ? filteredBoard.doing : board.doing}
            onDropTask={moveTask}
            onEditTask={(id) => setEditingId(id)}
            onDeleteTask={deleteTask}
          />
          <Column
            label="Done"
            name="done"
            tasks={query.trim() ? filteredBoard.done : board.done}
            onDropTask={moveTask}
            onEditTask={(id) => setEditingId(id)}
            onDeleteTask={deleteTask}
          />
        </div>
        <TaskEditorDialog
          open={!!editingId}
          initialTitle={
            editingId
              ? (board.todo.find((t) => t.id === editingId) ||
                 board.doing.find((t) => t.id === editingId) ||
                 board.done.find((t) => t.id === editingId)
                )?.title ?? ""
              : ""
          }
          onOpenChange={(open) => {
            if (!open) setEditingId(null);
          }}
          onSave={(title) => {
            if (!editingId) return;
            updateTaskTitle(editingId, title);
            setEditingId(null);
          }}
        />
      </CardContent>
    </Card>
  );
};

export default KanbanBoard;