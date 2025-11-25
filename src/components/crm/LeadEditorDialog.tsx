"use client";

import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type LeadEditorDialogProps = {
  open: boolean;
  initialName: string;
  initialAmount: number;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, amount: number) => void;
};

const LeadEditorDialog: React.FC<LeadEditorDialogProps> = ({
  open,
  initialName,
  initialAmount,
  onOpenChange,
  onSave,
}) => {
  const [name, setName] = React.useState(initialName);
  const [amount, setAmount] = React.useState<string>(String(initialAmount || ""));

  React.useEffect(() => {
    if (open) {
      setName(initialName);
      setAmount(String(initialAmount || ""));
    }
  }, [open, initialName, initialAmount]);

  const canSave = name.trim().length > 0 && !Number.isNaN(Number(amount));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input
            autoFocus
            placeholder="Lead name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Amount (USD)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSave}
            onClick={() => onSave(name.trim(), Number(amount))}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadEditorDialog;