import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription = null;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);

      const { data } = supabase.auth.onAuthStateChange((_event, curSession) => {
        const newUser = curSession?.user ?? null;
        setUser(newUser);
        setLoading(false);

        // Log login events to Supabase
        if (_event === "SIGNED_IN" && newUser) {
          logLoginEvent(newUser.id);
        }
      });
      subscription = data.subscription;
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signOut };
}

// Log login event to the login_history table
async function logLoginEvent(userId) {
  try {
    // Get approximate location from timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";

    await supabase.from("login_history").insert({
      user_id: userId,
      logged_at: new Date().toISOString(),
      location: timezone,
    });
  } catch (error) {
    // Silently fail — table may not exist yet
    console.debug("Login history logging skipped:", error.message);
  }
}
