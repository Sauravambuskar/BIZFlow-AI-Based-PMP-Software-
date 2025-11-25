"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type KpiCardProps = {
  title: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  className?: string;
  icon?: React.ReactNode;
  subtitle?: string;
};

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  delta,
  trend,
  className,
  icon,
  subtitle,
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white/80">{title}</p>
            <div className="text-2xl font-semibold text-white">{value}</div>
            {subtitle ? (
              <p className="text-xs text-white/70">{subtitle}</p>
            ) : null}
          </div>
          {icon ? (
            <div className="h-10 w-10 rounded-lg bg-white/15 flex items-center justify-center text-white">
              {icon}
            </div>
          ) : null}
        </div>
        {delta ? (
          <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-xs text-white">
            {trend === "up" ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            <span>{delta}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default KpiCard;