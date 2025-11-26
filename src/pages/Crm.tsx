"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Tags } from "lucide-react";
import CustomersTable from "@/components/crm/CustomersTable";
import LeadsPipeline from "@/components/crm/LeadsPipeline";
import AddCustomerDialog from "@/components/crm/AddCustomerDialog";
import NewLeadDialog from "@/components/crm/NewLeadDialog";

const Crm: React.FC = () => {
  const [addCustomerOpen, setAddCustomerOpen] = React.useState(false);
  const [newLeadOpen, setNewLeadOpen] = React.useState(false);

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">CRM</h1>
            <p className="text-sm text-muted-foreground">Manage customers, leads, and communications.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setAddCustomerOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Add Customer
            </Button>
            <Button variant="secondary" onClick={() => setNewLeadOpen(true)}>
              <Plus className="h-4 w-4" />
              New Lead
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <LeadsPipeline />

          <Card>
            <CardHeader>
              <CardTitle>
                <div className="inline-flex items-center gap-2">
                  <Tags className="h-4 w-4 text-fuchsia-500" />
                  Segments & Tags
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Segment customers by industry, tags, and custom fields.
              </div>
            </CardContent>
          </Card>
        </div>

        <CustomersTable />
      </div>

      <AddCustomerDialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen} />
      <NewLeadDialog open={newLeadOpen} onOpenChange={setNewLeadOpen} />
    </AppLayout>
  );
};

export default Crm;