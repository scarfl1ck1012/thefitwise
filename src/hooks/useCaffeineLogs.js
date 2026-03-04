import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getLocalDate } from "@/lib/utils";

export function useCaffeineLogs(date) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const today = date || getLocalDate();
  const { data: caffeineLogs = [] } = useQuery({
    queryKey: ["caffeine_logs", user?.id, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("caffeine_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("logged_at", today)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  const totalCaffeineMg = caffeineLogs.reduce(
    (s, c) => s + (c.amount_mg || 0),
    0,
  );
  const addCaffeine = useMutation({
    mutationFn: async ({ amount_mg, drink_type }) => {
      const { error } = await supabase
        .from("caffeine_logs")
        .insert({ user_id: user.id, amount_mg, drink_type, logged_at: today });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["caffeine_logs"] }),
  });
  const removeLastCaffeine = useMutation({
    mutationFn: async () => {
      if (caffeineLogs.length === 0) return;
      const { error } = await supabase
        .from("caffeine_logs")
        .delete()
        .eq("id", caffeineLogs[0].id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["caffeine_logs"] }),
  });
  return { caffeineLogs, totalCaffeineMg, addCaffeine, removeLastCaffeine };
}
