"use client";

import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, CartesianGrid, Cell } from "recharts";

type Row = { month: string; income: number; expenses: number };

const chartConfig: ChartConfig = {
  net: {
    label: "Net Profit",
    color: "hsl(217.2 91.2% 59.8%)", // base blue for legend
  },
};

type Props = {
  data: Row[];
};

const NetProfitChart: React.FC<Props> = ({ data }) => {
  const rows = React.useMemo(
    () => data.map((d) => ({ month: d.month, net: d.income - d.expenses })),
    [data],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Net Profit</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="w-full">
          <BarChart data={rows} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} strokeOpacity={0.2} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="net" stroke="var(--color-net)" radius={[4, 4, 0, 0]}>
              {rows.map((r, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={
                    r.net >= 0
                      ? "hsl(142.1 76.2% 36.3%)" // green
                      : "hsl(0 84.2% 60.2%)" // red
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default NetProfitChart;