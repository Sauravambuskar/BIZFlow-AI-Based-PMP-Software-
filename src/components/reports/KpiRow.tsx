"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, DollarSign } from "lucide-react";

type Row = { month: string; income: number; expenses: number };

type Props = {
  data: Row[];
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const KpiRow: React.FC<Props> = ({ data }) => {
  const totals = React.useMemo(() => {
    const totalIncome = data.reduce((a, b) => a + b.income, 0);
    const totalExpenses = data.reduce((a, b) => a + b.expenses, 0);
    const net = totalIncome - totalExpenses;
    return { totalIncome, totalExpenses, net };
  }, [data]);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="border-l-4 border-l-emerald-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-2xl font-semibold">{fmt(totals.totalIncome)}</div>
          <DollarSign className="h-5 w-5 text-emerald-600" />
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-rose-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-2xl font-semibold">{fmt(totals.totalExpenses)}</div>
          <ArrowDownRight className="h-5 w-5 text-rose-600" />
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className={`text-2xl font-semibold ${totals.net >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {fmt(totals.net)}
          </div>
          <ArrowUpRight className={`h-5 w-5 ${totals.net >= 0 ? "text-emerald-600" : "text-rose-600"}`} />
        </CardContent>
      </Card>
    </div>
  );
};

export default KpiRow;