"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CustomerForm from "@/components/crm/CustomerForm";
import { addCustomer, CustomerInput } from "@/data/customers";
import { useSupabaseSession } from "@/context/supabase-session";
import { showSuccess } from "@/utils/toast";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AddCustomerDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const { session } = useSupabaseSession();
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (payload: CustomerInput) => {
    if (!session?.user?.id) return;
    setSubmitting(true);
    await addCustomer(session.user.id, payload);
    setSubmitting(false);
    showSuccess("Customer added");
    onOpenChange(false);
    // CustomersTable will update via realtime
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
        </DialogHeader>
        <CustomerForm
          defaultValues={{ name: "", email: "", tags: [] }}
          submitting={submitting}
          submitLabel={submitting ? "Adding..." : "Add Customer"}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerDialog;