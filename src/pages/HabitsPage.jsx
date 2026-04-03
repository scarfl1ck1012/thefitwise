import { useUserStats } from "@/hooks/useUserStats";
import { useWorkouts } from "@/hooks/useWorkouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Zap, Flame, Star, Target, Award } from "lucide-react";
const BADGES = [
  {
    name: "First Steps",
    icon: "🏃",
    description: "Log your first workout",
    condition: (xp, streak, workouts) => workouts >= 1,
  },
  {
    name: "Meal Tracker",
    icon: "🍽️",
    description: "Log 10 meals",
    condition: (xp) => xp >= 150,
  },
  {
    name: "Consistency King",
    icon: "👑",
    description: "3-day streak",
    condition: (_, streak) => streak >= 3,
  },
  {
    name: "Iron Will",
    icon: "💪",
    description: "7-day streak",
    condition: (_, streak) => streak >= 7,
  },
  {
    name: "Century Club",
    icon: "💯",
    description: "Reach 1000 XP",
    condition: (xp) => xp >= 1000,
  },
  {
    name: "Fitness Pro",
    icon: "🏆",
    description: "Reach Level 5",
    condition: (xp) => xp >= 2500,
  },
  {
    name: "Workout Warrior",
    icon: "⚔️",
    description: "Complete 10 workouts",
    condition: (xp, streak, workouts) => workouts >= 10,
  },
  {
    name: "Health Master",
    icon: "🌟",
    description: "Reach Level 10",
    condition: (xp) => xp >= 5000,
  },
];
export default function HabitsPage() {
  const { stats } = useUserStats();
  const { checkins } = useWorkouts();
  const xp = stats?.xp || 0;
  const level = stats?.level || 1;
  const streak = stats?.current_streak || 0;
  const longestStreak = stats?.longest_streak || 0;
  const earnedBadges = stats?.badges || [];
  const xpInLevel = xp % 500;
  const xpToNext = 500 - xpInLevel;
  const allBadges = BADGES.map((b) => ({
    ...b,
    earned:
      earnedBadges.includes(b.name) ||
      b.condition(xp, streak, checkins?.length || 0),
  }));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Habits & XP</h1>

      {/* XP & Level */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="glass rounded-[2rem] overflow-hidden relative border border-white/5 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
              <div className="flex-1 flex flex-col md:items-start items-center text-center md:text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  Total Experience
                </span>
                <p className="text-6xl font-black text-foreground drop-shadow-xl tracking-tight mb-1">
                  {xp} <span className="text-lg text-muted-foreground font-medium uppercase tracking-widest">XP</span>
                </p>
                <div className="mt-6 w-full max-w-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-bold text-foreground uppercase tracking-widest">
                      Level {level}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      {xpInLevel}/500 XP
                    </span>
                  </div>
                  <div className="h-3 w-full bg-surface-highest/50 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(xpInLevel / 500) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest text-right mt-2">
                    {xpToNext} XP To Next Level
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 rounded-[2rem] bg-gradient-to-tr from-primary/30 to-primary/5 flex items-center justify-center border border-primary/20 shadow-[0_0_40px_rgba(34,197,94,0.2)] backdrop-blur-xl shrink-0"
              >
                <Zap className="h-16 w-16 text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="glass rounded-[2rem] p-6 text-center h-full flex flex-col justify-center items-center relative overflow-hidden group hover:border-accent/30 transition-all hover:shadow-[0_10px_40px_rgba(251,146,60,0.15)]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
            <motion.div
              animate={streak > 0 ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent/20 to-transparent flex items-center justify-center border border-accent/20 mb-4 shadow-[0_0_20px_rgba(251,146,60,0.2)]"
            >
              <Flame
                className={`h-8 w-8 ${streak > 0 ? "text-accent drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]" : "text-muted-foreground"}`}
              />
            </motion.div>
            <p className="text-4xl font-black text-foreground mb-1">{streak}</p>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Current Streak</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="glass rounded-[2rem] p-6 text-center h-full flex flex-col justify-center items-center relative overflow-hidden group hover:border-info/30 transition-all hover:shadow-[0_10px_40px_rgba(59,130,246,0.15)]">
            <div className="absolute top-0 left-0 w-24 h-24 bg-info/10 rounded-full blur-2xl pointer-events-none" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-info/20 to-transparent flex items-center justify-center border border-info/20 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Target className="h-8 w-8 text-info drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            </div>
            <p className="text-4xl font-black text-foreground mb-1">{longestStreak}</p>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Best Streak</p>
          </div>
        </motion.div>
      </div>

      {/* Badges */}
      <div className="glass rounded-[2rem] p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-widest font-bold text-foreground flex items-center gap-2">
            <Award className="h-4 w-4 text-accent" /> Achievement Badges
          </h2>
          <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
            {allBadges.filter(b => b.earned).length} / {allBadges.length}
          </span>
        </div>
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {allBadges.map((badge, i) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`text-center p-4 rounded-2xl transition-all border relative overflow-hidden group ${
                  badge.earned
                    ? "bg-surface-highest/40 border-accent/20 shadow-[0_8px_30px_rgba(251,146,60,0.1)] hover:border-accent/40"
                    : "bg-surface-lowest/50 border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-80"
                }`}
              >
                {badge.earned && (
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/10 rounded-full blur-xl pointer-events-none group-hover:bg-accent/20 transition-colors" />
                )}
                <motion.span
                  className="text-4xl block mb-3 drop-shadow-xl"
                  animate={badge.earned ? { y: [0, -5, 0], scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                >
                  {badge.icon}
                </motion.span>
                <p className="text-[13px] font-bold text-foreground uppercase tracking-wide">
                  {badge.name}
                </p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1 bg-surface-lowest/80 py-1 px-2 rounded-lg inline-block border border-white/5">
                  {badge.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How XP Works */}
      <div className="glass rounded-[2rem] p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-sm uppercase tracking-widest font-bold text-foreground flex items-center gap-2">
            <Star className="h-4 w-4 text-warning" /> How to Earn XP
          </h2>
        </div>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { action: "Log a Meal", xp: "+10 XP", icon: "🍽️" },
              { action: "AI Recipe Analysis", xp: "+15 XP per item", icon: "✨" },
              { action: "Log Weight", xp: "+15 XP", icon: "⚖️" },
              { action: "Complete Workout", xp: "+50 XP", icon: "🏋️" },
              { action: "Daily Challenge", xp: "+20-50 XP", icon: "🎯" },
            ].map((item) => (
              <div
                key={item.action}
                className="flex items-center justify-between p-4 rounded-xl bg-surface-lowest/50 border border-white/5 hover:bg-surface-highest/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg opacity-80 group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="text-[13px] font-bold text-foreground uppercase tracking-wide">{item.action}</span>
                </div>
                <span className="text-xs font-black text-warning bg-warning/10 px-3 py-1 rounded-lg border border-warning/20">
                  {item.xp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
