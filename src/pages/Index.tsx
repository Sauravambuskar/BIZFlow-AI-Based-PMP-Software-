"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import KpiCard from "@/components/dashboard/KpiCard";
import FinanceChart from "@/components/dashboard/FinanceChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import { TrendingUp, TrendingDown, Wallet, TimerReset } from "lucide-react";

const Index: React.FC = () => {
  return (
    <AppLayout>
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Monthly Revenue"
          value="₹18,000"
          delta="+14.2%"
          trend="up"
          subtitle="vs last month"
          icon={<TrendingUp />}
          className="bg-gradient-to-br from-indigo-600 via-fuchsia-500 to-rose-500"
        />
        <KpiCard
          title="Expenses"
          value="₹11,500"
          delta="+5.1%"
          trend="up"
          subtitle="vs last month"
          icon={<TrendingDown />}
          className="bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500"
        />
        <KpiCard
          title="Net Profit"
          value="₹6,500"
          delta="+9.8%"
          trend="up"
          subtitle="margin 36%"
          icon={<Wallet />}
          className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500"
        />
        <KpiCard
          title="Overdue Invoices"
          value="4"
          delta="-20%"
          trend="down"
          subtitle="this month"
          icon={<TimerReset />}
          className="bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-600"
        />
      </div>

      {/* Chart + Activity + Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FinanceChart />
        </div>
        <div className="space-y-4">
          <RecentActivity />
          <QuickActions />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;