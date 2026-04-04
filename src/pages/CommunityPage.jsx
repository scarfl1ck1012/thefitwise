import React, { useState } from "react";
import { motion } from "framer-motion";
import LeaderboardView from "../components/Community/LeaderboardView";
import FriendsView from "../components/Community/FriendsView";
import { Trophy, Users, Loader2 } from "lucide-react";
import { useCommunity } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";

export default function CommunityPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("leaderboard");

  // Real Database Hooks
  const {
    users,
    friendships,
    requests,
    isLoading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
  } = useCommunity();

  // Make sure currentUser is formatted properly if they exist in the users array
  const currentUser = users.find((u) => u.id === user?.id) || {
    id: user?.id,
    name: "Loading...",
    xp: 0,
    level: 1,
    avatar: "",
  };

  const handleAcceptRequest = (senderId) => {
    // Find the actual request ID from the sender
    const request = requests.find(
      (r) => r.sender_id === senderId && r.receiver_id === user.id,
    );
    if (request) {
      acceptFriendRequest.mutate({ requestId: request.id, senderId });
    }
  };

  const handleDeclineRequest = (senderId) => {
    const request = requests.find(
      (r) => r.sender_id === senderId && r.receiver_id === user.id,
    );
    if (request) {
      declineFriendRequest.mutate(request.id);
    }
  };

  const handleRemoveFriend = (friendId) => {
    removeFriend.mutate(friendId);
  };

  const handleAddFriend = (targetId) => {
    sendFriendRequest.mutate(targetId);
  };

  // Formatting state hooks to match the components expectations:
  // Components expect friendships = [{ userId, friendId }]
  // and requests = [{ senderId, receiverId }]
  const formattedFriendships = friendships.map((f) => ({
    userId: f.user_id,
    friendId: f.friend_id,
  }));

  const formattedRequests = requests.map((r) => ({
    id: r.id,
    senderId: r.sender_id,
    receiverId: r.receiver_id,
    status: r.status,
  }));

  return (
    <div className="space-y-6 pb-24 lg:pb-8 relative min-h-screen">
      <div className="relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-info/5 rounded-full blur-3xl pointer-events-none" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground relative">
          Community Hub
        </h1>
        <p className="text-muted-foreground mt-2 relative">
          Connect, compete, and conquer your goals together.
        </p>
      </div>

      {/* Segmented Control */}
      <div className="flex bg-[#111] border border-border/30 p-1.5 rounded-full max-w-md mx-auto relative overflow-hidden">
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 relative z-10 ${
            activeTab === "leaderboard"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Trophy className="w-4 h-4" />
          Leaderboard
        </button>
        <button
          onClick={() => setActiveTab("friends")}
          className={`flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 relative z-10 ${
            activeTab === "friends"
              ? "text-info"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Friends
        </button>

        {/* Animated Background Pill */}
        <div
          className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full transition-all duration-300 ease-out z-0 border"
          style={{
            transform: activeTab === "friends" ? "translateX(100%)" : "translateX(0)",
            backgroundColor: activeTab === "friends" ? "rgba(59,130,246,0.15)" : "rgba(34,197,94,0.15)",
            borderColor: activeTab === "friends" ? "rgba(59,130,246,0.3)" : "rgba(34,197,94,0.3)",
            boxShadow: activeTab === "friends" ? "0 0 15px rgba(59,130,246,0.2)" : "0 0 15px rgba(34,197,94,0.2)",
          }}
        />
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="flex h-[40vh] flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse text-sm font-medium">
              Loading community...
            </p>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-[#111] border border-border/30 rounded-[2rem] p-5 lg:p-6 min-h-[500px]">
              {activeTab === "leaderboard" ? (
                <LeaderboardView
                  users={users}
                  friendships={formattedFriendships}
                  currentUser={currentUser}
                />
              ) : (
                <FriendsView
                  users={users}
                  friendships={formattedFriendships}
                  requests={formattedRequests}
                  currentUser={currentUser}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                  onRemove={handleRemoveFriend}
                  onAdd={handleAddFriend}
                />
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
