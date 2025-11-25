"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, FileText, UserPlus, ReceiptIndianRupee } from "lucide-react";

const items = [
  { id: 1, icon: <UserPlus className="h-4 w-4 text-indigo-500" />, text: "New customer added: Acme Corp", time: "2h ago" },
  { id: 2, icon: <FileText className="h-4 w-4 text-amber-500" />, text: "Proposal sent to NovaLabs", time: "4h ago" },
  { id: 3, icon: <ReceiptIndianRupee className="h-4 w-4 text-emerald-500" />, text: "Invoice #INV-204 paid", time: "6h ago" },
  { id: 4, icon: <CheckCircle2 className="h-4 w-4 text-rose-500" />, text: "Task completed: Landing page QA", time: "1d ago" },
];

const RecentActivity: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-64">
          <ul className="space-y-3 py-3">
            {items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div className="flex items-center gap-2">
                  {it.icon}
                  <span className="text-sm">{it.text}</span>
                </div>
                <span className="text-xs text-muted-foreground">{it.time}</span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;