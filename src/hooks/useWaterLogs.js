import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getLocalDate } from "@/lib/utils";

export function useWaterLogs(date) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const today = date || getLocalDate();
  const { data: waterLogs = [] } = useQuery({
    queryKey: ["water_logs", user?.id, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("water_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("logged_at", today)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  const totalWaterMl = waterLogs.reduce((s, w) => s + (w.amount_ml || 0), 0);
  const addWater = useMutation({
    mutationFn: async (amount_ml) => {
      const { error } = await supabase
        .from("water_logs")
        .insert({ user_id: user.id, amount_ml, logged_at: today });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["water_logs"] }),
  });
  const removeLastWater = useMutation({
    mutationFn: async () => {
      if (waterLogs.length === 0) return;
      const { error } = await supabase
        .from("water_logs")
        .delete()
        .eq("id", waterLogs[0].id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["water_logs"] }),
  });
  return { waterLogs, totalWaterMl, addWater, removeLastWater };
}
