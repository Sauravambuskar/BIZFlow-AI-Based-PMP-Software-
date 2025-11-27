"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Pencil, Check, X, ArrowUpDown, ChevronUp, ChevronDown, FileText } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportToCsv, copyCsvToClipboard } from "@/utils/export";
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
import { useSupabaseSession } from "@/context/supabase-session";
import {
  listCustomers as listCustomersApi,
  addCustomer as addCustomerApi,
  updateCustomer as updateCustomerApi,
  deleteCustomer as deleteCustomerApi,
  deleteCustomers as deleteCustomersApi,
  UICustomer as Customer,
} from "@/data/customers";
import { supabase } from "@/integrations/supabase/client";
import TagFilter from "@/components/crm/TagFilter";
import TagChipsEditor from "@/components/crm/TagChipsEditor";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";

const CustomersTable: React.FC = () => {
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSupabaseSession();

  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [query, setQuery] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [tagsInput, setTagsInput] = React.useState("");

  // sorting, pagination, and inline edit state
  const [sortKey, setSortKey] = React.useState<"name" | "email" | "createdAt">("name");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = React.useState<number>(8);
  const [page, setPage] = React.useState<number>(1);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [segment, setSegment] = React.useState<"all" | "with_tags" | "without_tags">("all");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editTagsArr, setEditTagsArr] = React.useState<string[]>([]);

  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [singleConfirmOpen, setSingleConfirmOpen] = React.useState(false);
  const [singleDeleteId, setSingleDeleteId] = React.useState<string | null>(null);
  // Bulk tag actions
  const [bulkAddTags, setBulkAddTags] = React.useState("");
  const [bulkRemoveTags, setBulkRemoveTags] = React.useState("");

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (sessionLoading) return;
    if (!session?.user?.id) {
      setCustomers([]);
      setLoading(false);
      return;
    }
    (async () => {
      const rows = await listCustomersApi(session.user.id);
      setCustomers(rows);
      setLoading(false);
    })();
  }, [sessionLoading, session?.user?.id]);

  // Realtime updates for customers
  React.useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    const channel = supabase
      .channel(`realtime:customers:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers', filter: `user_id=eq.${userId}` },
        (payload) => {
          const type = (payload as any).eventType as 'INSERT' | 'UPDATE' | 'DELETE';
          if (type === 'INSERT') {
            const r: any = (payload as any).new;
            const rec: Customer = { id: r.id, name: r.name, email: r.email, tags: r.tags ?? [], createdAt: r.created_at };
            setCustomers((prev) => (prev.some((c) => c.id === rec.id) ? prev : [rec, ...prev]));
          } else if (type === 'UPDATE') {
            const r: any = (payload as any).new;
            const rec: Customer = { id: r.id, name: r.name, email: r.email, tags: r.tags ?? [], createdAt: r.created_at };
            setCustomers((prev) => prev.map((c) => (c.id === rec.id ? rec : c)));
          } else if (type === 'DELETE') {
            const r: any = (payload as any).old;
            const id = r.id as string;
            setCustomers((prev) => prev.filter((c) => c.id !== id));
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

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
  }, [query, sortKey, sortDir, pageSize, selectedTags, segment, dateRange]);

  const addCustomer = async () => {
    const n = name.trim();
    const e = email.trim();
    if (!n || !e || !session?.user?.id) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const created = await addCustomerApi(session.user.id, { name: n, email: e, tags });
    setCustomers((prev) => [created, ...prev]);
    setName("");
    setEmail("");
    setTagsInput("");
    showSuccess("Customer added");
  };

  const removeCustomer = async (id: string) => {
    await deleteCustomerApi(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showSuccess("Customer removed");
  };

  // sorting helpers
  const toggleSort = (key: "name" | "email" | "createdAt") => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = customers.filter((c) => {
    // segment filter
    if (segment === "with_tags" && c.tags.length === 0) return false;
    if (segment === "without_tags" && c.tags.length > 0) return false;
    
    // selected tags: require all selected tags to be present
    if (selectedTags.length > 0) {
      const set = new Set(c.tags.map((t) => t.toLowerCase()));
      const hasAll = selectedTags.every((t) => set.has(t.toLowerCase()));
      if (!hasAll) return false;
    }
    
    // created date range filter (inclusive)
    if (dateRange?.from || dateRange?.to) {
      const created = new Date(c.createdAt).getTime();
      const from = dateRange?.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : -Infinity;
      const to = dateRange?.to ? new Date(dateRange.to).setHours(23, 59, 59, 999) : Infinity;
      if (!(created >= from && created <= to)) return false;
    }
    
    // text query
    const q = query.trim().toLowerCase();
    if (!q) return true;
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
    setEditTagsArr(c.tags);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditEmail("");
    setEditTagsArr([]);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const n = editName.trim();
    const e = editEmail.trim();
    if (!n || !e) return;
    const updated = await updateCustomerApi(editingId, { name: n, email: e, tags: editTagsArr });
    setCustomers((prev) =>
      prev.map((c) => (c.id === editingId ? updated : c)),
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

  const copyFiltered = async () => {
    const rows = sorted.map((c) => ({
      name: c.name,
      email: c.email,
      tags: c.tags.join(", "),
      createdAt: c.createdAt,
    }));
    await copyCsvToClipboard(rows);
    showSuccess("Filtered CSV copied to clipboard");
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

  const confirmDeleteSelected = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    await deleteCustomersApi(ids);
    setCustomers((prev) => prev.filter((c) => !ids.includes(c.id)));
    setConfirmOpen(false);
    setSelected(new Set());
    showSuccess("Selected customers deleted");
  };

  const confirmDeleteSingle = async () => {
    if (!singleDeleteId) return;
    await removeCustomer(singleDeleteId);
    setSingleConfirmOpen(false);
    setSingleDeleteId(null);
  };

  const parseTags = (s: string) =>
    s
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const addTagsToSelected = async () => {
    const ids = Array.from(selected);
    const toAdd = parseTags(bulkAddTags);
    if (ids.length === 0 || toAdd.length === 0) return;
    for (const id of ids) {
      const cur = customers.find((c) => c.id === id);
      if (!cur) continue;
      const set = new Set<string>(cur.tags);
      toAdd.forEach((t) => set.add(t));
      const nextTags = Array.from(set);
      const updated = await updateCustomerApi(id, { tags: nextTags });
      setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
    showSuccess("Tags added to selected customers");
    setBulkAddTags("");
  };

  const removeTagsFromSelected = async () => {
    const ids = Array.from(selected);
    const toRemove = new Set(parseTags(bulkRemoveTags));
    if (ids.length === 0 || toRemove.size === 0) return;
    for (const id of ids) {
      const cur = customers.find((c) => c.id === id);
      if (!cur) continue;
      const nextTags = cur.tags.filter((t) => !toRemove.has(t));
      const updated = await updateCustomerApi(id, { tags: nextTags });
      setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
    showSuccess("Tags removed from selected customers");
    setBulkRemoveTags("");
  };

  const availableTags = React.useMemo(() => {
    const s = new Set<string>();
    customers.forEach((c) => c.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [customers]);

  if (sessionLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            Loading customers…
          </div>
        </CardContent>
      </Card>
    );
  }

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

        {/* Tag filter + segment/date controls */}
        <div className="grid gap-3 sm:grid-cols-[1fr_260px]">
          <TagFilter
            availableTags={availableTags}
            selected={selectedTags}
            onChange={setSelectedTags}
            onClear={() => setSelectedTags([])}
          />
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Segment</div>
              <Select value={segment} onValueChange={(v) => setSegment(v as typeof segment)}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All customers</SelectItem>
                  <SelectItem value="with_tags">With tags</SelectItem>
                  <SelectItem value="without_tags">Without tags</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Created date</div>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                          </>
                        ) : (
                          <>From {format(dateRange.from, "MMM d, yyyy")}</>
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                {(dateRange?.from || dateRange?.to) && (
                  <Button variant="ghost" size="sm" onClick={() => setDateRange(undefined)}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary toolbar: export and page size */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full sm:w-auto gap-2">
            <Button variant="outline" onClick={exportFiltered} className="flex-1 sm:flex-none">
              Export Filtered CSV
            </Button>
            <Button
              variant="secondary"
              onClick={copyFiltered}
              className="flex-1 sm:flex-none"
            >
              Copy Filtered CSV
            </Button>
          </div>
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
            <Button variant="outline" disabled={selected.size === 0} onClick={() => {
              if (selected.size === 0) return;
              const rows = customers
                .filter((c) => selected.has(c.id))
                .map((c) => ({
                  name: c.name,
                  email: c.email,
                  tags: c.tags.join(", "),
                  createdAt: c.createdAt,
                }));
              exportToCsv("customers-selected.csv", rows);
            }}>
              Export Selected CSV
            </Button>
            <Button
              variant="secondary"
              disabled={selected.size === 0}
              onClick={async () => {
                if (selected.size === 0) return;
                const rows = customers
                  .filter((c) => selected.has(c.id))
                  .map((c) => ({
                    name: c.name,
                    email: c.email,
                    tags: c.tags.join(", "),
                    createdAt: c.createdAt,
                  }));
                await copyCsvToClipboard(rows);
                showSuccess("Selected CSV copied to clipboard");
              }}
            >
              Copy Selected CSV
            </Button>
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

        {/* Bulk tag tools */}
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
          <Input
            placeholder="Add tags to selected (comma separated)"
            value={bulkAddTags}
            onChange={(e) => setBulkAddTags(e.target.value)}
          />
          <Input
            placeholder="Remove tags from selected (comma separated)"
            value={bulkRemoveTags}
            onChange={(e) => setBulkRemoveTags(e.target.value)}
          />
          <Button
            variant="outline"
            className="whitespace-nowrap"
            onClick={addTagsToSelected}
            disabled={selected.size === 0 || !bulkAddTags.trim()}
          >
            Add Tags
          </Button>
          <Button
            variant="outline"
            className="whitespace-nowrap"
            onClick={removeTagsFromSelected}
            disabled={selected.size === 0 || !bulkRemoveTags.trim()}
          >
            Remove Tags
          </Button>
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
                <TableHead className="w-44">Actions</TableHead>
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
                        <TagChipsEditor
                          value={editTagsArr}
                          onChange={setEditTagsArr}
                          placeholder="Add tag"
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
                            aria-label="Edit inline"
                            onClick={() => startEdit(c)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Details"
                            onClick={() => navigate(`/crm/customers/${c.id}`)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete"
                            onClick={() => {
                              setSingleDeleteId(c.id);
                              setSingleConfirmOpen(true);
                            }}
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
                    No customers found.
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
                This action cannot be undone. These records will be permanently removed from your account.
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

        <AlertDialog open={singleConfirmOpen} onOpenChange={setSingleConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove this customer from your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteSingle}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default CustomersTable;