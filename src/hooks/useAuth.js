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
        setUser(curSession?.user ?? null);
        setLoading(false);
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
