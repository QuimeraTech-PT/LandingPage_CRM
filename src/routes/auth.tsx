import { createFileRoute, redirect, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn, ShieldCheck, Chrome, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/auth")({
  beforeLoad: async ({ search }) => {
    // Validar token secreto
    const query = search as { secret?: string };
    const secretKey = import.meta.env.VITE_AUTH_SECRET_KEY || "";

    if (!secretKey || query.secret !== secretKey) {
      throw redirect({ to: "/" });
    }

    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({ to: "/admin" });
    }
  },
  validateSearch: (search: Record<string, unknown>): { secret?: string } => {
    return typeof search.secret === "string" ? { secret: search.secret } : {};
  },
  component: AuthPage,
});

function AuthPage() {
  const [loading, setLoading] = useState(false);
  const isDev = import.meta.env.DEV;
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }

    return "Erro desconhecido";
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      toast.error("Erro ao entrar com Google: " + getErrorMessage(error));
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      // Impersonate a test user in DEV
      // First try to sign in with a default dev account if it exists,
      // otherwise we just use a mock successful login flow for UI testing
      // For real functional dev, we need a user in the auth table.

      const testEmail = "dev@quimeratech.pt";
      const testPass = "quimeradev123";

      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPass,
      });

      if (error) {
        // If sign in fails (likely user doesn't exist), try to sign up
        const { error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPass,
        });

        if (signUpError) throw signUpError;

        // With auto-confirm enabled, sign up returns a session
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPass,
        });
        if (retryError) throw retryError;
      }

      toast.success("Entrou como Developer");
      navigate({ to: "/admin" });
    } catch (error: unknown) {
      toast.error("Erro no login de developer: " + getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <Card className="border-white/10 bg-card/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">CRM Access</CardTitle>
            <CardDescription>
              Inicie sessão para gerir os seus leads, projetos e finanças.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full h-12 gap-3 text-base font-semibold transition-all hover:scale-[1.02]"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <Chrome className="h-5 w-5" />
              Entrar com Google
            </Button>

            {isDev && (
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ambiente de Desenvolvimento
                  </span>
                </div>
              </div>
            )}

            {isDev && (
              <Button
                variant="outline"
                className="w-full h-12 gap-3 border-primary/20 hover:bg-primary/5 text-primary"
                onClick={handleDevLogin}
                disabled={loading}
              >
                <ShieldCheck className="h-5 w-5" />
                Impersonar Developer
              </Button>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-white/5 pt-6">
            <p className="text-xs text-muted-foreground">
              Apenas pessoal autorizado da QuimeraTech.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
