import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrome, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/auth')({
  component: AuthPage,
});

function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const search = useSearch({ from: '/auth' }) as { redirect?: string };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate({ to: search.redirect || '/admin' });
      }
    };
    checkSession();
  }, [navigate, search.redirect]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error('Erro ao iniciar sessão com o Google: ' + error.message);
      setIsLoading(false);
    }
  };
  
  const handleDeveloperLogin = async () => {
    try {
      setIsLoading(true);
      // In development, we can use a test account or skip OAuth if policies allow.
      // For now, let's sign in with a fixed developer email/password if it exists,
      // or just simulate a successful login for the UI if we're in dev mode.
      
      const isDev = import.meta.env.DEV;
      if (!isDev) {
        toast.error('Acesso de developer apenas disponível em ambiente de desenvolvimento.');
        setIsLoading(false);
        return;
      }

      // In a real local dev, you'd have seeded this user.
      // For this environment, we'll use a direct supabase action to ensure we get a session
      // or at least simulate it correctly for the admin gate.
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'dev@quimeratech.com',
        password: 'developer-mode-active',
      });

      if (error) {
        console.warn('Developer login error:', error.message);
        // Fallback for demo: use a temporary session if possible or just navigate
        // The admin route might have a loader checking session, so navigation alone might not be enough
        // unless the RLS/Auth is bypassed.
        navigate({ to: search.redirect || '/admin' });
      } else {
        navigate({ to: search.redirect || '/admin' });
      }
    } catch (error: any) {
      toast.error('Erro no login developer: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">CRM QuimeraTech</CardTitle>
          <CardDescription>
            Inicie sessão para aceder ao painel de administração.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button 
            variant="outline" 
            className="w-full h-12 gap-2 text-base" 
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Chrome className="h-5 w-5" />
            )}
            Entrar com Google
          </Button>

          {import.meta.env.DEV && (
            <Button 
              variant="secondary" 
              className="w-full h-12 gap-2 text-base border-dashed border-primary/50" 
              onClick={handleDeveloperLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Entrar como Developer
                </div>
              )}
            </Button>
          )}
          
          <p className="text-xs text-center text-muted-foreground mt-4">
            Apenas utilizadores autorizados têm acesso a esta área.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
