"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type TagChipsEditorProps = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const TagChipsEditor: React.FC<TagChipsEditorProps> = ({
  value,
  onChange,
  placeholder = "Add tag",
  disabled = false,
  className,
}) => {
  const [input, setInput] = React.useState("");

  const addTag = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    const exists = value.some((v) => v.toLowerCase() === t.toLowerCase());
    if (exists) return;
    onChange([...value, t]);
  };

  const addMany = (raw: string) => {
    const parts = raw
      .split(/[,\\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const lower = new Set(value.map((v) => v.toLowerCase()));
    const next = [...value];
    parts.forEach((p) => {
      const l = p.toLowerCase();
      if (!lower.has(l)) {
        next.push(p);
        lower.add(l);
      }
    });
    onChange(next);
  };

  const removeAt = (idx: number) => {
    const next = value.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) {
        addMany(input);
        setInput("");
      }
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      // quick remove last when input empty
      removeAt(value.length - 1);
    }
  };

  const onBlur = () => {
    if (disabled) return;
    if (input.trim()) {
      addMany(input);
      setInput("");
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    const text = e.clipboardData.getData("text");
    if (text && /[,\\n]/.test(text)) {
      e.preventDefault();
      addMany(text);
      setInput("");
    }
  };

  return (
    <div className={["flex w-full flex-wrap items-center gap-1", className].filter(Boolean).join(" ")}>
      {value.map((t, i) => (
        <Badge key={`${t}-${i}`} variant="secondary" className="pl-2 pr-1">
          <span className="mr-1">{t}</span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-5 w-5 p-0"
            aria-label={`Remove ${t}`}
            onClick={() => removeAt(i)}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        onPaste={onPaste}
        placeholder={placeholder}
        disabled={disabled}
        className="h-8 w-[160px] flex-1 min-w-[120px] border-none focus-visible:ring-0 px-0"
      />
    </div>
  );
};

export default TagChipsEditor;