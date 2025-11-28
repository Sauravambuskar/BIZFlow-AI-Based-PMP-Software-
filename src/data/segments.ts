"use client";

import { supabase } from "@/integrations/supabase/client";

export type SegmentRules = {
  query: string;
  tags: string[];
  segment: "all" | "with_tags" | "without_tags";
  dateFrom?: string | null;
  dateTo?: string | null;
};

export type DbSegment = {
  id: string;
  user_id: string;
  name: string;
  rules: SegmentRules;
  created_at: string;
};

export type UISegment = {
  id: string;
  name: string;
  rules: SegmentRules;
  createdAt: string;
};

const toUI = (s: DbSegment): UISegment => ({
  id: s.id,
  name: s.name,
  rules: s.rules,
  createdAt: s.created_at,
});

export async function listSegments(userId: string): Promise<UISegment[]> {
  const { data, error } = await supabase
    .from("segments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbSegment[]).map(toUI);
}

export async function addSegment(userId: string, name: string, rules: SegmentRules): Promise<UISegment> {
  const { data, error } = await supabase
    .from("segments")
    .insert([{ user_id: userId, name, rules }])
    .select()
    .single();
  if (error) throw error;
  return toUI(data as DbSegment);
}

export async function updateSegmentName(id: string, name: string): Promise<UISegment> {
  const { data, error } = await supabase
    .from("segments")
    .update({ name })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toUI(data as DbSegment);
}

export async function deleteSegment(id: string): Promise<void> {
  const { error } = await supabase.from("segments").delete().eq("id", id);
  if (error) throw error;
}