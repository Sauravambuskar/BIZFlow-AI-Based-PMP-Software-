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
          </TabsContent>
        </Tabs>
      </div>

      <AddCustomerDialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen} />
      <NewLeadDialog open={newLeadOpen} onOpenChange={setNewLeadOpen} />
    </AppLayout>
  );
};

export default Crm;