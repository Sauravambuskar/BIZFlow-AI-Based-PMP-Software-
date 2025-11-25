"use client";

import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { financeData } from "../../data/finance.ts";

type FinanceRow = { month: string; income: number; expenses: number };
type FinanceChartProps = { data?: FinanceRow[]; showIncome?: boolean; showExpenses?: boolean };

const chartConfig: ChartConfig = {
  income: {
    label: "Income",
    color: "hsl(142.1 76.2% 36.3%)", // vibrant green
  },
  expenses: {
    label: "Expenses",
    color: "hsl(0 84.2% 60.2%)", // vibrant red
  },
};

const FinanceChart: React.FC<FinanceChartProps> = ({ data, showIncome = true, showExpenses = true }) => {
  const chartData = data ?? financeData;
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="w-full">
          <AreaChart
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <defs>
              <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-expenses)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-expenses)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.2} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            {showIncome && (
              <Area
                type="monotone"
                dataKey="income"
                stroke="var(--color-income)"
                fill="url(#income)"
                strokeWidth={2}
                dot={false}
              />
            )}
            {showExpenses && (
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="var(--color-expenses)"
                fill="url(#expenses)"
                strokeWidth={2}
                dot={false}
              />
            )}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default FinanceChart;