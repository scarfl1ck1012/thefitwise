import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getLocalDate } from "@/lib/utils";

export function useMeals(date) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const today = date || getLocalDate();
  const { data: meals = [], isLoading } = useQuery({
    queryKey: ["meals", user?.id, today],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("meal_logs")
          .select("*")
          .eq("user_id", user.id)
          .eq("logged_at", today)
          .order("created_at", { ascending: false });
        if (error) {
           console.error("Supabase meal_logs fetch error:", error);
           return [];
        }
        return data || [];
      } catch (err) {
        console.error("Unexpected error fetching meal_logs:", err);
        return [];
      }
    },
    enabled: !!user,
  });
  const { data: monthlyMeals = [] } = useQuery({
    queryKey: ["meals_monthly", user?.id, today.slice(0, 7)],
    queryFn: async () => {
      const month = today.slice(0, 7);
      try {
        const { data, error } = await supabase
          .from("meal_logs")
          .select("*")
          .eq("user_id", user.id)
          .gte("logged_at", `${month}-01`)
          .lte("logged_at", `${month}-31`)
          .order("logged_at", { ascending: false });
        if (error) {
           console.error("Supabase monthly meal_logs fetch error:", error);
           return [];
        }
        return data || [];
      } catch (err) {
        console.error("Unexpected error fetching monthly meals:", err);
        return [];
      }
    },
    enabled: !!user,
  });
  const addMeal = useMutation({
    mutationFn: async (meal) => {
      const { error } = await supabase
        .from("meal_logs")
        .insert({ ...meal, user_id: user.id, logged_at: today });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meals"] });
      qc.invalidateQueries({ queryKey: ["meals_monthly"] });
    },
  });
  const deleteMeal = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("meal_logs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meals"] });
      qc.invalidateQueries({ queryKey: ["meals_monthly"] });
    },
  });
  const totalCalories = meals.reduce((s, m) => s + m.calories * m.servings, 0);
  const totalProtein = meals.reduce(
    (s, m) => s + Number(m.protein) * m.servings,
    0,
  );
  const totalCarbs = meals.reduce(
    (s, m) => s + Number(m.carbs) * m.servings,
    0,
  );
  const totalFat = meals.reduce((s, m) => s + Number(m.fat) * m.servings, 0);
  const totalSodium = meals.reduce(
    (s, m) => s + Number(m.sodium || 0) * m.servings,
    0,
  );
  const totalPotassium = meals.reduce(
    (s, m) => s + Number(m.potassium || 0) * m.servings,
    0,
  );
  return {
    meals,
    monthlyMeals,
    isLoading,
    addMeal,
    deleteMeal,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalSodium,
    totalPotassium,
  };
}
