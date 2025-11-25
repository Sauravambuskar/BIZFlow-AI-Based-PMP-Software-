"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FinanceChart from "@/components/dashboard/FinanceChart";
import { Button } from "@/components/ui/button";
import { exportToCsv } from "@/utils/export";
import { financeData } from "../data/finance.ts";
import TimeframeSelector from "../components/reports/TimeframeSelector";
import NetProfitChart from "../components/reports/NetProfitChart";
import KpiRow from "../components/reports/KpiRow";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Reports: React.FC = () => {
  const [months, setMonths] = React.useState<3 | 6 | 12>(6);
  const [showIncome, setShowIncome] = React.useState(true);
  const [showExpenses, setShowExpenses] = React.useState(true);
  const chartData = React.useMemo(
    () => financeData.slice(-months),
    [months],
  );
  const currentViewRows = React.useMemo(
    () => chartData.map((d) => ({ ...d, net: d.income - d.expenses })),
    [chartData],
  );

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground">Finance, CRM, project performance, and productivity.</p>
          </div>
          <TimeframeSelector value={months} onChange={setMonths} />
        </div>

        {/* KPIs for the current view */}
        <KpiRow data={chartData} />

        {/* Series toggles */}
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Switch id="toggle-income" checked={showIncome} onCheckedChange={setShowIncome} />
            <Label htmlFor="toggle-income">Income</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="toggle-expenses" checked={showExpenses} onCheckedChange={setShowExpenses} />
            <Label htmlFor="toggle-expenses">Expenses</Label>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <FinanceChart data={chartData} showIncome={showIncome} showExpenses={showExpenses} />
            <NetProfitChart data={chartData} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Download Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => exportToCsv(`finance-${months}m.csv`, currentViewRows)}
                className="w-full"
              >
                Export Current View CSV
              </Button>
              <Button
                onClick={() => exportToCsv("finance-full.csv", financeData.map((d) => ({ ...d, net: d.income - d.expenses })))}
                className="w-full"
              >
                Export Full (12M) CSV
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