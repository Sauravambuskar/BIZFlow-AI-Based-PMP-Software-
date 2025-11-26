"use client";

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { showSuccess } from "@/utils/toast";
import { format } from "date-fns";
import { getCustomer, updateCustomer, deleteCustomer, UICustomer } from "@/data/customers";
import CustomerForm from "@/components/crm/CustomerForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CustomerNotes from "@/components/crm/CustomerNotes";

const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [customer, setCustomer] = React.useState<UICustomer | null>(null);

  React.useEffect(() => {
    if (!id) return;
    (async () => {
      const c = await getCustomer(id);
      setCustomer(c);
      setLoading(false);
    })();
  }, [id]);

  const onSave = async (payload: { name: string; email: string; tags: string[] }) => {
    if (!id) return;
    setSaving(true);
    const updated = await updateCustomer(id, payload);
    setCustomer(updated);
    setSaving(false);
    showSuccess("Customer updated");
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading customer…
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Customer not found
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Card>
        <CardHeader className="flex items-center justify-between space-y-0">
          <CardTitle className="text-xl">Customer Details</CardTitle>
          <div className="text-xs text-muted-foreground">
            Created {format(new Date(customer.createdAt), "MMM d, yyyy")}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CustomerForm
            defaultValues={{
              name: customer.name,
              email: customer.email,
              tags: customer.tags,
            }}
            submitting={saving}
            submitLabel={saving ? "Saving..." : "Save"}
            onSubmit={onSave}
          />
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Customer"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4">
        <CustomerNotes customerId={customer.id} />
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove this customer from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!id) return;
                setDeleting(true);
                await deleteCustomer(id);
                setDeleting(false);
                showSuccess("Customer deleted");
                navigate("/crm");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerDetails;