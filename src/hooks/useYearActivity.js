import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// Fetches all meal_log dates and workout_checkin dates for the year
// Returns Sets of date strings for fast lookup
export function useYearActivity(year = new Date().getFullYear()) {
  const { user } = useAuth();

  const { data: mealDates = new Set() } = useQuery({
    queryKey: ["meal_dates_year", user?.id, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meal_logs")
        .select("logged_at")
        .eq("user_id", user.id)
        .gte("logged_at", `${year}-01-01`)
        .lte("logged_at", `${year}-12-31`);
      if (error) return new Set();
      return new Set((data || []).map((d) => d.logged_at));
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: workoutDates = new Set() } = useQuery({
    queryKey: ["workout_dates_year", user?.id, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_checkins")
        .select("logged_at")
        .eq("user_id", user.id)
        .gte("logged_at", `${year}-01-01`)
        .lte("logged_at", `${year}-12-31`);
      if (error) return new Set();
      return new Set((data || []).map((d) => d.logged_at));
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  return { mealDates, workoutDates };
}
