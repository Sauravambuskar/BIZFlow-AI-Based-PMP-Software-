"use client";

import React from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4">
        <div className="w-full rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="mb-1 text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mb-4 text-sm text-muted-foreground">
            Use your email to sign in to BizFlow.
          </p>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "hsl(var(--primary))",
                    brandAccent: "hsl(var(--primary)/0.9)",
                  },
                },
              },
              className: {
                container: "space-y-3",
                input: "w-full rounded-md border px-3 py-2 text-sm",
                button: "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90",
                label: "text-sm font-medium",
              },
            }}
            theme="light"
          />
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to the Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;