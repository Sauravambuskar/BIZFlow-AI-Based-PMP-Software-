"use client";

import { supabase } from "@/integrations/supabase/client";

export type Stage = "new" | "qualified" | "proposal" | "won" | "lost";

export type DbLead = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  stage: Stage;
  created_at: string;
};

export type UILead = {
  id: string;
  name: string;
  amount: number;
  stage: Stage;
  createdAt: string;
};

export type PipelineState = Record<Stage, UILead[]>;

export type LeadInput = {
  name: string;
  amount: number;
  stage?: Stage;
};

const toUI = (l: DbLead): UILead => ({
  id: l.id,
  name: l.name,
  amount: Number(l.amount ?? 0),
  stage: l.stage,
  createdAt: l.created_at,
});

export async function listLeads(userId: string): Promise<PipelineState> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const all = (data as DbLead[]).map(toUI);
  const initial: PipelineState = {
    new: [],
    qualified: [],
    proposal: [],
    won: [],
    lost: [],
  };
  return all.reduce((acc, l) => {
    acc[l.stage].push(l);
    return acc;
  }, initial);
}

export async function addLead(userId: string, input: LeadInput): Promise<UILead> {
  const payload = { user_id: userId, stage: input.stage ?? "new", name: input.name, amount: input.amount };
  const { data, error } = await supabase.from("leads").insert([payload]).select().single();
  if (error) throw error;
  return toUI(data as DbLead);
}

export async function updateLead(id: string, input: Partial<LeadInput> & { stage?: Stage }): Promise<UILead> {
  const { data, error } = await supabase.from("leads").update(input).eq("id", id).select().single();
  if (error) throw error;
  return toUI(data as DbLead);
}

export async function moveLead(id: string, toStage: Stage): Promise<UILead> {
  const { data, error } = await supabase.from("leads").update({ stage: toStage }).eq("id", id).select().single();
  if (error) throw error;
  return toUI(data as DbLead);
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
}

export async function clearLost(userId: string): Promise<void> {
  const { error } = await supabase.from("leads").delete().eq("user_id", userId).eq("stage", "lost");
  if (error) throw error;
}