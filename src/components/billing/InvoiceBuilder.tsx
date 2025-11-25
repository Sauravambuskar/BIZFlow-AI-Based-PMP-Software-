"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { exportToCsv } from "@/utils/export";
import { showSuccess } from "@/utils/toast";

type Item = { id: string; description: string; qty: number; rate: number; tax: number };

const LS_KEY = "bizflow_invoice_draft";

const InvoiceBuilder: React.FC = () => {
  const [items, setItems] = React.useState<Item[]>(() => {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Item[]) : [{ id: "i-1", description: "", qty: 1, rate: 0, tax: 0 }];
  });

  const addItem = () => setItems((prev) => [...prev, { id: `i-${Date.now()}`, description: "", qty: 1, rate: 0, tax: 0 }]);
  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const update = (id: string, field: keyof Item, value: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: field === "description" ? value : Number(value || 0) } : i)),
    );
  };

  React.useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const taxTotal = items.reduce((s, i) => s + (i.qty * i.rate * i.tax) / 100, 0);
  const total = subtotal + taxTotal;

  const exportCsv = () => {
    exportToCsv("invoice.csv", items.map((i) => ({ description: i.description, qty: i.qty, rate: i.rate, tax: i.tax })));
  };
  const saveDraft = () => showSuccess("Invoice draft saved");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="w-24">Qty</TableHead>
                <TableHead className="w-28">Rate</TableHead>
                <TableHead className="w-28">Tax %</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>
                    <Input
                      value={i.description}
                      onChange={(e) => update(i.id, "description", e.target.value)}
                      placeholder="Item description"
                    />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={i.qty} onChange={(e) => update(i.id, "qty", e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={i.rate} onChange={(e) => update(i.id, "rate", e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={i.tax} onChange={(e) => update(i.id, "tax", e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(i.id)} aria-label="Remove item">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5}>
                  <Button onClick={addItem} className="w-full">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Subtotal</div>
            <div className="text-lg font-semibold">₹{subtotal.toFixed(2)}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Tax</div>
            <div className="text-lg font-semibold">₹{taxTotal.toFixed(2)}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-lg font-semibold">₹{total.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={saveDraft}>Save Draft</Button>
          <Button variant="secondary" onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceBuilder;