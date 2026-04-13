import { useEffect, useMemo, useRef, useState } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useProfile } from "@/hooks/useProfile";
import { useWaterLogs } from "@/hooks/useWaterLogs";
import { useMeals } from "@/hooks/useMeals";
import { useYearActivity } from "@/hooks/useYearActivity";
import { getLocalDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { Percent, Dumbbell, Droplets, Flame, TrendingUp, MapPin, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const { meals, monthlyMeals } = useMeals();
  const year = new Date().getFullYear();
  const { mealDates, workoutDates } = useYearActivity(year);
  const todayStr = getLocalDate();
  const [range, setRange] = useState("daily");
  const [isTracking, setIsTracking] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);
  const [savedRoutes, setSavedRoutes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fitwise_route_history") || "[]");
    } catch {
      return [];
    }
  });
  const watchIdRef = useRef(null);

  // Body metrics
  const bodyFat = useMemo(() => calculateBodyFat(profile), [profile]);
  const muscleMass = useMemo(() => calculateMuscleMass(profile, bodyFat), [profile, bodyFat]);
  const hydration = useMemo(() => calculateHydration(profile, totalWaterMl), [profile, totalWaterMl]);

  const calorieSeries = useMemo(() => {
    if (range === "daily") {
      return meals.map((meal, idx) => ({
        label: `${idx + 1}`,
        calories: Math.round((meal.calories || 0) * (meal.servings || 1)),
      }));
    }

    const grouped = {};
    monthlyMeals.forEach((meal) => {
      const key = meal.logged_at;
      grouped[key] = (grouped[key] || 0) + (meal.calories || 0) * (meal.servings || 1);
    });

    const rows = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, calories]) => ({
        label: date.slice(5),
        calories: Math.round(calories),
      }));

    if (range === "weekly") {
      return rows.slice(-7);
    }
    return rows;
  }, [range, meals, monthlyMeals]);

  const avgCalories = useMemo(() => {
    if (!calorieSeries.length) return 0;
    return Math.round(
      calorieSeries.reduce((sum, row) => sum + row.calories, 0) /
        calorieSeries.length,
    );
  }, [calorieSeries]);

  const overloadData = useMemo(() => {
    const points = checkins
      .filter((item) => item.workout_type !== "cardio")
      .map((item) => {
        const match = (item.notes || "").match(/(\d+)\s?kg/i);
        return {
          date: item.logged_at?.slice(5) || "N/A",
          weight: match ? Number(match[1]) : null,
          duration: item.duration_min || 0,
        };
      })
      .slice(-10);

    // Fallback for current dataset where weights may not yet be logged in notes.
    if (!points.some((p) => p.weight)) {
      return points.map((p) => ({ ...p, weight: p.duration }));
    }
    return points.map((p) => ({ ...p, weight: p.weight || 0 }));
  }, [checkins]);

  const overloadTrend = useMemo(() => {
    if (overloadData.length < 2) return "neutral";
    const first = overloadData[0].weight;
    const last = overloadData[overloadData.length - 1].weight;
    if (last > first) return "up";
    if (last < first) return "down";
    return "neutral";
  }, [overloadData]);

  const startTracking = () => {
    if (!("geolocation" in navigator)) return;
    setRoutePoints([]);
    setIsTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setRoutePoints((prev) => [
          ...prev,
          {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            ts: Date.now(),
          },
        ]);
      },
      () => setIsTracking(false),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    if (routePoints.length > 1) {
      const newRoute = {
        id: String(Date.now()),
        date: getLocalDate(),
        points: routePoints,
      };
      const next = [newRoute, ...savedRoutes].slice(0, 6);
      setSavedRoutes(next);
      localStorage.setItem("fitwise_route_history", JSON.stringify(next));
    }
  };

  useEffect(
    () => () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    },
    [],
  );

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
            {["daily", "weekly", "monthly"].map((item) => (
              <button
                key={item}
                onClick={() => setRange(item)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-widest rounded-full font-bold ${
                  range === item
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item}
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

      {/* Overload + GPS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="rounded-[2rem] bg-card dark:bg-surface-low/80 p-5 lg:p-6 border border-border/30 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Progressive Overload
            </h3>
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
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overloadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
                <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            TODO: store exercise-wise working weight per set in workout logs for more accurate overload analytics.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="rounded-[2rem] bg-card dark:bg-surface-low/80 p-5 lg:p-6 border border-border/30 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-info" />
              Cardio GPS Tracking
            </h3>
            {isTracking ? (
              <Button size="sm" variant="destructive" onClick={stopTracking} className="rounded-xl">
                <Square className="h-3.5 w-3.5 mr-1" /> Stop
              </Button>
            ) : (
              <Button size="sm" onClick={startTracking} className="rounded-xl bg-info hover:bg-info/90 text-info-foreground">
                <Play className="h-3.5 w-3.5 mr-1" /> Start Run
              </Button>
            )}
          </div>
          <div className="rounded-xl bg-surface p-4 border border-border/30 min-h-[130px]">
            <p className="text-xs text-muted-foreground mb-2">
              {isTracking ? "Tracking live route..." : "Start a run to capture location path."}
            </p>
            <p className="text-sm font-semibold text-foreground">
              Points captured: {routePoints.length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              TODO: integrate Leaflet/Mapbox polyline renderer for full map route.
            </p>
          </div>
          <div className="mt-3 space-y-2 max-h-24 overflow-y-auto pr-1">
            {savedRoutes.map((route) => (
              <div key={route.id} className="text-xs rounded-lg px-3 py-2 bg-surface border border-border/30 text-muted-foreground">
                {route.date} - {route.points.length} points
              </div>
            ))}
          </div>
        </motion.div>
      </div>

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
