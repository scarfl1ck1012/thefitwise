import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getLocalDate } from "@/lib/utils";

export function useUserStats() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: stats } = useQuery({
    queryKey: ["user_stats", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  const addXP = useMutation({
    mutationFn: async (amount) => {
      const currentXP = (stats?.xp || 0) + amount;
      const newLevel = Math.floor(currentXP / 500) + 1;
      const today = getLocalDate();
      const lastActive = stats?.last_active_date;
      const yesterday = getLocalDate(Date.now() - 86400000);
      let newStreak = stats?.current_streak || 0;
      if (lastActive !== today) {
        newStreak = lastActive === yesterday ? newStreak + 1 : 1;
      }
      const { error } = await supabase.from("user_stats").upsert(
        {
          user_id: user.id,
          xp: currentXP,
          level: newLevel,
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, stats?.longest_streak || 0),
          last_active_date: today,
        },
        { onConflict: "user_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_stats"] }),
  });
  const addBadge = useMutation({
    mutationFn: async (badge) => {
      const current = stats?.badges || [];
      if (current.includes(badge)) return;
      const { error } = await supabase
        .from("user_stats")
        .upsert(
          { user_id: user.id, badges: [...current, badge] },
          { onConflict: "user_id" },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_stats"] }),
  });
  return { stats, addXP, addBadge };
}
