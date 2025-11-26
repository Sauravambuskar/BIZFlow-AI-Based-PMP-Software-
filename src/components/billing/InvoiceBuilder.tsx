"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { exportToCsv, copyCsvToClipboard } from "@/utils/export";
import { showSuccess } from "@/utils/toast";
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

type Item = { id: string; description: string; qty: number; rate: number; tax: number };

const LS_KEY = "bizflow_invoice_draft";

const InvoiceBuilder: React.FC = () => {
  const [items, setItems] = React.useState<Item[]>(() => {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Item[]) : [{ id: "i-1", description: "", qty: 1, rate: 0, tax: 0 }];
  });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

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
  const copyCsv = async () => {
    const rows = items.map((i) => ({
      description: i.description,
      qty: i.qty,
      rate: i.rate,
      tax: i.tax,
    }));
    await copyCsvToClipboard(rows);
    showSuccess("Invoice CSV copied to clipboard");
  };
  const saveDraft = () => showSuccess("Invoice draft saved");

  const makePrintableHtml = (rows: Item[]) => {
    const subtotalP = rows.reduce((s, i) => s + i.qty * i.rate, 0);
    const taxTotalP = rows.reduce((s, i) => s + (i.qty * i.rate * i.tax) / 100, 0);
    const totalP = subtotalP + taxTotalP;
    const currency = (n: number) => `₹${n.toFixed(2)}`;

    const itemsHtml = rows
      .map(
        (i) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${i.description || "-"}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${i.qty}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${currency(i.rate)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${i.tax}%</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${currency(i.qty * i.rate)}</td>
        </tr>`
      )
      .join("");

    return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Invoice</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color:#0f172a; }
      .container { max-width: 800px; margin: 0 auto; padding: 24px; }
      .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
      .brand { font-size:20px; font-weight:600; }
      .muted { color:#64748b; font-size:12px; }
      table { width:100%; border-collapse:collapse; margin-top:12px; }
      th { text-align:left; padding:8px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-size:12px; color:#475569; }
      tfoot td { padding:8px; }
      .totals { width: 320px; margin-left:auto; }
      .right { text-align:right; }
      @media print {
        @page { size: A4; margin: 16mm; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="brand">Invoice</div>
        <div class="muted">${new Date().toLocaleDateString()}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="right">Qty</th>
            <th class="right">Rate</th>
            <th class="right">Tax %</th>
            <th class="right">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <table class="totals" style="margin-top:16px;">
        <tbody>
          <tr><td>Subtotal</td><td class="right">${currency(subtotalP)}</td></tr>
          <tr><td>Tax</td><td class="right">${currency(taxTotalP)}</td></tr>
          <tr><td style="font-weight:700;">Total</td><td class="right" style="font-weight:700;">${currency(totalP)}</td></tr>
        </tbody>
      </table>
      <p class="muted" style="margin-top:24px;">Thank you for your business.</p>
    </div>
  </body>
</html>`;
  };

  const exportPdf = () => {
    showSuccess("Preparing PDF...");
    const html = makePrintableHtml(items);
    const w = window.open("", "print", "width=900,height=1000");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    // Print after a short delay to ensure styles render
    setTimeout(() => {
      w.print();
      w.close();
    }, 200);
  };

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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeleteId(i.id);
                        setConfirmDeleteOpen(true);
                      }}
                      aria-label="Remove item"
                    >
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
          <Button variant="secondary" onClick={copyCsv}>
            Copy CSV
          </Button>
          <Button variant="outline" onClick={exportPdf}>
            Export PDF
          </Button>
        </div>

        <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove this item?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete the selected line from the invoice.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteId) {
                    removeItem(deleteId);
                    showSuccess("Item removed");
                  }
                  setDeleteId(null);
                  setConfirmDeleteOpen(false);
                }}
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default InvoiceBuilder;