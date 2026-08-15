import { createFileRoute, redirect } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw redirect({
        to: '/auth',
        search: {
          redirect: window.location.pathname,
        },
      });
    }

    // Check admin role
    const { data: isAdmin, error } = await supabase.rpc('has_role', {
      _user_id: session.user.id,
      _role: 'admin'
    });

    if (error || !isAdmin) {
      // In a real app, we might redirect to a "Forbidden" page or back home
      console.error("User is not an admin", error);
      throw redirect({
        to: '/',
      });
    }
  },
});
