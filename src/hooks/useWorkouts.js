import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
export function useWorkouts() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const { data: checkins = [] } = useQuery({
        queryKey: ["workout_checkins", user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("workout_checkins")
                .select("*")
                .eq("user_id", user.id)
                .order("logged_at", { ascending: false })
                .limit(30);
            if (error)
                throw error;
            return data;
        },
        enabled: !!user,
    });
    const addCheckin = useMutation({
        mutationFn: async ({ workout_type, duration_min, notes }) => {
            const today = new Date().toISOString().split("T")[0];
            const { error } = await supabase
                .from("workout_checkins")
                .insert({ user_id: user.id, workout_type, duration_min, notes: notes || "", logged_at: today });
            if (error)
                throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["workout_checkins"] }),
    });
    return { checkins, addCheckin };
}
