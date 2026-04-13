import { useMemo, useState } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useProfile } from "@/hooks/useProfile";
import { useWaterLogs } from "@/hooks/useWaterLogs";
import { useMeals } from "@/hooks/useMeals";
import { useYearActivity } from "@/hooks/useYearActivity";
import { getLocalDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { Percent, Dumbbell, Droplets, Flame, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

// --- Body Metric Calculators ---
function calculateBodyFat(profile) {
  if (!profile?.weight_kg || !profile?.height_cm || !profile?.age || !profile?.gender) return null;
  const bmi = profile.weight_kg / Math.pow(profile.height_cm / 100, 2);
  const genderFactor = profile.gender === "male" ? 1 : 0;
  const bf = 1.2 * bmi + 0.23 * profile.age - 10.8 * genderFactor - 5.4;
  return Math.max(5, Math.min(60, Math.round(bf * 10) / 10));
}

function calculateMuscleMass(profile, bodyFat) {
  if (!profile?.weight_kg || bodyFat === null) return null;
  const leanMass = profile.weight_kg * (1 - bodyFat / 100);
  return Math.round(leanMass * 0.85 * 10) / 10;
}

function calculateHydration(profile, totalWaterMl) {
  return Math.min(100, Math.round((totalWaterMl / 2500) * 100));
}

// --- Calendar Helpers ---
const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function getDayIntensity(dateStr, mealDates, workoutDates) {
  const hasMeal = mealDates.has(dateStr);
  const hasWorkout = workoutDates.has(dateStr);
  if (hasMeal && hasWorkout) return 3; // Full green
  if (hasWorkout) return 2; // Medium green
  if (hasMeal) return 1; // Light green
  return 0; // Grey
}

const intensityClasses = {
  0: "bg-surface-high/40 dark:bg-surface-high/50",
  1: "bg-emerald-300/40 dark:bg-emerald-500/25",
  2: "bg-emerald-400/60 dark:bg-emerald-500/50",
  3: "bg-emerald-500 dark:bg-emerald-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]",
};

export default function WorkoutsPage() {
  const { checkins } = useWorkouts();
  const { profile } = useProfile();
  const { totalWaterMl } = useWaterLogs();
  const { historyMeals } = useMeals();
  const year = new Date().getFullYear();
  const { mealDates, workoutDates } = useYearActivity(year);
  const todayStr = getLocalDate();
  const [range, setRange] = useState("30d");

  // Body metrics
  const bodyFat = useMemo(() => calculateBodyFat(profile), [profile]);
  const muscleMass = useMemo(() => calculateMuscleMass(profile, bodyFat), [profile, bodyFat]);
  const hydration = useMemo(() => calculateHydration(profile, totalWaterMl), [profile, totalWaterMl]);

  const calorieSeries = useMemo(() => {
    const grouped = {};
    historyMeals.forEach((meal) => {
      const key = meal.logged_at;
      grouped[key] = (grouped[key] || 0) + (meal.calories || 0) * (meal.servings || 1);
    });

    const rows = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, calories]) => ({
        label: date.slice(5),
        calories: Math.round(calories),
      }));
    if (range === "30d") return rows.slice(-30);
    if (range === "90d") return rows.slice(-90);
    if (range === "180d") return rows.slice(-180);
    return rows;
  }, [range, historyMeals]);

  const avgCalories = useMemo(() => {
    if (!calorieSeries.length) return 0;
    return Math.round(
      calorieSeries.reduce((sum, row) => sum + row.calories, 0) /
        calorieSeries.length,
    );
  }, [calorieSeries]);

  const exerciseProgressMap = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("fitwise_exercise_progress") || "{}");
    } catch {
      return {};
    }
  }, []);

  const exerciseNames = useMemo(() => {
    const fromProgress = Object.keys(exerciseProgressMap);
    let fromPlan = [];
    try {
      const plan = JSON.parse(localStorage.getItem("fitwise_weekly_plan") || "{}");
      fromPlan = Object.values(plan)
        .flat()
        .map((ex) => ex.name)
        .filter(Boolean);
    } catch {
      fromPlan = [];
    }
    return [...new Set([...fromProgress, ...fromPlan])];
  }, [exerciseProgressMap]);

  const [selectedExercise, setSelectedExercise] = useState(
    exerciseNames[0] || "Bench Press",
  );

  const overloadData = useMemo(() => {
    const existing = exerciseProgressMap[selectedExercise] || [];
    if (existing.length) {
      return existing.slice(-12).map((row) => ({
        date: (row.date || "").slice(5),
        weight: Number(row.weight || 0),
      }));
    }
    const gymCheckins = checkins.filter((c) => c.workout_type !== "cardio").slice(-8);
    // Hash function to generate variant mock baseline
    let hash = 0;
    for (let i = 0; i < selectedExercise.length; i++) {
        hash = selectedExercise.charCodeAt(i) + ((hash << 5) - hash);
    }
    const baseWeight = Math.abs(hash % 50) + 15;
    return gymCheckins.map((c, idx) => ({
      date: (c.logged_at || "").slice(5),
      weight: parseFloat((baseWeight + (idx * 2.5)).toFixed(1)),
    }));
  }, [checkins, exerciseProgressMap, selectedExercise]);

  const overloadTrend = useMemo(() => {
    if (overloadData.length < 2) return "neutral";
    const first = overloadData[0].weight;
    const last = overloadData[overloadData.length - 1].weight;
    return last > first ? "up" : last < first ? "down" : "neutral";
  }, [overloadData]);

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto pl-4 lg:pl-0 pr-4">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Progress & Metrics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tracking elite physical evolution through kinetic data points.
        </p>
      </div>

      {/* Body Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Percent, label: "Body Fat", value: bodyFat !== null ? `${bodyFat}%` : "—", sub: "Computed", progress: bodyFat ? `${bodyFat}%` : "0%" },
          { icon: Dumbbell, label: "Muscle Mass", value: muscleMass !== null ? `${muscleMass} kg` : "—", sub: "Estimated", progress: muscleMass && profile?.weight_kg ? `${Math.round((muscleMass / profile.weight_kg) * 100)}%` : "0%", segmented: true },
          { icon: Droplets, label: "Hydration", value: `${hydration}%`, sub: "Today", progress: `${hydration}%` },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-[2rem] bg-card dark:bg-surface-low/80 p-6 lg:p-8 border border-border/30 flex flex-col justify-between h-[180px] shadow-card"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-full bg-surface dark:bg-surface-high/50 border border-border/30 flex items-center justify-center">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-primary">{stat.sub}</span>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-1 font-semibold">{stat.label}</p>
              <h4 className="text-3xl font-bold tracking-tight text-foreground">
                {stat.value.split(" ")[0]}
                <span className="text-lg font-medium text-muted-foreground ml-1">{stat.value.split(" ")[1]}</span>
              </h4>
              <div className="mt-5 w-full">
                {stat.segmented ? (
                  <div className="flex gap-1 h-3">
                    <div className="h-full w-1 rounded-full bg-primary/20"></div>
                    <div className="h-full w-1 rounded-full bg-primary/40"></div>
                    <div className="h-full w-1 rounded-full bg-primary/60"></div>
                    <div className="h-full w-1 rounded-full bg-primary/80"></div>
                    <div className="h-full w-1 rounded-full bg-primary shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    <div className="h-full w-1 rounded-full bg-surface-high"></div>
                    <div className="h-full w-1 rounded-full bg-surface-high"></div>
                  </div>
                ) : (
                  <div className="h-1.5 w-full bg-surface-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary shadow-[0_0_8px_rgba(34,197,94,0.5)] rounded-full" style={{ width: stat.progress }}></div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Calories Graph */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="rounded-[2rem] bg-card dark:bg-surface-low/80 p-5 lg:p-6 border border-border/30 shadow-card"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              Calorie Intake Trend
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Average {avgCalories} kcal</p>
          </div>
          <div className="flex gap-1 rounded-full bg-surface p-1 border border-border/30">
            {[
              { id: "30d", label: "30d" },
              { id: "90d", label: "3m" },
              { id: "180d", label: "6m" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setRange(item.id)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-widest rounded-full font-bold ${
                  range === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={calorieSeries}>
              <defs>
                <linearGradient id="calGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                }}
              />
              <Area type="monotone" dataKey="calories" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#calGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Exercise Overload */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="rounded-[2rem] bg-card dark:bg-surface-low/80 p-5 lg:p-6 border border-border/30 shadow-card"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Exercise Weight Progression
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-[220px]">
              <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                <SelectTrigger className="h-9 bg-surface border-border/40">
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {exerciseNames.slice(0, 6).map((name) => (
              <button
                key={name}
                onClick={() => setSelectedExercise(name)}
                onMouseEnter={() => setSelectedExercise(name)}
                title={`View ${name} progression`}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  selectedExercise === name
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-surface border-border/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                {name}
              </button>
            ))}
            <Badge
              variant="outline"
              className={
                overloadTrend === "up"
                  ? "border-primary/40 text-primary"
                  : overloadTrend === "down"
                    ? "border-destructive/40 text-destructive"
                    : "border-border/40 text-muted-foreground"
              }
            >
              {overloadTrend === "up"
                ? "Increasing"
                : overloadTrend === "down"
                  ? "Decreasing"
                  : "Stable"}
            </Badge>
          </div>
        </div>
          <div className="h-[250px] min-h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overloadData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}
                />
                <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))" }} activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--card))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
      </motion.div>

      {/* Full Year Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center justify-between mb-4 px-2">
          <div>
            <h3 className="text-lg font-bold text-foreground">{year} Progress Calendar</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Your daily activity across the entire year.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${intensityClasses[0]}`}></div>
              <span className="text-[10px] text-muted-foreground font-semibold">None</span>
            </span>
            <span className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${intensityClasses[1]}`}></div>
              <span className="text-[10px] text-muted-foreground font-semibold">Meal</span>
            </span>
            <span className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${intensityClasses[2]}`}></div>
              <span className="text-[10px] text-muted-foreground font-semibold">Workout</span>
            </span>
            <span className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${intensityClasses[3]}`}></div>
              <span className="text-[10px] text-muted-foreground font-semibold">Both</span>
            </span>
          </div>
        </div>

        <div className="rounded-[2rem] bg-card dark:bg-surface-low/80 p-4 lg:p-6 border border-border/30 shadow-card">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-5">
            {Array.from({ length: 12 }, (_, month) => {
              const days = getMonthDays(year, month);
              return (
                <div key={month} className="min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 text-center">
                    {MONTH_NAMES_SHORT[month]}
                  </p>
                  <div className="grid grid-cols-7 gap-[2px]">
                    {days.map((day, idx) => {
                      if (day === null) return <div key={`e-${idx}`} className="w-full aspect-square" />;
                      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const intensity = getDayIntensity(dateStr, mealDates, workoutDates);
                      const isToday = dateStr === todayStr;
                      const isFuture = dateStr > todayStr;

                      return (
                        <div
                          key={dateStr}
                          className={`w-full aspect-square rounded-full transition-colors ${
                            isFuture
                              ? "bg-transparent border border-border/10"
                              : intensityClasses[intensity]
                          } ${isToday ? "ring-[1.5px] ring-primary ring-offset-1 ring-offset-background" : ""}`}
                          title={`${dateStr}${intensity === 3 ? " — Meal + Workout" : intensity === 2 ? " — Workout" : intensity === 1 ? " — Meal" : ""}`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
