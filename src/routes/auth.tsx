import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrome, Loader2, Mail, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/auth')({
  component: AuthPage,
});

function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const search = useSearch({ from: '/auth' }) as { redirect?: string };

  useEffect(() => {
    // Check if we already have a session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("Session found, redirecting to admin");
        navigate({ to: search.redirect || '/admin', replace: true });
      }
    };
    checkSession();

    // Use a listener that DOES NOT immediately redirect to allow the form to exist
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event, !!session);
      if (session && event === 'SIGNED_IN') {
        navigate({ to: search.redirect || '/admin', replace: true });
      }
    });

    return () => subscription.unsubscribe();
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Sessão iniciada com sucesso!');
      navigate({ to: search.redirect || '/admin' });
    } catch (error: any) {
      toast.error('Erro no login: ' + error.message);
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
        <CardContent className="flex flex-col gap-6">
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou com e-mail</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@quimeratech.com" 
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
            </Button>
          </form>
          
          <div className="rounded-lg bg-primary/5 p-3 border border-primary/20">
            <p className="text-[10px] text-primary/70 font-mono">
              CREDENCIAIS DE TESTE:<br/>
              User: admin@quimeratech.com<br/>
              Pass: quimera123
            </p>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Apenas utilizadores autorizados têm acesso a esta área.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
