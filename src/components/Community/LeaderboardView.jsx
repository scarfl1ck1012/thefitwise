import React, { useState, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function LeaderboardView({ users, friendships, currentUser }) {
  const [friendsOnly, setFriendsOnly] = useState(false);

  // Derive ranked users based on toggle
  const rankedUsers = useMemo(() => {
    let pool = users;
    if (friendsOnly) {
      // Include current user and their friends
      const friendIds = friendships
        .filter((f) => f.userId === currentUser.id)
        .map((f) => f.friendId);
      pool = users.filter(
        (u) => u.id === currentUser.id || friendIds.includes(u.id),
      );
    }

    // Sort by XP descending
    return [...pool]
      .sort((a, b) => b.xp - a.xp)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));
  }, [users, friendships, currentUser, friendsOnly]);

  const top3 = rankedUsers.slice(0, 3);
  const rest = rankedUsers.slice(3);

  // We want to pin the current user at the bottom if we are looking at the rest.
  // We can just always pin the current user regardless, or only if rank > 3.
  // The requirement says "Pin the logged-in user's row to the bottom".
  const currentUserRanked = rankedUsers.find((u) => u.id === currentUser.id);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "ring-yellow-400 text-yellow-400";
      case 2:
        return "ring-gray-300 text-gray-300";
      case 3:
        return "ring-amber-600 text-amber-600";
      default:
        return "";
    }
  };

  const getPodiumOrder = (users) => {
    if (users.length === 0) return [];
    if (users.length === 1) return [users[0]];
    if (users.length === 2) return [users[1], users[0]];
    // 2nd, 1st, 3rd layout
    return [users[1], users[0], users[2]];
  };

  const podiumUsers = getPodiumOrder(top3);

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex justify-end items-center gap-2 px-2">
        <Label
          htmlFor="friends-toggle"
          className="text-sm font-medium text-muted-foreground"
        >
          Global
        </Label>
        <Switch
          id="friends-toggle"
          checked={friendsOnly}
          onCheckedChange={setFriendsOnly}
        />
        <Label htmlFor="friends-toggle" className="text-sm font-medium">
          Friends
        </Label>
      </div>

      {/* Podium */}
      <div className="flex justify-center items-end gap-2 md:gap-6 mt-4 pb-4 border-b border-border/50">
        {podiumUsers.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: user.rank * 0.1 }}
            className={`flex flex-col items-center gap-2 w-28 md:w-32 ${user.rank === 1 ? "mb-8" : user.rank === 2 ? "mb-4" : "mb-0"}`}
          >
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-2 ring-offset-2 ring-offset-background ${getRankColor(user.rank)}`}
              />
              <div
                className={`absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold bg-background ring-1 ${getRankColor(user.rank)}`}
              >
                {user.rank}
              </div>
            </div>
            <div className="text-center mt-2">
              <div className="text-sm font-bold line-clamp-1">
                {user.id === currentUser.id ? "You" : user.name}
              </div>
              <div className="text-xs text-primary font-medium">
                {user.xp.toLocaleString()} XP
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* The List for 4th and below */}
      <div className="flex-1 overflow-y-auto pb-24 space-y-2 px-2">
        {rest.map((user) => (
          <div
            key={user.id}
            className={`flex items-center justify-between p-3 md:p-4 rounded-xl transition-colors ${user.id === currentUser.id ? "hidden" : "bg-card/40 hover:bg-card/80 border border-border/30"}`}
          >
            <div className="flex items-center gap-4">
              <div className="text-sm font-bold text-muted-foreground w-6 text-center">
                {user.rank}
              </div>
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-medium text-sm">{user.name}</div>
                <div className="text-xs text-muted-foreground">
                  Level {user.level}
                </div>
              </div>
            </div>
            <div className="text-sm font-bold text-primary">
              {user.xp.toLocaleString()} XP
            </div>
          </div>
        ))}
      </div>

      {/* Pinned Current User */}
      {currentUserRanked && (
        <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-72 lg:max-w-6xl lg:mx-auto z-20">
          <div className="bg-card border-2 border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)] p-4 rounded-xl flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="text-base font-bold text-primary w-6 text-center">
                {currentUserRanked.rank}
              </div>
              <img
                src={currentUserRanked.avatar}
                alt={currentUserRanked.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary"
              />
              <div>
                <div className="font-bold text-foreground">You</div>
                <div className="text-xs text-muted-foreground">
                  Level {currentUserRanked.level}
                </div>
              </div>
            </div>
            <div className="text-base font-bold text-primary">
              {currentUserRanked.xp.toLocaleString()} XP
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
