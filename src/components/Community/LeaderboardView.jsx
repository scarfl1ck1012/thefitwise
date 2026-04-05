import React, { useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Crown, Medal } from "lucide-react";

export default function LeaderboardView({ users, friendships, currentUser }) {
  const [friendsOnly, setFriendsOnly] = React.useState(false);

  const rankedUsers = useMemo(() => {
    let pool = users;
    if (friendsOnly) {
      const friendIds = friendships
        .filter((f) => f.userId === currentUser.id)
        .map((f) => f.friendId);
      pool = users.filter(
        (u) => u.id === currentUser.id || friendIds.includes(u.id)
      );
    }
    return [...pool]
      .sort((a, b) => b.xp - a.xp)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));
  }, [users, friendships, currentUser, friendsOnly]);

  const top3 = rankedUsers.slice(0, 3);
  const rest = rankedUsers.slice(3);

  const currentUserRanked = rankedUsers.find((u) => u.id === currentUser.id);

  // Podium arrangement: 2nd, 1st, 3rd
  const getPodiumOrder = (users) => {
    if (users.length === 0) return [];
    if (users.length === 1) return [users[0]];
    if (users.length === 2) return [users[1], users[0]];
    return [users[1], users[0], users[2]];
  };

  const podiumUsers = getPodiumOrder(top3);

  const podiumHeights = { 1: "h-32", 2: "h-24", 3: "h-18" };
  const podiumColors = {
    1: "from-yellow-500/30 to-yellow-600/10 border-yellow-500/40",
    2: "from-slate-300/20 to-slate-400/10 border-slate-400/30",
    3: "from-amber-700/20 to-amber-800/10 border-amber-700/30",
  };
  const badgeColors = {
    1: "bg-yellow-500 text-black",
    2: "bg-slate-300 text-black",
    3: "bg-amber-700 text-white",
  };
  const ringColors = {
    1: "ring-yellow-400",
    2: "ring-slate-300",
    3: "ring-amber-600",
  };

  return (
    <div className="flex flex-col gap-6 h-full">
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

      {/* ─── PODIUM ─── */}
      <div className="flex justify-center items-end gap-3 md:gap-6 mt-4 pb-6 px-4">
        {podiumUsers.map((user) => {
          const isFirst = user.rank === 1;
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: user.rank * 0.12, type: "spring", stiffness: 120 }}
              className="flex flex-col items-center"
            >
              {/* Avatar + Crown */}
              <div className="relative mb-3">
                {isFirst && (
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="absolute -top-5 left-1/2 -translate-x-1/2 z-10"
                  >
                    <Crown className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                  </motion.div>
                )}
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={`${isFirst ? "w-20 h-20 md:w-24 md:h-24" : "w-16 h-16 md:w-20 md:h-20"} rounded-full object-cover ring-[3px] ring-offset-2 ring-offset-background ${ringColors[user.rank]} shadow-lg`}
                />
                <div
                  className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${badgeColors[user.rank]} shadow-md`}
                >
                  {user.rank}
                </div>
              </div>

              {/* Name + XP */}
              <div className="text-center mb-3">
                <div className={`${isFirst ? "text-sm" : "text-xs"} font-bold line-clamp-1`}>
                  {user.id === currentUser.id ? "You" : user.name}
                </div>
                <div className={`${isFirst ? "text-xs" : "text-[10px]"} text-primary font-bold mt-0.5`}>
                  {user.xp.toLocaleString()} XP
                </div>
              </div>

              {/* Podium Block */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: isFirst ? 128 : user.rank === 2 ? 96 : 72 }}
                transition={{ delay: user.rank * 0.15 + 0.2, duration: 0.5, ease: "easeOut" }}
                className={`w-20 md:w-28 rounded-t-2xl bg-gradient-to-t border-t border-l border-r ${podiumColors[user.rank]} relative overflow-hidden`}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                {/* Rank number large */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                  <span className={`text-3xl md:text-4xl font-black ${user.rank === 1 ? "text-yellow-500/20" : user.rank === 2 ? "text-slate-400/15" : "text-amber-700/15"}`}>
                    {user.rank}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── REST OF THE LIST ─── */}
      <div className="flex-1 overflow-y-auto pb-24 space-y-2 px-1">
        {rest.map((user, idx) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.03 }}
            className={`flex items-center justify-between p-4 md:p-5 rounded-2xl transition-all group ${
              user.id === currentUser.id
                ? "hidden"
                : "bg-surface-lowest/30 hover:bg-surface-lowest/50 border border-transparent hover:border-border/30"
            }`}
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
          </motion.div>
        ))}
      </div>

      {/* Pinned Current User */}
      {currentUserRanked && (
        <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-72 lg:max-w-6xl lg:mx-auto z-20">
          <div className="bg-surface-low border-[1px] border-primary/50 p-5 md:p-6 rounded-[2rem] flex items-center justify-between relative z-50 backdrop-blur-md">
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
