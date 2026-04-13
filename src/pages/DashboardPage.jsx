import { useProfile } from "@/hooks/useProfile";
import { useMeals } from "@/hooks/useMeals";
import { useUserStats } from "@/hooks/useUserStats";
import { useWorkouts } from "@/hooks/useWorkouts";
import { getDailyChallenges } from "@/lib/challenges";
import { trendingArticles, popularRecipes } from "@/lib/dashboardData";
import { getLocalDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Zap,
  Trophy,
  UtensilsCrossed,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  X,
  Clock,
  BookOpen,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
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

// ─── Mini Donut ─────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────

function getDailyRotation(items, dateStr, limit = 5) {
  if (!items || items.length === 0) return [];
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const seed = Math.abs(hash);
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.abs(Math.sin(seed + i)) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, limit);
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
  let message = "",
    action = null,
    actionLabel = "";

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
  } else {
    message = `Here's your daily overview. Stay on track with your ${profile?.goal || "fitness"} goal.`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2rem] bg-surface-lowest border border-border/30 group mb-2"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50" />
      <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-[0_0_20px_rgba(34,197,94,0.15)] group-hover:bg-primary/20 transition-colors">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <p className="text-[15px] sm:text-base font-semibold text-foreground leading-snug">{message}</p>
        </div>
        {action && (
          <Link to={action} className="shrink-0 w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto gap-2 h-10 rounded-xl px-5 text-xs font-bold tracking-widest uppercase bg-white text-black hover:bg-neutral-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all">
              {actionLabel} <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

// ─── Recipe Modal ───────────────────────────────────────

function RecipeModal({ recipe, onClose }) {
  if (!recipe) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero Image */}
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-lg font-bold text-foreground">
              {recipe.title}
            </h2>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {recipe.prepTime}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Macro Breakdown */}
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                label: "Calories",
                value: recipe.calories,
                unit: "kcal",
                color: "text-foreground",
              },
              {
                label: "Protein",
                value: recipe.protein,
                unit: "g",
                color: "text-primary",
              },
              {
                label: "Carbs",
                value: recipe.carbs,
                unit: "g",
                color: "text-blue-400",
              },
              {
                label: "Fat",
                value: recipe.fat,
                unit: "g",
                color: "text-amber-400",
              },
            ].map((m) => (
              <div
                key={m.label}
                className="text-center p-2 rounded-lg bg-muted/50"
              >
                <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                <p className="text-[9px] text-muted-foreground">{m.unit}</p>
                <p className="text-[9px] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Ingredients
            </h3>
            <ul className="space-y-1">
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Preparation
            </h3>
            <ol className="space-y-2">
              {recipe.steps.map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-muted-foreground"
                >
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Recipe Carousel ────────────────────────────────────

function RecipeCarousel({ dateStr }) {
  const [index, setIndex] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const rotatedRecipes = useMemo(
    () => getDailyRotation(popularRecipes, dateStr),
    [dateStr],
  );
  const recipe = rotatedRecipes[index];

  const next = () => setIndex((i) => (i + 1) % rotatedRecipes.length);
  const prev = () =>
    setIndex((i) => (i - 1 + rotatedRecipes.length) % rotatedRecipes.length);

  return (
    <>
      <div className="bg-surface-low border border-border/30 overflow-hidden rounded-[2rem] h-full flex flex-col relative group">
        <div
          className="relative group cursor-pointer flex-1 min-h-[220px]"
          onClick={() => setSelectedRecipe(recipe)}
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.img
              key={recipe.id}
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/60 to-transparent" />

          {/* Nav arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-border/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80 hover:border-white/30"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-border/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80 hover:border-white/30"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-lg font-black text-white mb-3 drop-shadow-lg leading-tight">
              {recipe.title}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold bg-primary/10 px-2 py-1 rounded-sm border border-primary/20">
                {recipe.calories} kcal
              </span>
              <span className="text-xs text-white/70 font-bold uppercase tracking-widest">
                <span className="text-primary">{recipe.protein}g</span> P
              </span>
              <span className="text-xs text-white/70 font-bold uppercase tracking-widest">
                <span className="text-info">{recipe.carbs}g</span> C
              </span>
              <span className="text-xs text-white/70 font-bold uppercase tracking-widest">
                <span className="text-accent">{recipe.fat}g</span> F
              </span>
            </div>
          </div>

          <div className="absolute top-5 right-5 flex gap-1.5 z-10">
            {rotatedRecipes.map((_, i) => (
              <span
                key={i}
                className={`transition-all rounded-full ${i === index ? "w-5 h-1.5 bg-primary shadow-[0_0_10px_rgba(34,197,94,0.8)] border border-white/20" : "w-1.5 h-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedRecipe && (
          <RecipeModal
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Dashboard ─────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile, isProfileComplete, isLoading: profileLoading } = useProfile();
  const { totalCalories, totalProtein, totalCarbs, totalFat, isLoading: mealsLoading } = useMeals();
  const { stats, addXP, isLoading: statsLoading } = useUserStats();
  const { checkins, isLoading: workoutsLoading } = useWorkouts();

  const today = getLocalDate();
  const challenges = getDailyChallenges(today, {
    userId: user?.id,
    goal: profile?.goal,
    activity_level: profile?.activity_level,
  });

  const [completedChallenges, setCompletedChallenges] = useState(() => {
    try {
      const saved = localStorage.getItem("fitwise_challenges_" + today);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "fitwise_challenges_" + today,
      JSON.stringify(completedChallenges),
    );
  }, [completedChallenges, today]);
  const calorieGoal = profile?.daily_calories || 2000;
  const todayWorkouts = checkins.filter((c) => c.logged_at === today).length;

  const proteinGoal = Math.round((calorieGoal * 0.3) / 4);
  const carbsGoal = Math.round((calorieGoal * 0.45) / 4);
  const fatGoal = Math.round((calorieGoal * 0.25) / 9);
  const xp = stats?.xp || 0;
  const level = stats?.level || 1;
  const xpInLevel = xp % 500;
  const xpToNext = 500 - xpInLevel;
  const isDashboardLoading =
    profileLoading || mealsLoading || statsLoading || workoutsLoading;

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

  if (isDashboardLoading) {
    return (
      <div className="space-y-6 pb-24 max-w-6xl mx-auto px-4 lg:px-0 pt-4 overflow-x-hidden">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-44" />
        </div>
        <Skeleton className="h-24 rounded-[2rem]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-[360px] rounded-[2rem]" />
          <Skeleton className="h-[360px] rounded-[2rem]" />
          <Skeleton className="h-[360px] rounded-[2rem]" />
        </div>
        <Skeleton className="h-[280px] rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto px-4 lg:px-0 pt-4 overflow-x-hidden">
      {/* Greeting */}
      <div className="relative mb-2">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
        <h1 className="text-3xl font-bold text-foreground relative tracking-tight">
          Good {getGreeting()}, {profile?.full_name?.split(' ')[0] || "there"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 relative font-medium">Ready to crush your goals today?</p>
      </div>

      {/* Profile Incomplete */}
      {!isProfileComplete && (
        <motion.div {...fadeUp} className="mb-4">
          <div className="rounded-[2rem] bg-accent/10 border border-accent/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-accent uppercase tracking-widest mb-1">
                  Complete Setup
                </p>
                <p className="text-sm text-foreground font-medium">
                  Set up your physical details for personalized goals.
                </p>
              </div>
              <Link to="/settings" className="shrink-0 w-full sm:w-auto">
                <Button className="w-full sm:w-auto text-xs font-bold uppercase tracking-widest bg-accent hover:bg-accent/80 text-black h-10 rounded-xl px-6">
                  Finalize Profile
                </Button>
              </Link>
          </div>
        </motion.div>
      )}

      {/* Next Best Action */}
      <NextActionBanner
        totalCalories={totalCalories}
        calorieGoal={calorieGoal}
        todayWorkouts={todayWorkouts}
        totalProtein={totalProtein}
        profile={profile}
      />

      {/* ─── Bento Grid ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Nutrition Cell */}
        <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="h-full">
          <Link to="/meals" className="block h-full cursor-pointer group">
            <div className="bg-surface-low border border-border/30 rounded-[2rem] p-6 lg:p-8 h-full flex flex-col relative overflow-hidden transition-all group-hover:border-primary/40 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.05)]">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-colors" />
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] uppercase tracking-widest font-bold text-foreground bg-muted px-3 py-1 rounded-full border border-border/30 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  Nutrition
                </span>
                <UtensilsCrossed className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              
              <MiniDonut
                protein={totalProtein}
                carbs={totalCarbs}
                fat={totalFat}
                calories={totalCalories}
                goal={calorieGoal}
              />
              
              <div className="space-y-4 mt-8 flex-1 flex flex-col justify-end relative z-10">
                {[
                  { label: "Pro", value: totalProtein, goal: proteinGoal, color: "bg-primary" },
                  { label: "Carb", value: totalCarbs, goal: carbsGoal, color: "bg-info" },
                  { label: "Fat", value: totalFat, goal: fatGoal, color: "bg-accent" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-10 text-right">
                      {m.label}
                    </span>
                    <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden border border-border/30 relative">
                      <motion.div
                        className={`absolute inset-y-0 left-0 rounded-full ${m.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((m.value / m.goal) * 100, 100)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-foreground w-12 text-right">
                      {Math.round(m.value)}<span className="text-muted-foreground">/{m.goal}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Recipe Carousel Cell */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="h-full">
          <RecipeCarousel dateStr={today} />
        </motion.div>

        {/* XP & Streak Cell */}
        <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="col-span-1 md:col-span-2 lg:col-span-1 h-full">
          <div className="bg-surface-low border border-border/30 rounded-[2rem] p-6 lg:p-8 h-full flex flex-col relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-[50px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] uppercase tracking-widest font-bold text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full flex items-center gap-2">
                  <Trophy className="h-3 w-3" /> Progression
                </span>
            </div>
            
            <div className="flex flex-col justify-center flex-1 gap-6 relative z-10">
              {/* Streak Card */}
              <div className="flex items-center gap-5 bg-surface border border-border/30 p-5 rounded-[1.5rem] group hover:border-accent/30 transition-colors cursor-default">
                <div className="w-14 h-14 rounded-[1rem] bg-gradient-to-tr from-accent/20 to-accent/5 flex items-center justify-center shrink-0 border border-accent/20 shadow-[0_0_20px_rgba(251,146,60,0.15)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-accent/20 mix-blend-overlay" />
                  <Flame className="h-7 w-7 text-accent relative z-10 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-foreground">{stats?.current_streak || 0}</span>
                  </div>
                  <span className="text-[10px] text-accent/80 tracking-widest font-bold uppercase mt-0.5 block">Active Streak (Days)</span>
                </div>
              </div>
              
              {/* Level Card */}
              <div className="bg-surface border border-border/30 p-5 rounded-[1.5rem]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-black text-foreground uppercase tracking-widest border border-border/40 px-2.5 py-0.5 rounded-md bg-surface-low">
                    Lvl {level}
                  </span>
                  <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
                    {xp} Total XP
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/30 relative">
                   <motion.div 
                     className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                     initial={{ width: 0 }}
                     animate={{ width: `${(xpInLevel / 500) * 100}%` }}
                     transition={{ duration: 1, delay: 0.2 }}
                   />
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 text-right font-medium uppercase tracking-wider">
                  <span className="text-foreground">{xpToNext} XP</span> to Level {level + 1}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Daily Challenges ─────────────────────── */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="mb-6 h-full">
        <div className="bg-surface-low border border-border/30 rounded-[2rem] p-6 lg:p-8 h-full">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
            <h2 className="text-sm uppercase tracking-widest font-bold text-foreground flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <CheckCircle2 className="h-4 w-4 text-primary" /> 
              </span>
              Daily Tasks
            </h2>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-sm uppercase tracking-widest border border-primary/20">
              {completedChallenges.length}/{challenges.length} Done
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((ch) => {
              const done = completedChallenges.includes(ch.id);
              return (
                <div
                  key={ch.id}
                  className={`flex flex-col sm:flex-row items-start gap-4 p-5 rounded-2xl transition-all border group relative overflow-hidden ${
                    done 
                      ? "bg-primary/5 border-primary/20" 
                      : "bg-surface border-border/30 hover:border-primary/20 hover:bg-surface-high shadow-sm"
                  }`}
                >
                  {done && <div className="absolute inset-0 bg-primary/5 mix-blend-overlay pointer-events-none" />}
                  <div className={`text-2xl shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${done ? 'bg-primary/20 border-primary/30 grayscale' : 'bg-surface-lowest border-border/30'}`}>
                    {ch.icon}
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <p className={`text-sm font-bold leading-snug mb-1 truncate ${done ? "line-through text-primary/50" : "text-foreground group-hover:text-primary transition-colors"}`}>
                      {ch.title}
                    </p>
                    <p className={`text-[11px] leading-relaxed line-clamp-2 ${done ? "text-primary/40 font-medium" : "text-muted-foreground font-medium"}`}>
                      {ch.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between w-full h-8">
                      {done ? (
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2.5 py-1.5 rounded-lg w-full justify-center opacity-80 mt-auto">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Claimed
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="h-8 rounded-lg text-[10px] font-black text-black bg-white hover:bg-neutral-200 border-none transition-all uppercase tracking-widest px-4 w-full mt-auto"
                          onClick={() => completeChallenge(ch.id, ch.xp)}
                        >
                          Claim +{ch.xp} XP
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ─── Trending Fitness Articles ─────────────── */}
      <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="w-full min-w-0 pb-6">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-xs uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
            Trending Reading
          </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          {getDailyRotation(trendingArticles, today).map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[300px] w-[300px] shrink-0 group block"
            >
              <div className="bg-surface-low rounded-[2rem] overflow-hidden h-full flex flex-col transition-all group-hover:-translate-y-1 group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)] border border-border/30 group-hover:border-primary/30">
                <div className="h-40 overflow-hidden relative border-b border-border/30">
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out grayscale-[20%] group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/20 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <span className="text-[9px] font-black tracking-widest uppercase text-black bg-primary px-2.5 py-1 rounded-sm shadow-lg">
                      {article.tag}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col bg-surface">
                  <p className="text-[15px] font-bold text-white leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1 mb-4">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest pt-4 border-t border-border/30 mt-auto">
                    <ExternalLink className="h-3.5 w-3.5" /> Read Full Guide
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
