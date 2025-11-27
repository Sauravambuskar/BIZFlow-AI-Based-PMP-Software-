"use client";

import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  availableTags: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  onClear?: () => void;
};

const TagFilter: React.FC<Props> = ({ availableTags, selected, onChange, onClear }) => {
  const toggleTag = (tag: string) => {
    const isSelected = selected.includes(tag);
    const next = isSelected ? selected.filter((t) => t !== tag) : [...selected, tag];
    onChange(next);
  };

  if (availableTags.length === 0) {
    return (
      <div className="rounded-lg border p-3 text-sm text-muted-foreground">
        No tags found in your customers yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Filter by Tags</div>
        {selected.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>
      <ToggleGroup type="multiple" value={selected} className="flex flex-wrap gap-2">
        {availableTags.map((tag) => (
          <ToggleGroupItem
            key={tag}
            value={tag}
            aria-label={`Toggle ${tag}`}
            onClick={(e) => {
              e.preventDefault();
              toggleTag(tag);
            }}
            className="px-0"
          >
            <Badge variant={selected.includes(tag) ? "default" : "secondary"} className="px-2">
              {tag}
            </Badge>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default TagFilter;