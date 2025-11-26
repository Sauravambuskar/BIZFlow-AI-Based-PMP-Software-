"use client";

import { supabase } from "@/integrations/supabase/client";

export type DbCustomer = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  tags: string[];
  created_at: string;
};

export type UICustomer = {
  id: string;
  name: string;
  email: string;
  tags: string[];
  createdAt: string;
};

export type CustomerInput = {
  name: string;
  email: string;
  tags: string[];
};

const toUI = (c: DbCustomer): UICustomer => ({
  id: c.id,
  name: c.name,
  email: c.email,
  tags: c.tags ?? [],
  createdAt: c.created_at,
});

export async function listCustomers(userId: string): Promise<UICustomer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbCustomer[]).map(toUI);
}

export async function getCustomer(id: string): Promise<UICustomer> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return toUI(data as DbCustomer);
}

export async function addCustomer(userId: string, payload: CustomerInput): Promise<UICustomer> {
  const { data, error } = await supabase
    .from("customers")
    .insert([{ user_id: userId, ...payload }])
    .select()
    .single();
  if (error) throw error;
  return toUI(data as DbCustomer);
}

export async function updateCustomer(id: string, payload: Partial<CustomerInput>): Promise<UICustomer> {
  const { data, error } = await supabase
    .from("customers")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toUI(data as DbCustomer);
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteCustomers(ids: string[]): Promise<void> {
  const { error } = await supabase.from("customers").delete().in("id", ids);
  if (error) throw error;
}