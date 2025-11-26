"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

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
  const schema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        amount: z
          .coerce.number({ invalid_type_error: "Enter a valid amount" })
          .min(0, "Amount must be 0 or more"),
      }),
    []
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: initialName, amount: initialAmount ?? 0 },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (open) {
      form.reset({ name: initialName, amount: initialAmount ?? 0 });
    }
  }, [open, initialName, initialAmount, form]);

  const submitting = form.formState.isSubmitting || !form.formState.isValid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-3 py-2"
            onSubmit={form.handleSubmit((values) => onSave(values.name.trim(), values.amount))}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input autoFocus placeholder="Lead name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (USD)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" inputMode="decimal" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadEditorDialog;