"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSupabaseSession } from "@/context/supabase-session";
import { addCustomer } from "@/data/customers";
import { showSuccess } from "@/utils/toast";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ParsedRow = { name: string; email: string; tags: string[] };

const ImportCustomersDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const { session } = useSupabaseSession();
  const [fileName, setFileName] = React.useState<string>("");
  const [rows, setRows] = React.useState<ParsedRow[]>([]);
  const [importing, setImporting] = React.useState(false);

  const parseCsv = (text: string): ParsedRow[] => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = header.indexOf("name");
    const emailIdx = header.indexOf("email");
    const tagsIdx = header.indexOf("tags");
    if (nameIdx === -1 || emailIdx === -1) return [];
    const out: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const raw = lines[i];
      const parts: string[] = [];
      let cur = "";
      let inQuotes = false;
      for (let j = 0; j < raw.length; j++) {
        const ch = raw[j];
        if (ch === '"') {
          if (inQuotes && raw[j + 1] === '"') {
            cur += '"';
            j++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === "," && !inQuotes) {
          parts.push(cur);
          cur = "";
        } else {
          cur += ch;
        }
      }
      parts.push(cur);
      const name = (parts[nameIdx] ?? "").trim();
      const email = (parts[emailIdx] ?? "").trim();
      const tagsRaw = tagsIdx >= 0 ? (parts[tagsIdx] ?? "").trim() : "";
      const tags = tagsRaw
        ? tagsRaw.split(/[;,]/).map((t) => t.trim()).filter(Boolean)
        : [];
      if (name && email) {
        out.push({ name, email, tags });
      }
    }
    return out;
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const text = await f.text();
    const parsed = parseCsv(text);
    setRows(parsed);
  };

  const onImport = async () => {
    if (!session?.user?.id || rows.length === 0) return;
    setImporting(true);
    for (const r of rows) {
      await addCustomer(session.user.id, { name: r.name, email: r.email, tags: r.tags });
    }
    setImporting(false);
    showSuccess(`Imported ${rows.length} customers`);
    setRows([]);
    setFileName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Customers from CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input type="file" accept=".csv,text/csv" onChange={onFileChange} />
          <Card>
            <CardContent className="p-3 text-sm text-muted-foreground">
              Expected columns: name,email,tags. Tags are optional and can be comma or semicolon-separated.
            </CardContent>
          </Card>
          {fileName ? (
            <div className="text-sm">
              File: <span className="font-medium">{fileName}</span> • Parsed rows: {rows.length}
            </div>
          ) : null}
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onImport} disabled={importing || rows.length === 0}>
              {importing ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCustomersDialog;