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
        <Card className="shadow-elevated overflow-hidden">
          <div className="gradient-primary p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm">Total XP</p>
                <p className="text-4xl font-bold text-primary-foreground">
                  {xp}
                </p>
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-primary-foreground/20 p-4 rounded-2xl"
              >
                <Zap className="h-8 w-8 text-primary-foreground" />
              </motion.div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Level {level}
              </span>
              <span className="text-sm text-muted-foreground">
                {xpInLevel}/500 XP
              </span>
            </div>
            <Progress value={(xpInLevel / 500) * 100} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {xpToNext} XP to Level {level + 1}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <motion.div
                animate={streak > 0 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Flame
                  className={`h-8 w-8 mx-auto mb-2 ${streak > 0 ? "text-accent" : "text-muted-foreground"}`}
                />
              </motion.div>
              <p className="text-3xl font-bold text-foreground">{streak}</p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-info" />
              <p className="text-3xl font-bold text-foreground">
                {longestStreak}
              </p>
              <p className="text-sm text-muted-foreground">Best Streak</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Badges */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-accent" /> Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {allBadges.map((badge, i) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`text-center p-3 rounded-xl border transition-all ${
                  badge.earned
                    ? "bg-primary/5 border-primary/20 shadow-card"
                    : "bg-muted/30 border-border opacity-50"
                }`}
              >
                <motion.span
                  className="text-2xl block mb-1"
                  animate={badge.earned ? { y: [0, -3, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  {badge.icon}
                </motion.span>
                <p className="text-xs font-medium text-foreground">
                  {badge.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {badge.description}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How XP Works */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4 text-warning" /> How to Earn XP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { action: "Log a meal", xp: "+10 XP" },
              { action: "AI meal analysis", xp: "+15 XP per item" },
              { action: "Log weight", xp: "+15 XP" },
              { action: "Complete a workout", xp: "+50 XP" },
              { action: "Complete daily challenge", xp: "+20-50 XP" },
            ].map((item) => (
              <div
                key={item.action}
                className="flex justify-between p-2 rounded-lg bg-muted/50"
              >
                <span className="text-sm text-foreground">{item.action}</span>
                <span className="text-sm font-bold text-primary">
                  {item.xp}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
