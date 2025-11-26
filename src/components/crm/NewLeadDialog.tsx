"use client";

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addLead } from "@/data/leads";
import { useSupabaseSession } from "@/context/supabase-session";
import { showSuccess } from "@/utils/toast";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  amount: z.coerce.number({ invalid_type_error: "Enter a valid amount" }).min(0, "Amount must be 0 or more"),
  stage: z.enum(["new", "qualified", "proposal", "won", "lost"]),
});

type Values = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const NewLeadDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const { session } = useSupabaseSession();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", amount: 0, stage: "new" },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (open) {
      form.reset({ name: "", amount: 0, stage: "new" });
    }
  }, [open, form]);

  const onSubmit = async (values: Values) => {
    if (!session?.user?.id) return;
    await addLead(session.user.id, {
      name: values.name.trim(),
      amount: values.amount,
      stage: values.stage,
    });
    showSuccess("Lead added");
    onOpenChange(false);
    // LeadsPipeline will update via realtime
  };

  const submitting = form.formState.isSubmitting || !form.formState.isValid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Lead</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-3 pt-1" onSubmit={form.handleSubmit(onSubmit)}>
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
            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                Create Lead
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewLeadDialog;