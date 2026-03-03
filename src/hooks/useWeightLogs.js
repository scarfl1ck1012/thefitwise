import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
export function useWeightLogs() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const { data: logs = [] } = useQuery({
        queryKey: ["weight_logs", user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("weight_logs")
                .select("*")
                .eq("user_id", user.id)
                .order("logged_at", { ascending: true })
                .limit(90);
            if (error)
                throw error;
            return data;
        },
        enabled: !!user,
    });
    const addWeight = useMutation({
        mutationFn: async ({ weight_kg, logged_at }) => {
            const { error } = await supabase
                .from("weight_logs")
                .insert({ user_id: user.id, weight_kg, logged_at });
            if (error)
                throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["weight_logs"] }),
    });
    return { logs, addWeight };
}
