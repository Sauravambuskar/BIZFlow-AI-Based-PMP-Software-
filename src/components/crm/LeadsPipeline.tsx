"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import LeadEditorDialog from "./LeadEditorDialog";

type Lead = { id: string; name: string; amount: number };
type Stage = "new" | "qualified" | "proposal" | "won" | "lost";
type PipelineState = Record<Stage, Lead[]>;

const LS_KEY = "crm.leads.v1";

const initialLeads: PipelineState = {
  new: [],
  qualified: [],
  proposal: [],
  won: [],
  lost: [],
};

const stageMeta: Record<Stage, { label: string }> = {
  new: { label: "New" },
  qualified: { label: "Qualified" },
  proposal: { label: "Proposal" },
  won: { label: "Won" },
  lost: { label: "Lost" },
};

const Column: React.FC<{
  stage: Stage;
  leads: Lead[];
  onDropLead: (leadId: string, from: Stage, to: Stage) => void;
  onEdit: (leadId: string) => void;
  onDelete: (leadId: string) => void;
}> = ({ stage, leads, onDropLead, onEdit, onDelete }) => {
  const onDrop = (e: React.DragEvent) => {
    const leadId = e.dataTransfer.getData("leadId");
    const from = e.dataTransfer.getData("from") as Stage;
    if (leadId && from) onDropLead(leadId, from, stage);
  };
  const sum = leads.reduce((s, l) => s + l.amount, 0);
  return (
    <div
      className="rounded-lg border bg-background/50 p-3"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium">{stageMeta[stage].label}</div>
        <div className="text-xs text-muted-foreground">
          {leads.length} • ${sum.toLocaleString()}
        </div>
      </div>
      <div className="min-h-[140px] space-y-2">
        {leads.map((l) => (
          <div
            key={l.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("leadId", l.id);
              e.dataTransfer.setData("from", stage);
            }}
            className="group cursor-grab rounded-md border bg-card p-3 text-sm hover:bg-accent"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate font-medium">{l.name}</div>
                <div className="text-xs text-muted-foreground">
                  ${l.amount.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => onEdit(l.id)}
                  aria-label="Edit lead"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => onDelete(l.id)}
                  aria-label="Delete lead"
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

const LeadsPipeline: React.FC = () => {
  const [pipeline, setPipeline] = React.useState<PipelineState>(() => {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as PipelineState) : initialLeads;
  });
  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState<string>("");
  const [editingId, setEditingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(pipeline));
  }, [pipeline]);

  const moveLead = (leadId: string, from: Stage, to: Stage) => {
    if (from === to) return;
    const lead = pipeline[from].find((l) => l.id === leadId);
    if (!lead) return;
    setPipeline((prev) => ({
      ...prev,
      [from]: prev[from].filter((l) => l.id !== leadId),
      [to]: [lead, ...prev[to]],
    }));
  };

  const addLead = () => {
    const n = name.trim();
    const a = Number(amount);
    if (!n || Number.isNaN(a)) return;
    const lead: Lead = { id: `${Date.now()}`, name: n, amount: a };
    setPipeline((p) => ({ ...p, new: [lead, ...p.new] }));
    setName("");
    setAmount("");
    showSuccess("Lead added");
  };

  const findStageOf = (id: string): Stage | null => {
    const entries = Object.keys(pipeline) as Stage[];
    for (const s of entries) {
      if (pipeline[s].some((l) => l.id === id)) return s;
    }
    return null;
  };

  const updateLead = (id: string, newName: string, newAmount: number) => {
    const s = findStageOf(id);
    if (!s) return;
    setPipeline((prev) => ({
      ...prev,
      [s]: prev[s].map((l) => (l.id === id ? { ...l, name: newName, amount: newAmount } : l)),
    }));
    showSuccess("Lead updated");
  };

  const deleteLead = (id: string) => {
    const s = findStageOf(id);
    if (!s) return;
    setPipeline((prev) => ({
      ...prev,
      [s]: prev[s].filter((l) => l.id !== id),
    }));
    if (editingId === id) setEditingId(null);
    showSuccess("Lead deleted");
  };

  const clearLost = () => {
    if (pipeline.lost.length === 0) return;
    setPipeline((p) => ({ ...p, lost: [] }));
    showSuccess("Cleared lost leads");
  };

  const totals = React.useMemo(() => {
    const all = (Object.keys(pipeline) as Stage[]).flatMap((s) => pipeline[s]);
    const total = all.reduce((s, l) => s + l.amount, 0);
    const openTotal = (pipeline.new.concat(pipeline.qualified, pipeline.proposal)).reduce((s, l) => s + l.amount, 0);
    return { total, openTotal };
  }, [pipeline]);

  const editingLead =
    editingId
      ? (pipeline.new.find((l) => l.id === editingId) ||
         pipeline.qualified.find((l) => l.id === editingId) ||
         pipeline.proposal.find((l) => l.id === editingId) ||
         pipeline.won.find((l) => l.id === editingId) ||
         pipeline.lost.find((l) => l.id === editingId))
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-[1fr,150px,auto,auto]">
          <Input
            placeholder="Lead name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Amount (USD)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
          />
          <Button onClick={addLead} className="whitespace-nowrap">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
          <Button variant="outline" onClick={clearLost} className="whitespace-nowrap">
            Clear Lost
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Total Pipeline: ${totals.total.toLocaleString()}</span>
          <span>Open (New+Qualified+Proposal): ${totals.openTotal.toLocaleString()}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {(Object.keys(stageMeta) as Stage[]).map((s) => (
            <Column
              key={s}
              stage={s}
              leads={pipeline[s]}
              onDropLead={moveLead}
              onEdit={(id) => setEditingId(id)}
              onDelete={deleteLead}
            />
          ))}
        </div>
        <LeadEditorDialog
          open={!!editingId}
          initialName={editingLead?.name ?? ""}
          initialAmount={editingLead?.amount ?? 0}
          onOpenChange={(o) => {
            if (!o) setEditingId(null);
          }}
          onSave={(n, a) => {
            if (!editingId) return;
            updateLead(editingId, n, a);
            setEditingId(null);
          }}
        />
      </CardContent>
    </Card>
  );
};

export default LeadsPipeline;