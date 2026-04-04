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
          {/* Dark gradient background with ambient glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="p-8 lg:p-10 flex flex-col items-center text-center relative">
            {/* TOTAL XP Label */}
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 mb-6">
              Total XP
            </span>
            
            {/* Circular Progress Ring */}
            <div className="relative w-48 h-48 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                {/* Background ring */}
                <circle
                  cx="100" cy="100" r="85"
                  fill="none"
                  stroke="hsl(var(--surface-highest))"
                  strokeWidth="6"
                  strokeOpacity="0.3"
                />
                {/* Progress ring */}
                <motion.circle
                  cx="100" cy="100" r="85"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 85}
                  initial={{ strokeDashoffset: 2 * Math.PI * 85 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 85 * (1 - xpInLevel / 500) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(34, 197, 94, 0.5))"
                  }}
                />
              </svg>
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.p 
                  className="text-6xl font-black text-foreground tracking-tight"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {xp}
                </motion.p>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  Level {level}
                </span>
              </div>
            </div>
            
            {/* XP to next level text */}
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              {xpToNext} XP to next level • {xpInLevel}/500 XP
            </p>
          </div>
        </div>
      </motion.div>

      {/* Streaks - Combined horizontal card like Stitch */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="glass rounded-[2rem] p-5 flex items-center justify-between relative overflow-hidden border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-info/5 pointer-events-none" />
          
          {/* Current Streak */}
          <div className="flex items-center gap-3 relative">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
              <Flame className={`h-5 w-5 ${streak > 0 ? "text-accent" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-black text-foreground leading-tight">
                {streak} <span className="text-xs font-bold text-muted-foreground">days</span>
              </p>
            </div>
          </div>

          {/* Center flame divider */}
          <motion.div
            animate={streak > 0 ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-accent/20 to-accent/5 flex items-center justify-center border border-accent/20 shadow-[0_0_20px_rgba(251,146,60,0.3)] relative"
          >
            <Flame className="h-6 w-6 text-accent drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]" />
          </motion.div>

          {/* Best Streak */}
          <div className="flex items-center gap-3 relative text-right">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1 justify-end">
                <Target className="h-3 w-3 text-info" /> Best Streak
              </p>
              <p className="text-2xl font-black text-foreground leading-tight">
                {longestStreak} <span className="text-xs font-bold text-muted-foreground">days</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

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
          <div className="grid grid-cols-1 gap-2">
            {[
              { action: "Complete any Workout Session", xp: "+50 XP", icon: "🏋️" },
              { action: "Log Daily Meals", xp: "+30 XP", icon: "🍽️" },
              { action: "Track 2L Water Intake", xp: "+10 XP", icon: "💧" },
              { action: "Hit Daily Step Goal (10k)", xp: "+30 XP", icon: "🏃" },
            ].map((item) => (
              <div
                key={item.action}
                className="flex items-center justify-between p-4 rounded-xl bg-surface-lowest/50 border border-white/5 hover:bg-surface-highest/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg opacity-80 group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="text-[13px] font-bold text-foreground">{item.action}</span>
                </div>
                <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
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
