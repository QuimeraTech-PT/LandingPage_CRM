import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    console.log("Admin beforeLoad checking auth...");
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log("No session found in admin, redirecting to /auth");
      throw redirect({
        to: "/auth",
        search: {
          redirect: location.pathname,
        },
      });
    }

    console.log("Session valid, checking role for user:", session.user.id);

    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: session.user.id,
      _role: "admin",
    });

    if (roleError) {
      console.error("Error checking role:", roleError);
      // If the function fails, we check the table directly as a fallback (if RLS allows)
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        console.log("User is not admin (fallback check)");
        throw redirect({ to: "/" });
      }
    } else if (!isAdmin) {
      console.log("User is not admin");
      throw redirect({ to: "/" });
    }

    console.log("User is admin, proceeding to dashboard");
  },
});
