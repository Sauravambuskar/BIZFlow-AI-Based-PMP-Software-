"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

type Ctx = {
  session: Session | null;
  loading: boolean;
};

const SupabaseSessionContext = React.createContext<Ctx | undefined>(undefined);

export const SupabaseSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (event === "INITIAL_SESSION") {
        setLoading(false);
        if (!sess) navigate("/login", { replace: true });
      } else if (event === "SIGNED_IN") {
        navigate("/", { replace: true });
      } else if (event === "SIGNED_OUT") {
        navigate("/login", { replace: true });
      } else if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        // keep session updated
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [navigate]);

  const value: Ctx = React.useMemo(() => ({ session, loading }), [session, loading]);

  return (
    <SupabaseSessionContext.Provider value={value}>
      {children}
    </SupabaseSessionContext.Provider>
  );
};

export const useSupabaseSession = () => {
  const ctx = React.useContext(SupabaseSessionContext);
  if (!ctx) throw new Error("useSupabaseSession must be used within SupabaseSessionProvider");
  return ctx;
};