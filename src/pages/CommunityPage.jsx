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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Community Hub
        </h1>
        <p className="text-muted-foreground mt-2">
          Connect, compete, and conquer your goals together.
        </p>
      </div>

      {/* Segmented Control */}
      <div className="flex bg-card/50 p-1 rounded-full border border-border shadow-sm max-w-md mx-auto relative">
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-300 relative z-10 ${
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
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-300 relative z-10 ${
            activeTab === "friends"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Friends
        </button>

        {/* Animated Background Pill */}
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#1e1e1e] rounded-full transition-transform duration-300 ease-out z-0 shadow-sm border border-border/50"
          style={{
            transform:
              activeTab === "friends" ? "translateX(100%)" : "translateX(0)",
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
          </motion.div>
        )}
      </div>
    </div>
  );
}
