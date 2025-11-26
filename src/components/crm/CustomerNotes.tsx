"use client";

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { addNote, deleteNote, listNotesForCustomer, UICustomerNote } from "@/data/customerNotes";
import { useSupabaseSession } from "@/context/supabase-session";
import { showSuccess } from "@/utils/toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  content: z.string().min(1, "Please enter a note"),
});

type Values = z.infer<typeof schema>;

type Props = {
  customerId: string;
};

const CustomerNotes: React.FC<Props> = ({ customerId }) => {
  const { session } = useSupabaseSession();
  const [notes, setNotes] = React.useState<UICustomerNote[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { content: "" },
    mode: "onChange",
  });

  React.useEffect(() => {
    (async () => {
      const data = await listNotesForCustomer(customerId);
      setNotes(data);
      setLoading(false);
    })();
  }, [customerId]);

  // Realtime updates for notes scoped by customer
  React.useEffect(() => {
    const channel = supabase
      .channel(`realtime:customer_notes:${customerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_notes", filter: `customer_id=eq.${customerId}` },
        (payload) => {
          const type = (payload as any).eventType as "INSERT" | "UPDATE" | "DELETE";
          if (type === "INSERT") {
            const r: any = (payload as any).new;
            const n: UICustomerNote = { id: r.id, content: r.content, createdAt: r.created_at };
            setNotes((prev) => (prev.some((x) => x.id === n.id) ? prev : [n, ...prev]));
          } else if (type === "UPDATE") {
            const r: any = (payload as any).new;
            const n: UICustomerNote = { id: r.id, content: r.content, createdAt: r.created_at };
            setNotes((prev) => prev.map((x) => (x.id === n.id ? n : x)));
          } else if (type === "DELETE") {
            const r: any = (payload as any).old;
            const id = r.id as string;
            setNotes((prev) => prev.filter((x) => x.id !== id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerId]);

  const onSubmit = async (values: Values) => {
    if (!session?.user?.id) return;
    await addNote(session.user.id, customerId, values.content.trim());
    showSuccess("Note added");
    form.reset({ content: "" });
    // Realtime will prepend the note
  };

  const onDelete = async () => {
    if (!deleteId) return;
    await deleteNote(deleteId);
    showSuccess("Note deleted");
    setDeleteId(null);
    // Realtime will remove the note
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add a note</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write a quick note about this customer..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
                Add Note
              </Button>
            </div>
          </form>
        </Form>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading notes…</div>
        ) : notes.length === 0 ? (
          <div className="text-sm text-muted-foreground">No notes yet.</div>
        ) : (
          <ul className="space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{n.content}</p>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(n.id)} aria-label="Delete note">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {format(new Date(n.createdAt), "MMM d, yyyy h:mm a")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The note will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default CustomerNotes;