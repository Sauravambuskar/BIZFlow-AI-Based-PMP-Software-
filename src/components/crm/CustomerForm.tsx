"use client";

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  tagsString: z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim()),
});

export type CustomerFormValues = z.infer<typeof schema>;

type Props = {
  defaultValues: {
    name: string;
    email: string;
    tags: string[];
  };
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (payload: { name: string; email: string; tags: string[] }) => void | Promise<void>;
};

const CustomerForm: React.FC<Props> = ({ defaultValues, submitting = false, submitLabel = "Save", onSubmit }) => {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues.name,
      email: defaultValues.email,
      tagsString: defaultValues.tags.join(", "),
    },
    mode: "onChange",
  });

  const handleSubmit = (values: CustomerFormValues) => {
    const tags =
      values.tagsString
        ?.split(",")
        .map((t) => t.trim())
        .filter(Boolean) ?? [];
    return onSubmit({ name: values.name.trim(), email: values.email.trim(), tags });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="hello@acme.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tagsString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input placeholder="vip, enterprise, west" {...field} />
              </FormControl>
              <FormDescription>Separate tags with commas.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CustomerForm;