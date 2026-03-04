import { useState, useMemo, useCallback } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useProfile } from "@/hooks/useProfile";
import { useUserStats } from "@/hooks/useUserStats";
import { useAccurateTimer } from "@/hooks/useAccurateTimer";
import {
  gymExercises,
  cardioTypes,
  estimateCalories,
  aiWorkoutTemplates,
  DAYS_OF_WEEK,
  DAY_LABELS,
} from "@/lib/gymExercises";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  CheckCircle2,
  Timer,
  Play,
  Pause,
  Square,
  Plus,
  Search,
  Zap,
  X,
  ChevronRight,
  Trash2,
  Moon,
  Sparkles,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

// ──────────────────────────────────────────────
// SECTION 1: CHECK-IN
// ──────────────────────────────────────────────

function CheckInSection({ checkins, addCheckin, addXP }) {
  const today = new Date().toISOString().split("T")[0];
  const checkedIn = checkins.some((c) => c.logged_at === today);

  const handleCheckIn = () => {
    addCheckin.mutate({
      workout_type: "gym",
      duration_min: 60,
      notes: "Gym session",
    });
    addXP.mutate(25);
    toast.success("Checked in! +25 XP");
  };

  return (
    <Card className="shadow-card border-primary/20">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${checkedIn ? "bg-success/15" : "bg-primary/10"}`}
          >
            {checkedIn ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <Dumbbell className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {checkedIn ? "You're checked in today!" : "Mark today's check-in"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {checkedIn
                ? "Keep up the consistency"
                : "Log your gym session for XP and streak"}
            </p>
          </div>
        </div>
        {!checkedIn && (
          <Button size="sm" onClick={handleCheckIn} className="gap-1.5 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5" /> Check In
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────
// SECTION 2: LIVE TIMER
// ──────────────────────────────────────────────

function LiveTimer({ onComplete }) {
  const timer = useAccurateTimer();

  const handleEnd = () => {
    const mins = timer.minutes;
    timer.reset();
    onComplete(mins);
    toast.success(`Workout ended: ${mins} minutes logged`);
  };

  if (!timer.isRunning && timer.totalSeconds === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={timer.start}
        className="gap-1.5 text-xs"
      >
        <Timer className="h-3.5 w-3.5" /> Start Live Timer
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/30 bg-primary/5 p-4"
    >
      <p className="text-[10px] text-muted-foreground text-center mb-2">
        Active Session
      </p>
      <motion.p
        className="text-3xl font-mono font-bold text-center text-foreground tracking-widest"
        animate={
          timer.isRunning
            ? {
                textShadow: [
                  "0 0 8px hsl(var(--primary)/0.3)",
                  "0 0 16px hsl(var(--primary)/0.5)",
                  "0 0 8px hsl(var(--primary)/0.3)",
                ],
              }
            : {}
        }
        transition={timer.isRunning ? { duration: 2, repeat: Infinity } : {}}
      >
        {timer.formatted}
      </motion.p>
      <div className="flex items-center justify-center gap-2 mt-3">
        {timer.isRunning ? (
          <Button
            variant="outline"
            size="sm"
            onClick={timer.pause}
            className="gap-1 text-xs"
          >
            <Pause className="h-3 w-3" /> Pause
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={timer.resume}
            className="gap-1 text-xs"
          >
            <Play className="h-3 w-3" /> Resume
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          onClick={handleEnd}
          className="gap-1 text-xs"
        >
          <Square className="h-3 w-3" /> End Workout
        </Button>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// SECTION 3: CARDIO TRACKER
// ──────────────────────────────────────────────

function CardioTracker({ profile }) {
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [calories, setCalories] = useState("");

  const weekMinutes = sessions.reduce((s, ses) => s + ses.duration, 0);
  const weeklyGoal = 150;

  const selectedCardio = cardioTypes.find((c) => c.id === selectedType);
  const estCalories =
    selectedCardio && duration
      ? estimateCalories(
          selectedCardio.met,
          profile?.weight_kg,
          parseInt(duration),
        )
      : 0;

  const handleSave = () => {
    if (!selectedType || !duration) {
      toast.error("Select a type and enter duration");
      return;
    }
    const cal = parseInt(calories) || estCalories;
    setSessions((prev) => [
      {
        id: crypto.randomUUID(),
        type: selectedType,
        label: selectedCardio?.label,
        icon: selectedCardio?.icon,
        duration: parseInt(duration),
        distance: parseFloat(distance) || 0,
        calories: cal,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      },
      ...prev,
    ]);
    toast.success("Cardio session logged!");
    setSelectedType("");
    setDuration("");
    setDistance("");
    setCalories("");
    setShowForm(false);
  };

  const handleTimerComplete = (mins) => {
    setDuration(String(mins));
    setShowForm(true);
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary" /> Cardio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Weekly overview */}
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">
              Active Minutes This Week
            </span>
            <span className="text-sm font-bold text-foreground">
              {weekMinutes}/{weeklyGoal}
            </span>
          </div>
          <Progress
            value={Math.min((weekMinutes / weeklyGoal) * 100, 100)}
            className="h-2"
          />
          <p className="text-[9px] text-muted-foreground mt-1">
            AHA recommends 150 min/week
          </p>
        </div>

        {/* Live timer */}
        <LiveTimer onComplete={handleTimerComplete} />

        {/* Log button / Form */}
        {!showForm ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="w-full gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Log Cardio Session
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 border border-border rounded-lg p-3"
          >
            {/* Type chips */}
            <div>
              <Label className="text-xs">Type</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {cardioTypes.map((ct) => (
                  <button
                    key={ct.id}
                    onClick={() => setSelectedType(ct.id)}
                    className={`px-2.5 py-1.5 rounded-full text-xs flex items-center gap-1 border transition-all ${
                      selectedType === ct.id
                        ? "border-primary bg-primary/10 text-foreground shadow-[0_0_8px_hsl(var(--primary)/0.2)]"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-muted-foreground/40"
                    }`}
                  >
                    <span>{ct.icon}</span> {ct.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Inputs */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px]">Duration (min) *</Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px]">Distance (km)</Label>
                <Input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="5"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px]">Calories</Label>
                <Input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="Auto"
                  className="h-8 text-xs"
                />
                {!calories && estCalories > 0 && (
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    Est: ~{estCalories} kcal
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                className="gap-1 text-xs flex-1"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Session history */}
        {sessions.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground font-medium">
              Recent Sessions
            </p>
            {sessions.map((ses) => (
              <div
                key={ses.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">
                  {ses.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">
                    {ses.label}
                  </p>
                  <p className="text-[9px] text-muted-foreground">{ses.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">
                    {ses.duration} min
                  </p>
                  <p className="text-[9px] text-primary">{ses.calories} kcal</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────
// SECTION 4: WORKOUT BUILDER
// ──────────────────────────────────────────────

const emptyWeek = () => ({
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
});

function WorkoutBuilder({ profile }) {
  const [mode, setMode] = useState("gym"); // "gym" | "home"
  const [weeklyPlan, setWeeklyPlan] = useState(emptyWeek());
  const [restDays, setRestDays] = useState({ wednesday: true, sunday: true });
  const [selectedDay, setSelectedDay] = useState("monday");
  const [search, setSearch] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [aiGoal, setAiGoal] = useState("strength");
  const [aiDays, setAiDays] = useState("5");
  const [aiInjuries, setAiInjuries] = useState("");

  // Search exercises
  const filteredExercises = useMemo(() => {
    if (!search || search.length < 2) return [];
    const q = search.toLowerCase();
    return gymExercises
      .filter((e) => (mode === "home" ? e.type === "home" : true))
      .filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.muscle.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [search, mode]);

  // Add exercise to a day with UUID instance
  const addExercise = useCallback((day, exercise) => {
    const instance = {
      instanceId: crypto.randomUUID(),
      exerciseId: exercise.id,
      name: exercise.name,
      muscle: exercise.muscle,
      sets: 3,
      reps: 10,
    };
    setWeeklyPlan((prev) => ({
      ...prev,
      [day]: [...prev[day], instance],
    }));
    setSearch("");
    toast.success(`${exercise.name} added to ${DAY_LABELS[day]}`);
  }, []);

  // Remove exercise
  const removeExercise = useCallback((day, instanceId) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [day]: prev[day].filter((e) => e.instanceId !== instanceId),
    }));
  }, []);

  // Add custom exercise
  const addCustomExercise = useCallback((day, name) => {
    const instance = {
      instanceId: crypto.randomUUID(),
      exerciseId: `custom-${Date.now()}`,
      name: name,
      muscle: "Custom",
      sets: 3,
      reps: 10,
    };
    setWeeklyPlan((prev) => ({
      ...prev,
      [day]: [...prev[day], instance],
    }));
    setSearch("");
    toast.success(`Custom exercise added to ${DAY_LABELS[day]}`);
  }, []);

  // Update sets/reps
  const updateExercise = useCallback((day, instanceId, field, value) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [day]: prev[day].map((e) =>
        e.instanceId === instanceId
          ? { ...e, [field]: parseInt(value) || 0 }
          : e,
      ),
    }));
  }, []);

  // Toggle rest day
  const toggleRestDay = useCallback(
    (day) => {
      setRestDays((prev) => ({ ...prev, [day]: !prev[day] }));
      if (!restDays[day]) {
        setWeeklyPlan((prev) => ({ ...prev, [day]: [] }));
      }
    },
    [restDays],
  );

  // Move exercise between days (drag-and-drop logic, using buttons for now)
  const moveExercise = useCallback((fromDay, toDay, instanceId) => {
    setWeeklyPlan((prev) => {
      const fromArr = [...prev[fromDay]];
      const toArr = [...prev[toDay]];
      const idx = fromArr.findIndex((e) => e.instanceId === instanceId);
      if (idx === -1) return prev;
      const [item] = fromArr.splice(idx, 1);
      toArr.push(item);
      return { ...prev, [fromDay]: fromArr, [toDay]: toArr };
    });
    toast.success(`Moved to ${DAY_LABELS[toDay]}`);
  }, []);

  // AI Generate
  const generateAIPlan = () => {
    const template = aiWorkoutTemplates[aiGoal] || aiWorkoutTemplates.strength;
    const newPlan = {};
    const newRest = {};
    for (const day of DAYS_OF_WEEK) {
      const exercises = template[day] || [];
      newRest[day] = exercises.length === 0;
      newPlan[day] = exercises.map((e) => ({
        instanceId: crypto.randomUUID(),
        exerciseId: gymExercises.find((g) => g.name === e.name)?.id || 0,
        name: e.name,
        muscle: gymExercises.find((g) => g.name === e.name)?.muscle || "",
        sets: e.sets,
        reps: e.reps,
      }));
    }
    setWeeklyPlan(newPlan);
    setRestDays(newRest);
    setShowAI(false);
    toast.success("AI workout plan generated!");
  };

  const dayExercises = weeklyPlan[selectedDay] || [];

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-primary" /> Workout Plan
          </CardTitle>
          {/* Home / Gym toggle */}
          <div className="flex bg-muted rounded-lg p-0.5">
            {["home", "gym"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 text-xs rounded-md transition-all ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                {m === "home" ? "Home" : "Gym"}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* AI Generate button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAI(true)}
          className="w-full gap-2 text-xs border-primary/30 hover:bg-primary/5 relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Sparkles className="h-3.5 w-3.5 text-primary relative z-10" />
          <span className="relative z-10">Generate AI Plan</span>
        </Button>

        {/* Day tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                selectedDay === day
                  ? "bg-primary text-primary-foreground"
                  : restDays[day]
                    ? "bg-muted/50 text-muted-foreground/60 line-through"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {DAY_LABELS[day]}
              {weeklyPlan[day].length > 0 && (
                <span className="ml-1 text-[9px] opacity-70">
                  ({weeklyPlan[day].length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Rest day toggle */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Rest Day</span>
          </div>
          <button
            onClick={() => toggleRestDay(selectedDay)}
            className={`w-10 h-5 rounded-full transition-colors relative ${restDays[selectedDay] ? "bg-primary" : "bg-muted"}`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${restDays[selectedDay] ? "left-5" : "left-0.5"}`}
            />
          </button>
        </div>

        {/* Exercises for selected day */}
        {!restDays[selectedDay] && (
          <>
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${mode} exercises...`}
                className="pl-8 h-8 text-xs"
              />
            </div>

            {/* Search results */}
            <AnimatePresence>
              {search.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 max-h-48 overflow-y-auto mb-3"
                >
                  {filteredExercises.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => addExercise(selectedDay, ex)}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="h-3 w-3 text-primary" />
                        <span className="text-xs text-foreground">
                          {ex.name}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[9px]">
                        {ex.muscle}
                      </Badge>
                    </button>
                  ))}
                  <button
                    onClick={() => addCustomExercise(selectedDay, search)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20 mt-1"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-3 w-3 text-primary" />
                      <span className="text-xs text-primary font-medium">
                        Add "{search}"
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[9px] border-primary/30 text-primary"
                    >
                      Custom
                    </Badge>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Exercise list */}
            <div className="space-y-1.5">
              {dayExercises.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No exercises added. Search above to add.
                </p>
              )}
              {dayExercises.map((ex, idx) => (
                <motion.div
                  key={ex.instanceId}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card"
                >
                  <span className="text-[10px] text-muted-foreground w-4">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {ex.name}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {ex.muscle}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={ex.sets}
                      onChange={(e) =>
                        updateExercise(
                          selectedDay,
                          ex.instanceId,
                          "sets",
                          e.target.value,
                        )
                      }
                      className="w-10 h-6 text-[10px] text-center p-0"
                    />
                    <span className="text-[9px] text-muted-foreground">x</span>
                    <Input
                      type="number"
                      value={ex.reps}
                      onChange={(e) =>
                        updateExercise(
                          selectedDay,
                          ex.instanceId,
                          "reps",
                          e.target.value,
                        )
                      }
                      className="w-10 h-6 text-[10px] text-center p-0"
                    />
                  </div>
                  {/* Move to another day */}
                  <select
                    className="h-6 text-[9px] bg-muted text-muted-foreground border-none rounded px-1"
                    value=""
                    onChange={(e) => {
                      if (e.target.value)
                        moveExercise(
                          selectedDay,
                          e.target.value,
                          ex.instanceId,
                        );
                    }}
                  >
                    <option value="">Move</option>
                    {DAYS_OF_WEEK.filter(
                      (d) => d !== selectedDay && !restDays[d],
                    ).map((d) => (
                      <option key={d} value={d}>
                        {DAY_LABELS[d]}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeExercise(selectedDay, ex.instanceId)}
                    className="p-1 hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="h-3 w-3 text-destructive/60" />
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {restDays[selectedDay] && (
          <div className="text-center py-6">
            <Moon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Rest Day</p>
            <p className="text-[10px] text-muted-foreground/60">
              Recovery is part of the plan
            </p>
          </div>
        )}
      </CardContent>

      {/* AI Modal */}
      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowAI(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl w-full max-w-sm p-5 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> AI Workout Plan
                </h3>
                <button onClick={() => setShowAI(false)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Primary Goal</Label>
                  <div className="flex gap-2 mt-1.5">
                    {[
                      { v: "strength", l: "Build Muscle" },
                      { v: "lose", l: "Lose Fat" },
                    ].map((o) => (
                      <button
                        key={o.v}
                        onClick={() => setAiGoal(o.v)}
                        className={`flex-1 p-2 rounded-lg text-xs border transition-all ${aiGoal === o.v ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"}`}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Days per week</Label>
                  <div className="flex gap-1.5 mt-1.5">
                    {["3", "4", "5", "6"].map((d) => (
                      <button
                        key={d}
                        onClick={() => setAiDays(d)}
                        className={`w-9 h-9 rounded-lg text-xs font-medium border transition-all ${aiDays === d ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">
                    Injuries or limitations (optional)
                  </Label>
                  <Input
                    value={aiInjuries}
                    onChange={(e) => setAiInjuries(e.target.value)}
                    placeholder="e.g., bad knee, shoulder pain"
                    className="h-8 text-xs mt-1.5"
                  />
                </div>
              </div>

              <Button onClick={generateAIPlan} className="w-full gap-2 text-xs">
                <Zap className="h-3.5 w-3.5" /> Generate Plan
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ──────────────────────────────────────────────
// MAIN PAGE
// ──────────────────────────────────────────────

export default function GymPage() {
  const { checkins, addCheckin } = useWorkouts();
  const { profile } = useProfile();
  const { addXP } = useUserStats();

  const fadeUp = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gym</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your training command center
        </p>
      </div>

      {/* Check-in */}
      <motion.div {...fadeUp}>
        <CheckInSection
          checkins={checkins}
          addCheckin={addCheckin}
          addXP={addXP}
        />
      </motion.div>

      {/* Cardio Tracker */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
        <CardioTracker profile={profile} />
      </motion.div>

      {/* Workout Builder */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <WorkoutBuilder profile={profile} />
      </motion.div>
    </div>
  );
}
