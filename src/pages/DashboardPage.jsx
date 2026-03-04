import { useProfile } from "@/hooks/useProfile";
import { useMeals } from "@/hooks/useMeals";
import { useUserStats } from "@/hooks/useUserStats";
import { useWorkouts } from "@/hooks/useWorkouts";
import { getDailyChallenges } from "@/lib/challenges";
import { getWorkoutPlans } from "@/lib/workoutData";
import { faceExercises } from "@/lib/workoutData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Zap,
  Trophy,
  Dumbbell,
  UtensilsCrossed,
  CheckCircle2,
  Droplets,
  Plus,
  Sparkles,
  ChevronRight,
  Clock,
  Play,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// ─── Helpers ────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 14) return "lunch";
  if (h < 17) return "snack";
  return "dinner";
}

const DONUT_COLORS = ["hsl(var(--primary))", "#3b82f6", "#f59e0b"];

// ─── Mini Donut (Nutrition Card) ────────────────────────

function MiniDonut({ protein, carbs, fat, calories, goal }) {
  const total = protein + carbs + fat;
  const data =
    total > 0
      ? [
          { name: "Protein", value: protein },
          { name: "Carbs", value: carbs },
          { name: "Fat", value: fat },
        ]
      : [{ name: "Empty", value: 1 }];

  return (
    <div className="relative w-20 h-20 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={26}
            outerRadius={38}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={
                  total > 0
                    ? DONUT_COLORS[i % DONUT_COLORS.length]
                    : "hsl(var(--muted))"
                }
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-foreground leading-none">
          {calories}
        </span>
        <span className="text-[8px] text-muted-foreground">/{goal}</span>
      </div>
    </div>
  );
}

// ─── Next Best Action Banner ────────────────────────────

