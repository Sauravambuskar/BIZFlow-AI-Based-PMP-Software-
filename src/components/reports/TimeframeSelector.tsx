"use client";

import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Props = {
  value: 3 | 6 | 12;
  onChange: (v: 3 | 6 | 12) => void;
};

const TimeframeSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <ToggleGroup
      type="single"
      value={String(value)}
      onValueChange={(v) => {
        if (!v) return;
        const n = Number(v) as 3 | 6 | 12;
        onChange(n);
      }}
      className="flex"
    >
      <ToggleGroupItem value="3" aria-label="Last 3 months" className="px-3">
        3M
      </ToggleGroupItem>
      <ToggleGroupItem value="6" aria-label="Last 6 months" className="px-3">
        6M
      </ToggleGroupItem>
      <ToggleGroupItem value="12" aria-label="Last 12 months" className="px-3">
        12M
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default TimeframeSelector;