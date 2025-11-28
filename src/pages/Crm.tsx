"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Tags } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CustomersTable from "@/components/crm/CustomersTable";
import LeadsPipeline from "@/components/crm/LeadsPipeline";
import AddCustomerDialog from "@/components/crm/AddCustomerDialog";
import NewLeadDialog from "@/components/crm/NewLeadDialog";
import SegmentsManager from "@/components/crm/SegmentsManager";

const Crm: React.FC = () => {
  const [addCustomerOpen, setAddCustomerOpen] = React.useState(false);
  const [newLeadOpen, setNewLeadOpen] = React.useState(false);

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">CRM</h1>
          <p className="text-sm text-muted-foreground">Manage pipeline and customers in a clean, focused view.</p>
        </div>

        <Tabs defaultValue="leads" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-4">
            <div className="flex items-center justify-end">
              <Button variant="secondary" onClick={() => setNewLeadOpen(true)}>
                <Plus className="h-4 w-4" />
                New Lead
              </Button>
            </div>
            <LeadsPipeline />
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <div className="flex items-center justify-end">
              <Button onClick={() => setAddCustomerOpen(true)}>
                <UserPlus className="h-4 w-4" />
                Add Customer
              </Button>
            </div>
            <CustomersTable />
          </TabsContent>

          <TabsContent value="segments" className="space-y-4">
            <SegmentsManager />
          </TabsContent>
        </Tabs>
      </div>

      <AddCustomerDialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen} />
      <NewLeadDialog open={newLeadOpen} onOpenChange={setNewLeadOpen} />
    </AppLayout>
  );
};

export default Crm;