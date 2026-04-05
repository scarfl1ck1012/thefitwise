import { useState, useMemo, useEffect } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useUserStats } from "@/hooks/useUserStats";
import {
  gymExercises,
  DAYS_OF_WEEK,
  DAY_LABELS,
} from "@/lib/gymExercises";
import { getLocalDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ArrowRight,
  Moon,
  Search,
  Check,
  X,
  Home,
  Dumbbell,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const emptyWeek = () => ({
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
});

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

  const [zone2Min, setZone2Min] = useState(() =>
    parseInt(localStorage.getItem("fitwise_zone2") || "45")
  );
  const [hiitMin, setHiitMin] = useState(() =>
    parseInt(localStorage.getItem("fitwise_hiit") || "15")
  );

  const handleZone2Click = () => {
    const newMin = zone2Min >= 90 ? 0 : zone2Min + 15;
    setZone2Min(newMin);
    localStorage.setItem("fitwise_zone2", newMin.toString());
  };

  const handleHiitClick = () => {
    const newMin = hiitMin >= 45 ? 0 : hiitMin + 5;
    setHiitMin(newMin);
    localStorage.setItem("fitwise_hiit", newMin.toString());
  };

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

  const dayExercises = weeklyPlan[selectedDay] || [];

  // Filter exercises in builder by mode AND search
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

  // Default placeholder exercises filtered by mode
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
    addXP.mutate(25);
    toast.success("Session Started! +25 XP");
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
              : "Phase 2: Volume Accumulation"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleStartSession}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-6 h-12 shadow-[0_0_20px_rgba(34,197,94,0.3)] border-none text-xs"
          >
            {checkedIn ? "Session Completed" : "Start Session"}
          </Button>
        </div>
      </div>

      {/* Home / Gym Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex bg-surface-low border border-border/30 p-1.5 rounded-full max-w-xs relative overflow-hidden"
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

        {/* Animated Background Pill */}
        <div
          className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full transition-all duration-300 ease-out z-0 bg-primary/15 border border-primary/30"
          style={{
            transform:
              mode === "gym" ? "translateX(100%)" : "translateX(0)",
            boxShadow: "0 0 15px rgba(34,197,94,0.2)",
          }}
        />
      </motion.div>

      {/* Top Banner Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Rest Day Focus */}
        <motion.div
          onClick={() => setRestModalOpen(true)}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-[2rem] bg-surface-low border border-border/30 overflow-hidden relative min-h-[240px] flex items-end p-8 group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1610] to-[#111111] z-0"></div>

          <div className="absolute right-[-10%] top-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/30 transition-colors duration-700"></div>
          <div className="absolute right-10 bottom-10 w-32 h-32 rounded-full border border-primary/30 transform rotate-12 blur-[1px]"></div>
          <div className="absolute right-16 bottom-16 w-24 h-24 rounded-full border-2 border-primary/50 transform rotate-45 blur-[2px]"></div>

          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <Badge
                variant="outline"
                className="border-primary/50 text-primary mb-4 bg-primary/10 tracking-widest text-[10px]"
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
              className="text-white hover:bg-white/10 rounded-full bg-white/5 border border-border/40 shrink-0 font-bold px-6"
            >
              Explore <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Cardiovascular Conditioning */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 rounded-[2rem] bg-surface-low p-6 lg:p-8 border border-border/30 flex flex-col relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[40px]"></div>

          <div className="relative z-10">
            <h3 className="font-bold text-foreground text-sm">
              Cardiovascular Conditioning
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 tracking-widest uppercase">
              Weekly targets
            </p>
          </div>

          <div className="flex justify-around items-center flex-1 mt-6 relative z-10">
            {/* Ring 1 - Zone 2 */}
            <div
              className="flex flex-col items-center gap-3 cursor-pointer group"
              onClick={handleZone2Click}
            >
              <div className="relative w-[84px] h-[84px] group-hover:scale-105 transition-transform">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="42"
                    cy="42"
                    r="36"
                    fill="none"
                    className="stroke-surface-high"
                    strokeWidth="6"
                  />
                  <circle
                    cx="42"
                    cy="42"
                    r="36"
                    fill="none"
                    className="stroke-primary transition-all duration-500"
                    strokeWidth="6"
                    strokeDasharray="226"
                    strokeDashoffset={226 - (zone2Min / 90) * 226}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-foreground">
                    {zone2Min}
                  </span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                    Min
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-foreground tracking-widest uppercase group-hover:text-primary transition-colors">
                Zone 2
              </span>
            </div>

            {/* Ring 2 - HIIT */}
            <div
              className="flex flex-col items-center gap-3 cursor-pointer group"
              onClick={handleHiitClick}
            >
              <div className="relative w-[84px] h-[84px] group-hover:scale-105 transition-transform">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="42"
                    cy="42"
                    r="36"
                    fill="none"
                    className="stroke-surface-high"
                    strokeWidth="6"
                  />
                  <circle
                    cx="42"
                    cy="42"
                    r="36"
                    fill="none"
                    className="stroke-accent transition-all duration-500"
                    strokeWidth="6"
                    strokeDasharray="226"
                    strokeDashoffset={226 - (hiitMin / 45) * 226}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-foreground">
                    {hiitMin}
                  </span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                    Min
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-accent group-hover:brightness-125 transition-all">
                HIIT
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Workout Builder Main Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-[2rem] bg-surface-low/80 p-6 lg:p-8 border border-border/30"
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
                        ? "bg-transparent text-muted-foreground/30 hover:bg-white/5"
                        : "bg-surface-high text-muted-foreground hover:bg-white/10"
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
                <>
                  {defaultExercises.map((ex, idx) => (
                    <ExerciseRow
                      key={idx}
                      name={ex.name}
                      sets={ex.sets}
                      repRange={ex.repRange}
                      weight={ex.weight}
                      type={ex.type}
                    />
                  ))}
                </>
              ) : (
                dayExercises.map((ex) => (
                  <ExerciseRow
                    key={ex.instanceId}
                    name={ex.name}
                    sets={String(ex.sets || "3")}
                    repRange={String(ex.reps || "10-12")}
                    weight={mode === "home" ? "BW" : "-"}
                    type={ex.muscle}
                    onRemove={() => handleRemoveExercise(ex.instanceId)}
                  />
                ))
              )}

              <Button
                onClick={() => setBuilderOpen(true)}
                variant="outline"
                className="w-full rounded-xl border-dashed border-border/40 bg-transparent hover:bg-white/5 py-6 mt-4 opacity-50 hover:opacity-100 transition-opacity"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Exercise
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogContent className="sm:max-w-md bg-surface-low border-border/30 rounded-[2rem]">
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
                className="pl-10 h-12 rounded-xl bg-surface-lowest border-border/40"
                autoFocus
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 scrollbar-thin">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExercise(ex)}
                  className="p-3 rounded-xl bg-surface border border-border/30 flex items-center justify-between cursor-pointer hover:border-primary/50 group transition-all"
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
        <DialogContent className="sm:max-w-md bg-surface-low border-border/30 rounded-[2rem]">
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
                      : "bg-surface-lowest text-muted-foreground hover:bg-surface"
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
function ExerciseRow({ name, sets, repRange, weight, type, onRemove }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-surface hover:bg-surface-high transition-colors border border-transparent group">
      <div className="flex items-center gap-4 mb-3 sm:mb-0">
        {/* Grab handle */}
        <div className="flex flex-col gap-[2px] opacity-20 group-hover:opacity-100 transition-opacity cursor-grab">
          <div className="w-1 h-1 rounded-full bg-white"></div>
          <div className="w-1 h-1 rounded-full bg-white"></div>
          <div className="w-1 h-1 rounded-full bg-white"></div>
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
        <div className="px-3 py-1.5 rounded-lg border border-border/30 bg-surface-lowest flex items-center justify-center">
          <span className="text-xs font-bold text-white">
            {sets}{" "}
            <span className="text-white/50 font-medium">Sets</span>
          </span>
        </div>
        <div className="px-3 py-1.5 rounded-lg border border-border/30 bg-surface-lowest flex items-center justify-center">
          <span className="text-xs font-bold text-white">
            {repRange}{" "}
            <span className="text-white/50 font-medium">Reps</span>
          </span>
        </div>
        <div className="px-3 py-1.5 rounded-lg border border-border/30 bg-surface-lowest flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{weight}</span>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
