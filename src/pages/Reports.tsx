"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FinanceChart from "@/components/dashboard/FinanceChart";
import { Button } from "@/components/ui/button";
import { exportToCsv } from "@/utils/export";
import { financeData } from "../data/finance.ts";

const Reports: React.FC = () => {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Finance, CRM, project performance, and productivity.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FinanceChart />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Download Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => exportToCsv("finance-report.csv", financeData)}
                className="w-full"
              >
                Export Finance CSV
              </Button>
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Export CSV/PDF will be available here.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;