"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { showSuccess } from "@/utils/toast";

type TimerState = {
  running: boolean;
  startAt: number | null;
  elapsed: number; // in seconds
  day: string; // YYYY-MM-DD
};

const keyForDay = (day: string) => `bizflow_timer_${day}`;

const format = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};

const TimesheetTimer: React.FC = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [state, setState] = React.useState<TimerState>(() => {
    const saved = localStorage.getItem(keyForDay(today));
    return saved
      ? (JSON.parse(saved) as TimerState)
      : { running: false, startAt: null, elapsed: 0, day: today };
  });

  React.useEffect(() => {
    localStorage.setItem(keyForDay(today), JSON.stringify(state));
  }, [state, today]);

  React.useEffect(() => {
    if (!state.running) return;
    const id = setInterval(() => {
      setState((prev) => {
        if (!prev.running || prev.startAt == null) return prev;
        const delta = Math.floor((Date.now() - prev.startAt) / 1000);
        return { ...prev, elapsed: delta };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state.running]);

  const start = () => {
    if (state.running) return;
    setState({ running: true, startAt: Date.now(), elapsed: state.elapsed, day: today });
  };
  const stop = () => {
    if (!state.running) return;
    setState((prev) => ({
      running: false,
      startAt: null,
      elapsed: prev.elapsed,
      day: today,
    }));
  };
  const reset = () => setState({ running: false, startAt: null, elapsed: 0, day: today });
  const save = () => showSuccess(`Timesheet saved: ${format(state.elapsed)}`);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Tracker</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Today</div>
          <div className="text-2xl font-semibold">{format(state.elapsed)}</div>
        </div>
        <div className="flex gap-2">
          {!state.running ? (
            <Button onClick={start}>Start</Button>
          ) : (
            <Button variant="secondary" onClick={stop}>
              Stop
            </Button>
          )}
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
          <Button variant="ghost" onClick={save}>
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimesheetTimer;