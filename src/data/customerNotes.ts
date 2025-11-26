"use client";

import { supabase } from "@/integrations/supabase/client";

export type DbCustomerNote = {
  id: string;
  user_id: string | null;
  customer_id: string;
  content: string;
  created_at: string;
};

export type UICustomerNote = {
  id: string;
  content: string;
  createdAt: string;
};

const toUI = (n: DbCustomerNote): UICustomerNote => ({
  id: n.id,
  content: n.content,
  createdAt: n.created_at,
});

export async function listNotesForCustomer(customerId: string): Promise<UICustomerNote[]> {
  const { data, error } = await supabase
    .from("customer_notes")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as DbCustomerNote[]).map(toUI);
}

export async function addNote(userId: string, customerId: string, content: string): Promise<UICustomerNote> {
  const { data, error } = await supabase
    .from("customer_notes")
    .insert([{ user_id: userId, customer_id: customerId, content }])
    .select()
    .single();

  if (error) throw error;
  return toUI(data as DbCustomerNote);
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from("customer_notes").delete().eq("id", id);
  if (error) throw error;
}