import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
export function calculateCalories(profile) {
  if (
    !profile.weight_kg ||
    !profile.height_cm ||
    !profile.age ||
    !profile.gender
  )
    return 2000;
  // Mifflin-St Jeor
  let bmr;
  if (profile.gender === "male") {
    bmr =
      10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + 5;
  } else {
    bmr =
      10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age - 161;
  }
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const tdee =
    bmr * (multipliers[profile.activity_level || "moderate"] || 1.55);
  const goalAdjust = {
    lose: -500,
    maintain: 0,
    gain: 300,
    bulk: 500,
  };
  return Math.round(tdee + (goalAdjust[profile.goal || "maintain"] || 0));
}
export function useProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  const updateProfile = useMutation({
    mutationFn: async (updates) => {
      const calories = calculateCalories({ ...profile, ...updates });
      const { error } = await supabase
        .from("profiles")
        .upsert(
          { user_id: user.id, ...updates, daily_calories: calories },
          { onConflict: "user_id" },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
  const isProfileComplete = !!(
    profile?.full_name &&
    profile?.age &&
    profile?.gender &&
    profile?.height_cm &&
    profile?.weight_kg
  );
  return { profile, isLoading, updateProfile, isProfileComplete };
}
