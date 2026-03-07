import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// We will format the user node inline during combination

export function useCommunity() {
  const { user } = useAuth();
  const qc = useQueryClient();

  // 1. Fetch ALL valid users (for searching & global leaderboard)
  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["community_users"],
    queryFn: async () => {
      // 1. Fetch profiles safely
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("*");
      if (pError) {
        console.error("Fetch profiles error:", pError);
        return [];
      }
      // 2. Fetch stats safely
      const { data: stats, error: sError } = await supabase
        .from("user_stats")
        .select("*");

      if (sError) console.error("Fetch stats error:", sError);

      // 3. Combine them without strict SQL constraint dependencies
      return (profiles || []).map((profile) => {
        const userStat =
          (stats || []).find((s) => s.user_id === profile.user_id) || {};
        return {
          id: profile.user_id,
          name: profile.full_name || "Unknown User",
          avatar:
            profile.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || "U")}&background=random`,
          xp: userStat.xp || 0,
          level: userStat.level || 1,
          streak: userStat.current_streak || 0,
        };
      });
    },
    enabled: !!user,
  });

  // 2. Fetch the current logged in user's friends
  const { data: friendships = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friendships", user?.id],
    queryFn: async () => {
      // Query the `friendships` connecting table to resolve to user IDs
      const { data, error } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Fetch friendships error:", error);
        return [];
      }
      return data || []; // e.g [{ userId: A, friendId: B }]
    },
    enabled: !!user,
  });

  // 3. Fetch Pending requests
  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["friend_requests", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friend_requests")
        .select("id, sender_id, receiver_id, status")
        .eq("status", "pending")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`); // Fetch both incoming and outgoing

      if (error) {
        console.error("Fetch friend requests error:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });

  // --- MUTATIONS ---

  const sendFriendRequest = useMutation({
    mutationFn: async (targetId) => {
      const { error } = await supabase.from("friend_requests").insert({
        sender_id: user.id,
        receiver_id: targetId,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friend_requests"] }),
  });

  const acceptFriendRequest = useMutation({
    mutationFn: async ({ requestId, senderId }) => {
      // 1. Delete the friend request
      const { error: reqError } = await supabase
        .from("friend_requests")
        .delete()
        .eq("id", requestId);

      if (reqError) throw reqError;

      // 2. Insert two-way friendships to simulate "Mutual connection"
      const { error: friendError } = await supabase.from("friendships").insert([
        { user_id: user.id, friend_id: senderId },
        { user_id: senderId, friend_id: user.id },
      ]);

      if (friendError) throw friendError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friend_requests"] });
      qc.invalidateQueries({ queryKey: ["friendships"] });
    },
  });

  const declineFriendRequest = useMutation({
    mutationFn: async (requestId) => {
      const { error } = await supabase
        .from("friend_requests")
        .delete()
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friend_requests"] }),
  });

  const removeFriend = useMutation({
    mutationFn: async (targetId) => {
      // Clean up both sides of the mutual friendship
      const { error } = await supabase
        .from("friendships")
        .delete()
        .or(
          `and(user_id.eq.${user.id},friend_id.eq.${targetId}),and(user_id.eq.${targetId},friend_id.eq.${user.id})`,
        );

      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friendships"] }),
  });

  return {
    users: allUsers,
    friendships,
    requests,
    isLoading: loadingUsers || loadingFriends || loadingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
  };
}
