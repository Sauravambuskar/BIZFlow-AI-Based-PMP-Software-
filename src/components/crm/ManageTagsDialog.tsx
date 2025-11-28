"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { showSuccess } from "@/utils/toast";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableTags: string[];
  onRename: (fromTag: string, toTag: string) => Promise<void> | void;
  onDelete: (tag: string) => Promise<void> | void;
};

const ManageTagsDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  availableTags,
  onRename,
  onDelete,
}) => {
  const [renameFrom, setRenameFrom] = React.useState<string>("");
  const [renameTo, setRenameTo] = React.useState<string>("");
  const [deleteTag, setDeleteTag] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) {
      setRenameFrom("");
      setRenameTo("");
      setDeleteTag("");
    }
  }, [open]);

  const handleRename = async () => {
    const from = renameFrom.trim();
    const to = renameTo.trim();
    if (!from || !to || from.toLowerCase() === to.toLowerCase()) return;
    await onRename(from, to);
    showSuccess(`Renamed tag "${from}" to "${to}"`);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    const tag = deleteTag.trim();
    if (!tag) return;
    await onDelete(tag);
    showSuccess(`Deleted tag "${tag}" from all customers`);
    onOpenChange(false);
  };

  const hasTags = availableTags.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="text-sm font-medium">Rename Tag</div>
            <div className="grid gap-2 sm:grid-cols-[200px,1fr,auto]">
              <Select value={renameFrom || "none"} onValueChange={(v) => setRenameFrom(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder={hasTags ? "Select tag" : "No tags"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select a tag</SelectItem>
                  {availableTags.map((t) => (
                    <SelectItem key={`rename-${t}`} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="New tag name"
                value={renameTo}
                onChange={(e) => setRenameTo(e.target.value)}
              />
              <Button
                onClick={handleRename}
                disabled={!renameFrom || !renameTo || renameFrom.trim().toLowerCase() === renameTo.trim().toLowerCase()}
              >
                Rename
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Renaming updates all customers with the selected tag. If the new name exists on a customer, duplicates will be merged.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Delete Tag</div>
            <div className="grid gap-2 sm:grid-cols-[1fr,auto]">
              <Select value={deleteTag || "none"} onValueChange={(v) => setDeleteTag(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder={hasTags ? "Select tag to delete" : "No tags"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select a tag</SelectItem>
                  {availableTags.map((t) => (
                    <SelectItem key={`delete-${t}`} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="destructive" onClick={handleDelete} disabled={!deleteTag}>
                Delete Tag
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Deleting removes the tag from all customers. This cannot be undone.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageTagsDialog;