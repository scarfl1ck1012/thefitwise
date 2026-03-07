import React, { useState } from "react";
import { motion } from "framer-motion";
import LeaderboardView from "../components/Community/LeaderboardView";
import FriendsView from "../components/Community/FriendsView";
import { Trophy, Users } from "lucide-react";

// Task 4: Mock Data Setup
const initialMockUsers = [
  {
    id: 1,
    name: "Alex Mercer",
    xp: 14500,
    level: 25,
    streak: 42,
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: 2,
    name: "Sarah Connor",
    xp: 12200,
    level: 21,
    streak: 15,
    avatar: "https://i.pravatar.cc/150?u=2",
  },
  {
    id: 3,
    name: "John Wick",
    xp: 11800,
    level: 20,
    streak: 8,
    avatar: "https://i.pravatar.cc/150?u=3",
  },
  {
    id: 4,
    name: "Ellen Ripley",
    xp: 9500,
    level: 16,
    streak: 5,
    avatar: "https://i.pravatar.cc/150?u=4",
  },
  {
    id: 5,
    name: "James Bond",
    xp: 8100,
    level: 14,
    streak: 2,
    avatar: "https://i.pravatar.cc/150?u=5",
  },
  {
    id: 6,
    name: "Lara Croft",
    xp: 7500,
    level: 12,
    streak: 1,
    avatar: "https://i.pravatar.cc/150?u=6",
  },
  {
    id: 7,
    name: "Bruce Wayne",
    xp: 6200,
    level: 10,
    streak: 0,
    avatar: "https://i.pravatar.cc/150?u=7",
  },
  {
    id: 8,
    name: "Clark Kent",
    xp: 5000,
    level: 8,
    streak: 0,
    avatar: "https://i.pravatar.cc/150?u=8",
  },
  {
    id: 99,
    name: "Test User",
    xp: 8200,
    level: 15,
    streak: 12,
    avatar: "https://i.pravatar.cc/150?u=99",
    isSelf: true,
  },
];

const initialFriendships = [
  { userId: 99, friendId: 2 },
  { userId: 2, friendId: 99 },
  { userId: 99, friendId: 4 },
  { userId: 4, friendId: 99 },
];

const initialFriendRequests = [
  { senderId: 5, receiverId: 99 },
  { senderId: 6, receiverId: 99 },
];

export default function CommunityPage() {
  const currentUser = initialMockUsers.find((u) => u.isSelf);
  const [activeTab, setActiveTab] = useState("leaderboard");

  // State from mock data
  const [users, setUsers] = useState(initialMockUsers);
  const [friendships, setFriendships] = useState(initialFriendships);
  const [requests, setRequests] = useState(initialFriendRequests);

  // Task 4: Mock handler
  const handleAcceptRequest = (senderId) => {
    // 1. Add mutual friendships (two-way relationships)
    setFriendships((prev) => [
      ...prev,
      { userId: currentUser.id, friendId: senderId },
      { userId: senderId, friendId: currentUser.id },
    ]);

    // 2. Remove the request
    setRequests((prev) =>
      prev.filter(
        (req) =>
          !(req.senderId === senderId && req.receiverId === currentUser.id),
      ),
    );
  };

  const handleDeclineRequest = (senderId) => {
    setRequests((prev) =>
      prev.filter(
        (req) =>
          !(req.senderId === senderId && req.receiverId === currentUser.id),
      ),
    );
  };

  const handleRemoveFriend = (friendId) => {
    setFriendships((prev) =>
      prev.filter(
        (f) =>
          !(f.userId === currentUser.id && f.friendId === friendId) &&
          !(f.userId === friendId && f.friendId === currentUser.id),
      ),
    );
  };

  const handleAddFriend = (targetId) => {
    // Only add if not already requested and not already friends
    const isAlreadyFriends = friendships.some(
      (f) => f.userId === currentUser.id && f.friendId === targetId,
    );
    const hasRequested = requests.some(
      (r) => r.senderId === currentUser.id && r.receiverId === targetId,
    );

    if (!isAlreadyFriends && !hasRequested) {
      setRequests((prev) => [
        ...prev,
        { senderId: currentUser.id, receiverId: targetId },
      ]);
    }
  };

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
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "leaderboard" ? (
            <LeaderboardView
              users={users}
              friendships={friendships}
              currentUser={currentUser}
            />
          ) : (
            <FriendsView
              users={users}
              friendships={friendships}
              requests={requests}
              currentUser={currentUser}
              onAccept={handleAcceptRequest}
              onDecline={handleDeclineRequest}
              onRemove={handleRemoveFriend}
              onAdd={handleAddFriend}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
