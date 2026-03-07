import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// Format helper to safely return users across the standard model shape you are using in CommunityPage
const formatUserNode = (dataRow) => ({
  id: dataRow.user_id,
  name: dataRow.full_name || "Unknown User",
  avatar:
    dataRow.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(dataRow.full_name || "U")}&background=random`,
  // Safely grab stat relations if available
  xp: dataRow.user_stats?.[0]?.xp || 0,
  level: dataRow.user_stats?.[0]?.level || 1,
  streak: dataRow.user_stats?.[0]?.current_streak || 0,
});

export function useCommunity() {
  const { user } = useAuth();
  const qc = useQueryClient();

  // 1. Fetch ALL valid users (for searching & global leaderboard)
  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["community_users"],
    queryFn: async () => {
      // Query profiles and joined user_stats table to get the raw combined payloads for everyone
      const { data, error } = await supabase.from("profiles").select(`
          user_id,
          full_name,
          avatar_url,
          user_stats (
             xp,
             level,
             current_streak
          )
        `);

      if (error) throw error;

      // Transform that shape into the `id`, `name`, `xp` mapping we use on the page
      return data.map(formatUserNode);
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

      if (error) throw error;
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

      if (error) throw error;
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
