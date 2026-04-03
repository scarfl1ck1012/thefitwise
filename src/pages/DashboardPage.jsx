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
      className="relative overflow-hidden rounded-3xl glass-panel group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
      <div className="relative p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.2)] group-hover:bg-primary/20 transition-colors">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <p className="text-[15px] font-medium text-foreground leading-snug">{message}</p>
        </div>
        {action && (
          <Link to={action} className="shrink-0">
            <Button size="sm" className="gap-1 h-9 rounded-full px-4 text-xs font-bold tracking-wide uppercase bg-primary text-primary-foreground hover:brightness-110 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all">
              {actionLabel} <ChevronRight className="h-3.5 w-3.5" />
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
      <div className="glass overflow-hidden rounded-[2rem] h-full flex flex-col relative group">
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
          <div className="absolute inset-0 bg-gradient-to-t from-surface-lowest/90 via-surface-lowest/30 to-transparent" />

          {/* Nav arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-high/60 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-surface-high"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-high/60 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-surface-high"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-base font-bold text-foreground mb-2 drop-shadow-md">
              {recipe.title}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[11px] uppercase tracking-wider text-primary font-bold">
                {recipe.calories} cal
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                {recipe.protein}g P
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                {recipe.carbs}g C
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                {recipe.fat}g F
              </span>
            </div>
          </div>

          <div className="absolute top-4 right-4 flex gap-1.5">
            {rotatedRecipes.map((_, i) => (
              <span
                key={i}
                className={`transition-all rounded-full ${i === index ? "w-4 h-1.5 bg-primary shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "w-1.5 h-1.5 bg-white/30"}`}
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
  const { profile, isProfileComplete } = useProfile();
  const { totalCalories, totalProtein, totalCarbs, totalFat } = useMeals();
  const { stats, addXP } = useUserStats();
  const { checkins } = useWorkouts();

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
    <div className="space-y-5 pb-6 overflow-x-hidden">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Good {getGreeting()}, {profile?.full_name || "there"}
        </h1>
      </div>

      {/* Profile Incomplete */}
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

      {/* Next Best Action */}
      <NextActionBanner
        totalCalories={totalCalories}
        calorieGoal={calorieGoal}
        todayWorkouts={todayWorkouts}
        totalProtein={totalProtein}
        profile={profile}
      />

      {/* ─── Bento Grid ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Nutrition Cell */}
        <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="h-full">
          <Link to="/meals" className="block h-full cursor-pointer group">
            <div className="glass rounded-[2rem] p-6 h-full flex flex-col relative overflow-hidden transition-all group-hover:border-primary/30 group-hover:shadow-[0_8px_30px_rgba(34,197,94,0.1)]">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-4">
                <UtensilsCrossed className="h-4 w-4 text-primary" />
                <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
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
              <div className="space-y-3 mt-6">
                {[
                  { label: "Pro", value: totalProtein, goal: proteinGoal, color: "bg-primary" },
                  { label: "Carb", value: totalCarbs, goal: carbsGoal, color: "bg-blue-400" },
                  { label: "Fat", value: totalFat, goal: fatGoal, color: "bg-amber-400" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground w-8 text-right">
                      {m.label}
                    </span>
                    <div className="flex-1 bg-surface-highest/50 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${m.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((m.value / m.goal) * 100, 100)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-foreground w-12">
                      {Math.round(m.value)}/{m.goal}g
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
          <div className="glass rounded-[2rem] p-6 h-full flex flex-col relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-warning" />
              <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                XP & Streak
              </span>
            </div>
            
            <div className="flex flex-col justify-center flex-1 gap-6">
              <div className="flex items-center gap-4 bg-surface-lowest/50 p-4 rounded-2xl">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-accent/20 to-accent/5 flex items-center justify-center shrink-0 border border-accent/20 shadow-[0_0_15px_rgba(251,146,60,0.15)]">
                  <Flame className="h-7 w-7 text-accent" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground">{stats?.current_streak || 0}</span>
                    <span className="text-sm text-accent font-semibold lowercase">day</span>
                  </div>
                  <span className="text-xs text-muted-foreground tracking-wide font-medium uppercase">Active Streak</span>
                </div>
              </div>
              
              <div className="px-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-foreground uppercase tracking-widest">
                    Level {level}
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {xp} XP
                  </span>
                </div>
                <div className="h-3 w-full bg-surface-highest/50 rounded-full overflow-hidden">
                   <motion.div 
                     className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                     initial={{ width: 0 }}
                     animate={{ width: `${(xpInLevel / 500) * 100}%` }}
                     transition={{ duration: 1, delay: 0.2 }}
                   />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-right font-medium">
                  {xpToNext} XP to Level {level + 1}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Daily Challenges ─────────────────────── */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
        <div className="glass rounded-[2rem] p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" /> Daily Challenges
            </h2>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {completedChallenges.length}/{challenges.length} Done
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((ch) => {
              const done = completedChallenges.includes(ch.id);
              return (
                <div
                  key={ch.id}
                  className={`flex items-start gap-4 p-4 rounded-2xl transition-all border ${done ? "bg-success/5 border-success/20" : "bg-surface-lowest/40 border-white/5 hover:bg-surface-lowest/60"}`}
                >
                  <div className="text-2xl mt-1 opacity-80">{ch.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[15px] font-semibold leading-snug mb-1 ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {ch.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {ch.description}
                    </p>
                    <div className="mt-3">
                      {done ? (
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2.5 py-1.5 rounded-lg">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="h-8 rounded-lg text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground border border-primary/20 hover:border-transparent transition-all"
                          onClick={() => completeChallenge(ch.id, ch.xp)}
                        >
                          +{ch.xp} XP
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
      <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="w-full min-w-0 pb-10">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-sm uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" /> Trending Reading
          </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          {getDailyRotation(trendingArticles, today).map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[280px] shrink-0 group block"
            >
              <div className="glass rounded-3xl overflow-hidden h-full flex flex-col transition-all group-hover:-translate-y-1 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5">
                <div className="h-36 overflow-hidden relative">
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-low to-transparent" />
                </div>
                <div className="p-5 flex-1 flex flex-col bg-surface-low">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                      {article.tag}
                    </span>
                  </div>
                  <p className="text-[15px] font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-4 text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest">
                    <ExternalLink className="h-3 w-3" /> Read Article
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
