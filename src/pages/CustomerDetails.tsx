"use client";

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showSuccess } from "@/utils/toast";
import { format } from "date-fns";
import { getCustomer, updateCustomer, UICustomer } from "@/data/customers";

const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [customer, setCustomer] = React.useState<UICustomer | null>(null);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [tags, setTags] = React.useState("");

  React.useEffect(() => {
    if (!id) return;
    (async () => {
      const c = await getCustomer(id);
      setCustomer(c);
      setName(c.name);
      setEmail(c.email);
      setTags(c.tags.join(", "));
      setLoading(false);
    })();
  }, [id]);

  const onSave = async () => {
    if (!id) return;
    const updated = await updateCustomer(id, {
      name: name.trim(),
      email: email.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setCustomer(updated);
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
          <div className="grid gap-3">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Tags</label>
              <Input
                placeholder="tag1, tag2"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onSave}>Save</Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDetails;