import { useState, useMemo, useEffect, useRef } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useUserStats } from "@/hooks/useUserStats";
import {
  gymExercises,
  DAYS_OF_WEEK,
  DAY_LABELS,
} from "@/lib/gymExercises";
import { getLocalDate } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Plus,
  ArrowRight,
  Moon,
  Search,
  Check,
  X,
  Home,
  Dumbbell,
  Activity,
  Flame,
  Play,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

const emptyWeek = () => ({
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
});

const CARDIO_TYPES = [
  { id: "incline_walk", label: "Incline Walk", calPerMin: 5, icon: "⛰️" },
  { id: "outdoor_walk", label: "Outdoor Walk", calPerMin: 4.5, icon: "🚶" },
  { id: "jog", label: "Jogging", calPerMin: 8, icon: "🏃" },
  { id: "run", label: "Running", calPerMin: 11, icon: "🏃" },
  { id: "swim", label: "Swimming", calPerMin: 10, icon: "🏊" },
  { id: "cycle", label: "Cycling", calPerMin: 8, icon: "🚴" },
  { id: "row", label: "Rowing", calPerMin: 9, icon: "🚣" },
];

const DAY_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function getDateForWeekday(dayKey) {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const result = new Date(monday);
  const targetOffset = (DAY_INDEX[dayKey] + 6) % 7;
  result.setDate(monday.getDate() + targetOffset);
  return result;
}

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function weekdayKey(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return dayMap[d.getDay()];
}

function calcDistanceKm(points) {
  if (!points || points.length < 2) return 0;
  const rad = (v) => (v * Math.PI) / 180;
  let sum = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const lat1 = rad(a.lat);
    const lat2 = rad(b.lat);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    sum += 6371 * (2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
  }
  return Number(sum.toFixed(2));
}

export function MiniRouteMap({ points }) {
  if (!points || points.length < 2) {
    return (
      <div className="h-40 rounded-xl bg-surface-lowest border border-border/30 flex items-center justify-center text-xs text-muted-foreground">
        Route map will appear once movement is detected.
      </div>
    );
  }

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = Math.max(maxLat - minLat, 0.0001);
  const lngSpan = Math.max(maxLng - minLng, 0.0001);

  const polyline = points
    .map((p) => {
      const x = ((p.lng - minLng) / lngSpan) * 280 + 20;
      const y = 180 - ((p.lat - minLat) / latSpan) * 140;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="h-40 rounded-xl bg-surface-lowest border border-border/30 overflow-hidden">
      <svg viewBox="0 0 320 180" className="h-full w-full">
        <polyline
          points={polyline}
          fill="none"
          stroke="hsl(var(--info))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function GymPage() {
  const { checkins, addCheckin } = useWorkouts();
  const { addXP } = useUserStats();
  const today = getLocalDate();
  const checkedIn = checkins.some((c) => c.logged_at === today);

  // Home / Gym mode toggle
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("fitwise_gym_mode") || "gym";
  });

  useEffect(() => {
    localStorage.setItem("fitwise_gym_mode", mode);
  }, [mode]);

  const [weeklyPlan, setWeeklyPlan] = useState(() => {
    try {
      const saved = localStorage.getItem("fitwise_weekly_plan");
      return saved ? JSON.parse(saved) : emptyWeek();
    } catch {
      return emptyWeek();
    }
  });

  const [restDays, setRestDays] = useState(() => {
    try {
      const saved = localStorage.getItem("fitwise_weekly_rest");
      return saved ? JSON.parse(saved) : { wednesday: true, sunday: true };
    } catch {
      return { wednesday: true, sunday: true };
    }
  });

  useEffect(() => {
    localStorage.setItem("fitwise_weekly_plan", JSON.stringify(weeklyPlan));
    localStorage.setItem("fitwise_weekly_rest", JSON.stringify(restDays));
  }, [weeklyPlan, restDays]);

  const [selectedDay, setSelectedDay] = useState("monday");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [restModalOpen, setRestModalOpen] = useState(false);
  const [searchEx, setSearchEx] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [liveRoute, setLiveRoute] = useState([]);

  // Cardio Form State
  const [cardioType, setCardioType] = useState("incline_walk");
  const [cardioDuration, setCardioDuration] = useState("0");
  const [cardioIncline, setCardioIncline] = useState("12");
  const [cardioSpeed, setCardioSpeed] = useState("5.5");
  const [savedRoutes, setSavedRoutes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fitwise_route_history") || "[]");
    } catch {
      return [];
    }
  });
  const timerRef = useRef(null);
  const gpsRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (gpsRef.current !== null) {
        navigator.geolocation.clearWatch(gpsRef.current);
        gpsRef.current = null;
      }
    };
  }, []);

  const toggleRestDay = (day) => {
    setRestDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleAddExercise = (ex) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [selectedDay]: [
        ...(prev[selectedDay] || []),
        { ...ex, instanceId: Date.now().toString() },
      ],
    }));
    toast.success("Added to " + DAY_LABELS[selectedDay]);
    setBuilderOpen(false);
  };

  const handleRemoveExercise = (instanceId) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [selectedDay]: (prev[selectedDay] || []).filter(
        (e) => e.instanceId !== instanceId
      ),
    }));
  };

  const handleUpdateExercise = (instanceId, updates) => {
    setWeeklyPlan((prev) => {
      const dayPlan = prev[selectedDay] || [];
      return {
        ...prev,
        [selectedDay]: dayPlan.map((ex) =>
          ex.instanceId === instanceId ? { ...ex, ...updates } : ex
        ),
      };
    });
  };

  const dayExercises = weeklyPlan[selectedDay] || [];

  const filteredExercises = useMemo(() => {
    if (!searchEx) return [];
    return gymExercises
      .filter(
        (ex) =>
          (ex.type === mode || !ex.type) &&
          (ex.name.toLowerCase().includes(searchEx.toLowerCase()) ||
            ex.muscle.toLowerCase().includes(searchEx.toLowerCase()))
      )
      .slice(0, 12);
  }, [searchEx, mode]);

  const defaultExercises = useMemo(() => {
    if (mode === "home") {
      return [
        { name: "Push-Ups", sets: "4", repRange: "12-15", weight: "BW", type: "Chest" },
        { name: "Bodyweight Squats", sets: "3", repRange: "15-20", weight: "BW", type: "Legs" },
        { name: "Plank", sets: "3", repRange: "45s", weight: "BW", type: "Core" },
      ];
    }
    return [
      { name: "Barbell Bench Press", sets: "4", repRange: "8-10", weight: "85kg", type: "Chest" },
      { name: "Incline Dumbbell Press", sets: "3", repRange: "10-12", weight: "35kg", type: "Chest" },
      { name: "Cable Crossovers", sets: "3", repRange: "12-15", weight: "20kg", type: "Chest" },
    ];
  }, [mode]);

  const handleStartSession = () => {
    if (checkedIn) {
      toast.error("Already completed a session today.");
      return;
    }
    addCheckin.mutate({
      workout_type: mode,
      duration_min: 60,
      notes: `${mode === "home" ? "Home" : "Gym"} session`,
    });

    const todayKey = weekdayKey(today);
    const todayPlan = weeklyPlan[todayKey] || [];
    const progressStore = JSON.parse(localStorage.getItem("fitwise_exercise_progress") || "{}");
    todayPlan.forEach((ex, idx) => {
      let baselineWeight = 20;
      if (ex.weight && !isNaN(parseFloat(ex.weight))) {
        baselineWeight = parseFloat(ex.weight);
      } else {
        baselineWeight = ex.muscle === "Legs" ? 40 : ex.muscle === "Back" ? 35 : ex.muscle === "Chest" ? 30 : 20;
      }
      const prev = progressStore[ex.name]?.[progressStore[ex.name].length - 1]?.weight || baselineWeight;
      const nextWeight = Number((prev + (idx % 2 === 0 ? 1.25 : 0.5)).toFixed(2));
      if (!progressStore[ex.name]) progressStore[ex.name] = [];
      progressStore[ex.name].push({ date: today, weight: nextWeight });
    });
    localStorage.setItem("fitwise_exercise_progress", JSON.stringify(progressStore));

    addXP.mutate(25);
    toast.success("Session Started! +25 XP");
  };

  const calculateCardioCalories = () => {
    const mins = (isTracking ? elapsedSec : parseInt(cardioDuration) * 60) / 60;
    if (mins <= 0) return 0;
    if (cardioType === "incline_walk") {
      const inc = parseFloat(cardioIncline) || 0;
      const speed = parseFloat(cardioSpeed) || 5.5;
      return Math.round(mins * (4.5 + speed * 0.6 + inc * 0.35));
    }
    const typeObj = CARDIO_TYPES.find(t => t.id === cardioType);
    return typeObj ? Math.round(mins * typeObj.calPerMin) : 0;
  };

  const handleLogCardio = () => {
    const mins = isTracking ? Math.max(1, Math.round(elapsedSec / 60)) : parseInt(cardioDuration) || 0;
    if (mins <= 0) return toast.error("Enter a valid duration (minutes)");
    
    const calories = calculateCardioCalories();
    const typeLabel = CARDIO_TYPES.find(t => t.id === cardioType)?.label || "Cardio";
    
    // Check if they've checked in, if not log it
    let notes = `Log: ${typeLabel} for ${mins} mins (~${calories} cal)`;
    if (cardioType === "incline_walk") {
      notes += ` at ${cardioIncline}% incline`;
    }

    const distanceKm = calcDistanceKm(liveRoute);
    addCheckin.mutate({
      workout_type: "cardio",
      duration_min: mins,
      notes: `${notes}${distanceKm ? ` | ${distanceKm} km` : ""}`,
    });
    
    addXP.mutate(15);
    toast.success(`Cardio logged! Burned ~${calories} calories.`);
    const route = {
      id: String(Date.now()),
      date: today,
      type: cardioType,
      points: liveRoute,
      distanceKm,
      duration: mins,
    };
    if (liveRoute.length > 1) {
      const next = [route, ...savedRoutes].slice(0, 20);
      setSavedRoutes(next);
      localStorage.setItem("fitwise_route_history", JSON.stringify(next));
    }
    setCardioDuration("0");
    setCardioIncline("12");
    setLiveRoute([]);
  };

  const startLiveCardio = () => {
    if (isTracking) return;
    setElapsedSec(0);
    setLiveRoute([]);
    setIsTracking(true);
    timerRef.current = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    if ("geolocation" in navigator) {
      gpsRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setLiveRoute((prev) => [
            ...prev,
            {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              t: Date.now(),
            },
          ]);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 },
      );
    }
  };

  const stopLiveCardio = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (gpsRef.current !== null) {
      navigator.geolocation.clearWatch(gpsRef.current);
      gpsRef.current = null;
    }
    setIsTracking(false);
    setCardioDuration(String(Math.max(1, Math.round(elapsedSec / 60))));
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto pl-4 lg:pl-0 pr-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {mode === "home" ? "Home Workout" : "Hypertrophy Program"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            {mode === "home"
              ? "Bodyweight & minimal equipment"
              : mode === "gym"
                ? "Phase 2: Volume Accumulation"
                : "Live cardio tracking with GPS"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/gym/calendar">
            <Button variant="outline" className="rounded-full h-12 px-5 text-xs font-bold">
              Workout Calendar Log
            </Button>
          </Link>
          {mode !== "cardio" && (
            <Button
              onClick={handleStartSession}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-6 h-12 shadow-[0_0_20px_rgba(34,197,94,0.3)] border-none text-xs"
            >
              {checkedIn ? "Session Completed" : "Start Session"}
            </Button>
          )}
        </div>
      </div>

      {/* Home / Gym / Cardio Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex bg-card dark:bg-surface-low border border-border/30 p-1.5 rounded-full max-w-md relative overflow-hidden"
      >
        <button
          onClick={() => setMode("home")}
          className={`flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 relative z-10 ${
            mode === "home"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="w-4 h-4" />
          Home
        </button>
        <button
          onClick={() => setMode("gym")}
          className={`flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 relative z-10 ${
            mode === "gym"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          Gym
        </button>
        <button
          onClick={() => setMode("cardio")}
          className={`flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 relative z-10 ${
            mode === "cardio"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="w-4 h-4" />
          Cardio
        </button>

        {/* Animated Background Pill */}
        <div
          className="absolute top-1.5 bottom-1.5 w-[calc(33.333%-6px)] rounded-full transition-all duration-300 ease-out z-0 bg-primary/10 dark:bg-primary/15 border border-primary/20 dark:border-primary/30"
          style={{
            transform:
              mode === "home"
                ? "translateX(0)"
                : mode === "gym"
                  ? "translateX(100%)"
                  : "translateX(200%)",
            boxShadow: "0 0 15px rgba(34,197,94,0.2)",
          }}
        />
      </motion.div>

      {/* Top Banner Cards */}
      {mode !== "cardio" && (
      <div className="grid grid-cols-1 gap-4">
        {/* Rest Day Focus */}
        <motion.div
          onClick={() => setRestModalOpen(true)}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] bg-card dark:bg-[#111] border border-border/30 overflow-hidden relative min-h-[240px] flex items-end p-8 group cursor-pointer shadow-card"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a251f] to-[#111111] z-0"></div>

          <div className="absolute right-[-10%] top-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/30 transition-colors duration-700"></div>
          <div className="absolute right-10 bottom-10 w-32 h-32 rounded-full border border-primary/30 transform rotate-12 blur-[1px]"></div>
          <div className="absolute right-16 bottom-16 w-24 h-24 rounded-full border-2 border-primary/50 transform rotate-45 blur-[2px]"></div>

          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <Badge
                variant="outline"
                className="border-primary/50 text-white dark:text-primary mb-4 bg-primary/20 dark:bg-primary/10 tracking-widest text-[10px]"
              >
                RECOVERY
              </Badge>
              <h3 className="text-2xl font-black text-white mb-1 tracking-tight">
                Rest Day Focus
              </h3>
              <p className="text-sm text-white/60 font-medium">
                Active recovery and mobility routine.
              </p>
            </div>
            <Button
              variant="outline"
              className="text-white hover:bg-white/10 rounded-full bg-white/5 border border-white/20 shrink-0 font-bold px-6"
            >
              Explore <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>

      </div>
      )}

      {mode === "cardio" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] bg-card dark:bg-surface-low/80 p-6 lg:p-8 border border-border/30 shadow-card space-y-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            {CARDIO_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setCardioType(type.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border ${
                  cardioType === type.id
                    ? "bg-info/10 border-info/40 text-info"
                    : "bg-surface-lowest border-border/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-surface-lowest border border-border/30">
              <p className="text-[10px] uppercase text-muted-foreground font-bold">Time</p>
              <p className="text-lg font-black text-foreground">
                {String(Math.floor(elapsedSec / 60)).padStart(2, "0")}:
                {String(elapsedSec % 60).padStart(2, "0")}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-surface-lowest border border-border/30">
              <p className="text-[10px] uppercase text-muted-foreground font-bold">Calories</p>
              <p className="text-lg font-black text-info">{calculateCardioCalories()}</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-lowest border border-border/30">
              <p className="text-[10px] uppercase text-muted-foreground font-bold">Distance</p>
              <p className="text-lg font-black text-foreground">{calcDistanceKm(liveRoute)} km</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-lowest border border-border/30">
              <p className="text-[10px] uppercase text-muted-foreground font-bold">GPS</p>
              <p className="text-lg font-black text-foreground">{liveRoute.length} pts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                Incline (%)
              </p>
              <Input
                type="number"
                value={cardioIncline}
                onChange={(e) => setCardioIncline(e.target.value)}
                className="bg-surface-lowest border-border/40"
                disabled={cardioType !== "incline_walk"}
              />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                Speed (km/h)
              </p>
              <Input
                type="number"
                value={cardioSpeed}
                onChange={(e) => setCardioSpeed(e.target.value)}
                className="bg-surface-lowest border-border/40"
                disabled={cardioType !== "incline_walk"}
              />
            </div>
          </div>

          <MiniRouteMap points={liveRoute} />

          <div className="flex flex-wrap gap-3">
            {isTracking ? (
              <Button onClick={stopLiveCardio} variant="destructive" className="rounded-xl">
                <Square className="h-4 w-4 mr-2" /> Stop Live Session
              </Button>
            ) : (
              <Button onClick={startLiveCardio} className="rounded-xl bg-info hover:bg-info/90 text-info-foreground">
                <Play className="h-4 w-4 mr-2" /> Start Live Session
              </Button>
            )}
            <Button onClick={handleLogCardio} variant="outline" className="rounded-xl">
              Save Cardio Log
            </Button>
          </div>
        </motion.div>
      )}

      {/* Workout Builder Main Section */}
      {mode !== "cardio" && (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-[2rem] bg-card dark:bg-surface-low/80 p-6 lg:p-8 border border-border/30 shadow-card"
      >
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Workout Builder
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Configure your weekly {mode === "home" ? "home" : "gym"} routine
            </p>
          </div>

          {/* Day Tabs */}
          <div className="flex gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDay === day;
              const isRest = restDays[day];
              const label = DAY_LABELS[day].charAt(0);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                      : isRest
                        ? "bg-transparent text-muted-foreground/30 hover:bg-foreground/5 dark:hover:bg-white/5"
                        : "bg-surface dark:bg-surface-high text-muted-foreground hover:bg-foreground/10 dark:hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Exercise List */}
        <div className="space-y-3">
          {restDays[selectedDay] ? (
            <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
              <Moon className="h-8 w-8 mb-4 text-muted-foreground" />
              <p className="font-bold text-foreground">Rest Day Scheduled</p>
              <p className="text-xs text-muted-foreground mt-1">
                Focus on recovery and mobility.
              </p>
            </div>
          ) : (
            <>
              {dayExercises.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center opacity-50 border border-dashed border-border/30 rounded-xl bg-surface-lowest">
                  <p className="font-bold text-foreground">No Exercises Added</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click below to start building your routine for this day.
                  </p>
                </div>
              ) : (
                dayExercises.map((ex) => (
                  <ExerciseRow
                    key={ex.instanceId}
                    name={ex.name}
                    sets={ex.sets || "3"}
                    repRange={ex.repRange || ex.reps || "10-12"}
                    weight={ex.weight || ""}
                    type={ex.muscle}
                    onRemove={() => handleRemoveExercise(ex.instanceId)}
                    onUpdate={(updates) => handleUpdateExercise(ex.instanceId, updates)}
                  />
                ))
              )}

              <Button
                onClick={() => setBuilderOpen(true)}
                variant="outline"
                className="w-full rounded-xl border-dashed border-border/40 bg-transparent hover:bg-foreground/5 dark:hover:bg-white/5 py-6 mt-4 opacity-50 hover:opacity-100 transition-opacity text-foreground"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Exercise
              </Button>
            </>
          )}
        </div>
      </motion.div>
      )}

      {/* Modals */}
      <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogContent className="sm:max-w-md bg-card dark:bg-surface-low border-border/30 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              {mode === "home" ? (
                <Home className="h-5 w-5 text-primary" />
              ) : (
                <Dumbbell className="h-5 w-5 text-primary" />
              )}
              {mode === "home" ? "Home Exercises" : "Gym Exercises"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${mode} exercises...`}
                value={searchEx}
                onChange={(e) => setSearchEx(e.target.value)}
                className="pl-10 h-12 rounded-xl bg-surface-lowest dark:bg-surface-lowest border-border/40"
                autoFocus
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 scrollbar-thin">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExercise(ex)}
                  className="p-3 rounded-xl bg-surface-lowest dark:bg-surface border border-border/30 flex items-center justify-between cursor-pointer hover:border-primary/50 group transition-all"
                >
                  <div>
                    <p className="font-bold text-sm text-foreground">
                      {ex.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {ex.muscle} • {ex.equipment}
                    </p>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
              ))}
              {searchEx && filteredExercises.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No {mode} exercises found.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={restModalOpen} onOpenChange={setRestModalOpen}>
        <DialogContent className="sm:max-w-md bg-card dark:bg-surface-low border-border/30 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Rest Day Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Select days to mark as rest days. Rest days focus on active
              recovery instead of hypertrophy.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <Button
                  key={day}
                  variant="outline"
                  onClick={() => toggleRestDay(day)}
                  className={`justify-start h-12 rounded-xl border-border/30 ${
                    restDays[day]
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-surface-lowest text-muted-foreground hover:bg-surface-high/50"
                  }`}
                >
                  {restDays[day] ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <div className="w-4 h-4 mr-2" />
                  )}
                  {DAY_LABELS[day]}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ──────────────────────────────────────────────
// STYLED EXERCISE ROW
// ──────────────────────────────────────────────
function ExerciseRow({ name, sets, repRange, weight, type, onRemove, onUpdate }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-surface-low dark:bg-surface hover:bg-surface-high dark:hover:bg-surface-high transition-colors border border-border/30 dark:border-transparent group">
      <div className="flex items-center gap-4 mb-3 sm:mb-0">
        {/* Grab handle */}
        <div className="flex flex-col gap-[2px] opacity-20 group-hover:opacity-100 transition-opacity cursor-grab">
          <div className="w-1 h-1 rounded-full bg-foreground dark:bg-white"></div>
          <div className="w-1 h-1 rounded-full bg-foreground dark:bg-white"></div>
          <div className="w-1 h-1 rounded-full bg-foreground dark:bg-white"></div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/70"></div>
            <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
              {type}
            </span>
          </div>
          <p className="text-sm font-bold text-foreground">{name}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-8 sm:pl-0">
        <div className="px-2 py-1.5 rounded-lg border border-border/30 bg-surface-lowest flex items-center justify-center min-w-[70px]">
          <input 
            type="number" 
            value={sets} 
            onChange={(e) => onUpdate?.({ sets: e.target.value })} 
            className="w-8 bg-transparent outline-none text-xs font-bold text-foreground dark:text-white text-right font-sans" 
            readOnly={!onUpdate}
          />
          <span className="text-foreground/50 dark:text-white/50 font-medium text-xs ml-1">Sets</span>
        </div>
        <div className="px-2 py-1.5 rounded-lg border border-border/30 bg-surface-lowest flex items-center justify-center min-w-[80px]">
          <input 
            type="text" 
            value={repRange} 
            onChange={(e) => onUpdate?.({ repRange: e.target.value })} 
            className="w-10 bg-transparent outline-none text-xs font-bold text-foreground dark:text-white text-right font-sans" 
            readOnly={!onUpdate}
          />
          <span className="text-foreground/50 dark:text-white/50 font-medium text-xs ml-1">Reps</span>
        </div>
        <div className="px-2 py-1.5 rounded-lg border border-border/30 bg-surface-lowest flex items-center justify-center min-w-[60px]">
          <input 
            type="text" 
            value={weight} 
            placeholder="-"
            onChange={(e) => onUpdate?.({ weight: e.target.value })} 
            className="w-8 bg-transparent outline-none text-xs font-bold text-primary text-right uppercase" 
            readOnly={!onUpdate}
          />
          <span className="text-foreground/50 dark:text-white/50 font-medium text-[10px] ml-1">KG</span>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
