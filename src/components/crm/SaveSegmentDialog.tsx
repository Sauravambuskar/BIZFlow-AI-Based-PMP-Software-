"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DateRange } from "react-day-picker";
import { useSupabaseSession } from "@/context/supabase-session";
import { addSegment, SegmentRules } from "@/data/segments";
import { showSuccess } from "@/utils/toast";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: {
    query: string;
    selectedTags: string[];
    segment: "all" | "with_tags" | "without_tags";
    dateRange?: DateRange | undefined;
  };
};

const SaveSegmentDialog: React.FC<Props> = ({ open, onOpenChange, snapshot }) => {
  const { session } = useSupabaseSession();
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) setName("");
  }, [open]);

  const onSave = async () => {
    if (!session?.user?.id || !name.trim()) return;
    setSaving(true);
    const rules: SegmentRules = {
      query: snapshot.query,
      tags: snapshot.selectedTags,
      segment: snapshot.segment,
      dateFrom: snapshot.dateRange?.from ? new Date(snapshot.dateRange.from).toISOString() : null,
      dateTo: snapshot.dateRange?.to ? new Date(snapshot.dateRange.to).toISOString() : null,
    };
    await addSegment(session.user.id, name.trim(), rules);
    setSaving(false);
    showSuccess("Segment saved");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Segment</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Segment name (e.g., 'SaaS customers, last 90 days')"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving || !name.trim()}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveSegmentDialog;