"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, IndianRupee, Repeat } from "lucide-react";
import { showSuccess } from "@/utils/toast";

const Billing: React.FC = () => {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Billing & Finance</h1>
            <p className="text-sm text-muted-foreground">Invoices, payments, and financial reports.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => showSuccess("Create Invoice")}>
              <Receipt className="h-4 w-4" />
              Create Invoice
            </Button>
            <Button variant="secondary" onClick={() => showSuccess("Enable Recurring")}>
              <Repeat className="h-4 w-4" />
              Recurring
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
          </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                GST-ready invoices with multiple tax slabs and payment tracking.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <div className="inline-flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-emerald-500" />
                  Payments & Overdues
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Integrate Razorpay/Stripe/PayPal and send automated reminders.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Billing;