"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { showSuccess } from "@/utils/toast";

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

  React.useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(customers));
  }, [customers]);

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

  const filtered = customers.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Name</TableHead>
                <TableHead className="min-w-[220px]">Email</TableHead>
                <TableHead className="min-w-[200px]">Tags</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="flex flex-wrap gap-1">
                    {c.tags.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      c.tags.map((t, i) => (
                        <Badge key={`${c.id}-tag-${i}`} variant="secondary" className="px-2">
                          {t}
                        </Badge>
                      ))
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => removeCustomer(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    No customers match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomersTable;