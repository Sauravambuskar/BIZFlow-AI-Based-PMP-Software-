"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Pencil, Check, X, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportToCsv } from "@/utils/export";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Customer = {
  id: string;
  name: string;
  email: string;
  tags: string[];
  createdAt: string; // ISO
};

const LS_KEY = "bizflow_customers";

const defaultCustomers: Customer[] = [
  { id: "c-1", name: "Acme Industries", email: "ops@acme.com", tags: ["Enterprise", "Priority"], createdAt: new Date().toISOString() },
  { id: "c-2", name: "Nimbus Labs", email: "hello@nimbus.ai", tags: ["Startup"], createdAt: new Date().toISOString() },
  { id: "c-3", name: "BlueBay Retail", email: "contact@bluebay.in", tags: ["Retail"], createdAt: new Date().toISOString() },
];

const CustomersTable: React.FC = () => {
  const [customers, setCustomers] = React.useState<Customer[]>(() => {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Customer[]) : defaultCustomers;
  });
  const [query, setQuery] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [tagsInput, setTagsInput] = React.useState("");

  // ADDED: sorting, pagination, and inline edit state
  const [sortKey, setSortKey] = React.useState<"name" | "email" | "createdAt">("name");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = React.useState<number>(8);
  const [page, setPage] = React.useState<number>(1);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editTags, setEditTags] = React.useState("");

  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(customers));
  }, [customers]);

  // Clear selection if dataset changes substantially
  React.useEffect(() => {
    setSelected((prev) => {
      const next = new Set<string>();
      const ids = new Set(customers.map((c) => c.id));
      prev.forEach((id) => {
        if (ids.has(id)) next.add(id);
      });
      return next;
    });
  }, [customers]);

  // Reset page when filters/sorting/page size changes
  React.useEffect(() => {
    setPage(1);
  }, [query, sortKey, sortDir, pageSize]);

  const addCustomer = () => {
    const n = name.trim();
    const e = email.trim();
    if (!n || !e) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const next: Customer = {
      id: `c-${Date.now()}`,
      name: n,
      email: e,
      tags,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [next, ...prev]);
    setName("");
    setEmail("");
    setTagsInput("");
    showSuccess("Customer added");
  };

  const removeCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showSuccess("Customer removed");
  };

  // ADDED: sorting helpers
  const toggleSort = (key: "name" | "email" | "createdAt") => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = customers.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av: string = "";
      let bv: string = "";
      if (sortKey === "name") {
        av = a.name.toLowerCase();
        bv = b.name.toLowerCase();
      } else if (sortKey === "email") {
        av = a.email.toLowerCase();
        bv = b.email.toLowerCase();
      } else {
        // createdAt
        av = a.createdAt;
        bv = b.createdAt;
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  // Pagination
  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(total, start + pageSize);
  const pageRows = sorted.slice(start, end);

  // Inline editing
  const startEdit = (c: Customer) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditEmail(c.email);
    setEditTags(c.tags.join(", "));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditEmail("");
    setEditTags("");
  };

  const saveEdit = () => {
    if (!editingId) return;
    const n = editName.trim();
    const e = editEmail.trim();
    if (!n || !e) return;
    const newTags = editTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === editingId ? { ...c, name: n, email: e, tags: newTags } : c,
      ),
    );
    showSuccess("Customer updated");
    cancelEdit();
  };

  // Export filtered (sorted) list
  const exportFiltered = () => {
    const rows = sorted.map((c) => ({
      name: c.name,
      email: c.email,
      tags: c.tags.join(", "),
      createdAt: c.createdAt,
    }));
    exportToCsv("customers-filtered.csv", rows);
  };

  const isAllPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));
  const toggleSelectAllPage = (checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      pageRows.forEach((r) => {
        if (checked) next.add(r.id);
        else next.delete(r.id);
      });
      return next;
    });
  };

  const toggleSelectOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const confirmDeleteSelected = () => {
    const ids = new Set(selected);
    if (ids.size === 0) return;
    setCustomers((prev) => prev.filter((c) => !ids.has(c.id)));
    setConfirmOpen(false);
    setSelected(new Set());
    showSuccess("Selected customers deleted");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top controls: search, add new */}
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="Search customers (name, email, tags)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              type="email"
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <Input
              placeholder="Tags (comma separated)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
            <Button onClick={addCustomer} className="whitespace-nowrap">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        {/* Secondary toolbar: export and page size */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={exportFiltered} className="w-full sm:w-auto">
            Export Filtered CSV
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {selected.size > 0 ? `${selected.size} selected` : "No rows selected"}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={selected.size === 0} onClick={clearSelection}>
              Clear Selection
            </Button>
            <Button
              variant="destructive"
              disabled={selected.size === 0}
              onClick={() => setConfirmOpen(true)}
            >
              Delete Selected
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    aria-label="Select all on page"
                    checked={isAllPageSelected}
                    onCheckedChange={(ch) => toggleSelectAllPage(Boolean(ch))}
                  />
                </TableHead>
                <TableHead className="min-w-[180px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-0 font-medium"
                    onClick={() => toggleSort("name")}
                  >
                    Name
                    {sortKey !== "name" ? (
                      <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
                    ) : sortDir === "asc" ? (
                      <ChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[220px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-0 font-medium"
                    onClick={() => toggleSort("email")}
                  >
                    Email
                    {sortKey !== "email" ? (
                      <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
                    ) : sortDir === "asc" ? (
                      <ChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[200px]">Tags</TableHead>
                <TableHead className="min-w-[160px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-0 font-medium"
                    onClick={() => toggleSort("createdAt")}
                  >
                    Created
                    {sortKey !== "createdAt" ? (
                      <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
                    ) : sortDir === "asc" ? (
                      <ChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="w-36">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((c) => {
                const isEditing = editingId === c.id;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="w-10">
                      <Checkbox
                        aria-label="Select row"
                        checked={selected.has(c.id)}
                        onCheckedChange={(ch) => toggleSelectOne(c.id, Boolean(ch))}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {isEditing ? (
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                      ) : (
                        c.name
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {isEditing ? (
                        <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                      ) : (
                        c.email
                      )}
                    </TableCell>
                    <TableCell className="flex flex-wrap gap-1">
                      {isEditing ? (
                        <Input
                          placeholder="tag1, tag2"
                          value={editTags}
                          onChange={(e) => setEditTags(e.target.value)}
                        />
                      ) : c.tags.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        c.tags.map((t, i) => (
                          <Badge key={`${c.id}-tag-${i}`} variant="secondary" className="px-2">
                            {t}
                          </Badge>
                        ))
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(c.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <Button variant="ghost" size="icon" aria-label="Save" onClick={saveEdit}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" aria-label="Cancel" onClick={cancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit"
                            onClick={() => startEdit(c)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete"
                            onClick={() => removeCustomer(c.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No customers match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div className="text-sm text-muted-foreground">
            Showing {total === 0 ? 0 : start + 1}–{end} of {total}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </Button>
            <div className="text-sm">
              Page {page} of {pageCount}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page >= pageCount}
            >
              Next
            </Button>
          </div>
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete selected customers?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove the selected customer records from your browser storage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteSelected}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default CustomersTable;