function NextActionBanner({
  totalCalories,
  calorieGoal,
  todayWorkouts,
  totalProtein,
  profile,
}) {
  const hour = new Date().getHours();
  const timeOfDay = getTimeOfDay();

  let message = "";
  let action = null;
  let actionLabel = "";

  if (hour < 11 && totalCalories === 0) {
    message = `Good morning! Don't forget to log your ${timeOfDay}.`;
    action = "/meals";
    actionLabel = "Quick Log";
  } else if (todayWorkouts > 0 && totalProtein < 80) {
    const needed = Math.max(0, 80 - totalProtein);
    message = `Great job on the workout! You still need ${Math.round(needed)}g of protein today.`;
    action = "/meals";
    actionLabel = "Add Meal";
  } else if (hour >= 14 && todayWorkouts === 0) {
    message =
      "You haven't worked out yet today. A quick session can boost your energy.";
    action = "/workouts";
    actionLabel = "Start Workout";
  } else if (
    totalCalories > 0 &&
    totalCalories < calorieGoal * 0.5 &&
    hour >= 17
  ) {
    const remaining = Math.max(0, calorieGoal - totalCalories);
    message = `You're behind on calories. ${remaining} cal remaining -- time for ${timeOfDay}!`;
    action = "/meals";
    actionLabel = "Log Meal";
  } else if (totalCalories >= calorieGoal * 0.9 && todayWorkouts > 0) {
    message = "You're crushing it today! Keep up the consistency.";
    action = null;
    actionLabel = "";
  } else {
    message = `Here's your daily overview. Stay on track with your ${profile?.goal || "fitness"} goal.`;
    action = null;
    actionLabel = "";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-primary/20"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-primary/5" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50" />
      <div className="relative p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-foreground leading-snug">{message}</p>
        </div>
        {action && (
          <Link to={action} className="shrink-0">
            <Button size="sm" className="gap-1 text-xs h-8">
              {actionLabel} <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile, isProfileComplete } = useProfile();
  const { totalCalories, totalProtein, totalCarbs, totalFat, addMeal } =
    useMeals();
  const { stats, addXP } = useUserStats();
  const { checkins, addCheckin } = useWorkouts();

  const today = new Date().toISOString().split("T")[0];
  const challenges = getDailyChallenges(today, {
    userId: user?.id,
    goal: profile?.goal,
    activity_level: profile?.activity_level,
  });

  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [completedFaceEx, setCompletedFaceEx] = useState([]);
  const [waterGlasses, setWaterGlasses] = useState(0);

  const calorieGoal = profile?.daily_calories || 2000;
  const todayWorkouts = checkins.filter((c) => c.logged_at === today).length;

  // Get today's suggested workout
  const dayIndex = new Date().getDay();
  const workoutType = profile?.workout_preference || "home";
  const plans = getWorkoutPlans(workoutType);
  const todayPlan = plans[dayIndex % plans.length];

  // Protein / Carbs / Fat goals
  const proteinGoal = Math.round((calorieGoal * 0.3) / 4);
  const carbsGoal = Math.round((calorieGoal * 0.45) / 4);
  const fatGoal = Math.round((calorieGoal * 0.25) / 9);

  // XP
  const xp = stats?.xp || 0;
  const level = stats?.level || 1;
  const xpInLevel = xp % 500;
  const xpToNext = 500 - xpInLevel;

  // Next incomplete face exercise
  const nextFaceExercise = faceExercises.find(
    (ex) => !completedFaceEx.includes(ex.name),
  );

  // Water
  const waterMl = waterGlasses * 250;
  const waterGoal = 2500; // ml

  const handleAddWater = () => {
    setWaterGlasses((g) => g + 1);
    addMeal.mutate({
      food_name: "Water",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      servings: 1,
      sodium: 0,
      potassium: 0,
    });
    toast.success("+250ml water logged!");
  };

  const handleCompleteFaceEx = (name) => {
    setCompletedFaceEx((prev) => [...prev, name]);
    addXP.mutate(5);
    toast.success(`${name} done! +5 XP`);
  };

  const completeChallenge = (id, xpVal) => {
    if (completedChallenges.includes(id)) return;
    setCompletedChallenges((prev) => [...prev, id]);
    addXP.mutate(xpVal);
    toast.success(`+${xpVal} XP earned!`);
  };

  const fadeUp = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Good {getGreeting()}, {profile?.full_name || "there"}
        </h1>
      </div>

      {/* Profile Incomplete Banner */}
      {!isProfileComplete && (
        <motion.div {...fadeUp}>
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">
                  Complete your profile
                </p>
                <p className="text-sm text-muted-foreground">
                  Set up your details for personalized calorie goals
                </p>
              </div>
              <Link to="/settings">
                <Button size="sm" variant="default">
                  Set Up
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Next Best Action Banner */}
      <NextActionBanner
        totalCalories={totalCalories}
        calorieGoal={calorieGoal}
        todayWorkouts={todayWorkouts}
        totalProtein={totalProtein}
        profile={profile}
      />

      {/* ─── Bento Grid ──────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Nutrition Card — spans 1 col */}
        <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
          <Link to="/meals" className="block h-full">
            <Card className="shadow-card h-full hover:border-primary/20 transition-colors">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex items-center gap-1.5 mb-3">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Nutrition
                  </span>
                </div>
                <MiniDonut
                  protein={totalProtein}
                  carbs={totalCarbs}
                  fat={totalFat}
                  calories={totalCalories}
                  goal={calorieGoal}
                />
                <div className="space-y-1.5 mt-3">
                  {[
                    {
                      label: "P",
                      value: totalProtein,
                      goal: proteinGoal,
                      color: "bg-primary",
                    },
                    {
                      label: "C",
                      value: totalCarbs,
                      goal: carbsGoal,
                      color: "bg-blue-500",
                    },
                    {
                      label: "F",
                      value: totalFat,
                      goal: fatGoal,
                      color: "bg-amber-500",
                    },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center gap-2">
                      <span className="text-[9px] text-muted-foreground w-2">
                        {m.label}
                      </span>
                      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className={`h-1.5 rounded-full ${m.color}`}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min((m.value / m.goal) * 100, 100)}%`,
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground w-10 text-right">
                        {Math.round(m.value)}/{m.goal}g
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Activity Card — spans 1 col */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <Card className="shadow-card h-full">
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex items-center gap-1.5 mb-3">
                <Dumbbell className="h-3.5 w-3.5 text-info" />
                <span className="text-xs font-medium text-muted-foreground">
                  Activity
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                {todayWorkouts > 0 ? (
                  <div className="text-center">
                    <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      {todayWorkouts} workout{todayWorkouts > 1 ? "s" : ""} done
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Great consistency
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {todayPlan?.name || "Workout"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mb-3 flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" />{" "}
                      {todayPlan?.duration || "30 min"}
                    </p>
                    <Link to="/workouts">
                      <Button size="sm" className="gap-1.5 text-xs h-8 w-full">
                        <Play className="h-3 w-3" /> Start Workout
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* XP & Streak Card — spans full width on mobile, 1 col on lg */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.15 }}
          className="col-span-2 lg:col-span-1"
        >
          <Card className="shadow-card h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Zap className="h-3.5 w-3.5 text-warning" />
                <span className="text-xs font-medium text-muted-foreground">
                  XP & Streak
                </span>
              </div>
              <div className="flex items-center gap-4">
                {/* Streak */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Flame className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {stats?.current_streak || 0}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    day streak
                  </span>
                </div>
                {/* Level + XP bar */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-foreground">
                      Level {level}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {xp} XP
                    </span>
                  </div>
                  <div className="relative">
                    <Progress
                      value={(xpInLevel / 500) * 100}
                      className="h-2.5"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {xpToNext} XP to Level {level + 1}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Quick-Log Widgets ────────────────────── */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Quick Actions
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {/* Water Tracker */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.2 }}
            className="min-w-[170px]"
          >
            <Card className="shadow-card">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-medium text-foreground">
                    Water
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-2 rounded-full bg-blue-400"
                      animate={{
                        width: `${Math.min((waterMl / waterGoal) * 100, 100)}%`,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {waterMl}/{waterGoal}ml
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs h-7 gap-1"
                  onClick={handleAddWater}
                >
                  <Plus className="h-3 w-3" /> 250ml
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Face Exercise Quick-Check */}
          {nextFaceExercise && (
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.25 }}
              className="min-w-[170px]"
            >
              <Card className="shadow-card">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-foreground">
                      Face Exercise
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {nextFaceExercise.image ? (
                      <img
                        src={nextFaceExercise.image}
                        alt={nextFaceExercise.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <span className="text-lg">{nextFaceExercise.icon}</span>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {nextFaceExercise.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {nextFaceExercise.duration}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-7 gap-1"
                    onClick={() => handleCompleteFaceEx(nextFaceExercise.name)}
                  >
                    <CheckCircle2 className="h-3 w-3" /> Done
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Log Meal */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.3 }}
            className="min-w-[170px]"
          >
            <Link to="/meals" className="block">
              <Card className="shadow-card hover:border-primary/20 transition-colors h-full">
                <CardContent className="p-3 flex flex-col items-center justify-center h-full gap-2">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <UtensilsCrossed className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    Log Meal
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    Track your {getTimeOfDay()}
                  </span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ─── Daily Challenges ─────────────────────── */}
      <motion.div {...fadeUp} transition={{ delay: 0.35 }}>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-accent" /> Today's Challenges
              </CardTitle>
              <span className="text-sm font-medium text-muted-foreground">
                {completedChallenges.length}/{challenges.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {challenges.map((ch) => {
              const done = completedChallenges.includes(ch.id);
              return (
                <div
                  key={ch.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${done ? "bg-success/10 border-success/30" : "bg-muted/50 border-border"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{ch.icon}</span>
                    <div>
                      <p
                        className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}
                      >
                        {ch.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ch.description}
                      </p>
                    </div>
                  </div>
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeChallenge(ch.id, ch.xp)}
                    >
                      +{ch.xp} XP
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
