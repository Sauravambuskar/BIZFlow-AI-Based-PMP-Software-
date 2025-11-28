"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useSupabaseSession } from "@/context/supabase-session";
import { listSegments, deleteSegment, UISegment, SegmentRules } from "@/data/segments";
import { listCustomers, UICustomer } from "@/data/customers";
import { format } from "date-fns";
import { showSuccess } from "@/utils/toast";

const matches = (c: UICustomer, rules: SegmentRules): boolean => {
  // segment type
  if (rules.segment === "with_tags" && c.tags.length === 0) return false;
  if (rules.segment === "without_tags" && c.tags.length > 0) return false;

  // selected tags: require all
  if (rules.tags?.length) {
    const set = new Set(c.tags.map((t) => t.toLowerCase()));
    const hasAll = rules.tags.every((t) => set.has(t.toLowerCase()));
    if (!hasAll) return false;
  }

  // date range
  if (rules.dateFrom || rules.dateTo) {
    const created = new Date(c.createdAt).getTime();
    const from = rules.dateFrom ? new Date(rules.dateFrom).setHours(0, 0, 0, 0) : -Infinity;
    const to = rules.dateTo ? new Date(rules.dateTo).setHours(23, 59, 59, 999) : Infinity;
    if (!(created >= from && created <= to)) return false;
  }

  // text query
  const q = (rules.query || "").trim().toLowerCase();
  if (!q) return true;
  return (
    c.name.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q) ||
    c.tags.some((t) => t.toLowerCase().includes(q))
  );
};

const SegmentsManager: React.FC = () => {
  const { session, loading: sessionLoading } = useSupabaseSession();
  const [segments, setSegments] = React.useState<UISegment[]>([]);
  const [customers, setCustomers] = React.useState<UICustomer[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (sessionLoading) return;
    (async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      const [segs, custs] = await Promise.all([
        listSegments(session.user.id),
        listCustomers(session.user.id),
      ]);
      setSegments(segs);
      setCustomers(custs);
      setLoading(false);
    })();
  }, [sessionLoading, session?.user?.id]);

  const remove = async (id: string) => {
    await deleteSegment(id);
    setSegments((prev) => prev.filter((s) => s.id !== id));
    showSuccess("Segment deleted");
  };

  if (sessionLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Segments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            Loading segments…
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Segments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {segments.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            No saved segments yet. Use “Save Segment” from the Customers tab toolbar to create one from your current filters.
          </div>
        ) : (
          <ul className="space-y-2">
            {segments.map((s) => {
              const count = customers.filter((c) => matches(c, s.rules)).length;
              return (
                <li key={s.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Saved {format(new Date(s.createdAt), "MMM d, yyyy")} • Matches: {count}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => remove(s.id)}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default SegmentsManager;