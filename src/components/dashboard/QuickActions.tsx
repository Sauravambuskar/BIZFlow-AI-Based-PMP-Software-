"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderKanban, Receipt, Plus } from "lucide-react";
import { showSuccess } from "@/utils/toast";

const QuickActions: React.FC = () => {
  const handleClick = (label: string) => () => showSuccess(`${label} action ready`);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <Button className="w-full" onClick={handleClick("Add Customer")}>
          <Users className="h-4 w-4" />
          Add Customer
        </Button>
        <Button variant="secondary" className="w-full" onClick={handleClick("New Project")}>
          <FolderKanban className="h-4 w-4" />
          New Project
        </Button>
        <Button variant="outline" className="w-full" onClick={handleClick("Create Invoice")}>
          <Receipt className="h-4 w-4" />
          Create Invoice
        </Button>
        <Button variant="ghost" className="w-full" onClick={handleClick("Add Lead")}>
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;