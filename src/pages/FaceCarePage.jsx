import { useState, useEffect, useRef } from "react";
import { faceExercises } from "@/lib/workoutData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Sun,
  Moon,
  Timer,
  Play,
  Square,
  ChevronDown,
  Camera,
  Check,
} from "lucide-react";
import LivePractice from "@/components/LivePractice";

// --- Skincare Data ---
const morningRoutine = [
  {
    id: "am-1",
    step: 1,
    title: "Cleanser",
    desc: "Gentle face wash to remove dirt and oil",
    tip: "Use lukewarm water, not hot",
  },
  {
    id: "am-2",
    step: 2,
    title: "Toner",
    desc: "Balance skin pH and prep for products",
    tip: "Pat gently, don't rub",
  },
  {
    id: "am-3",
    step: 3,
    title: "Vitamin C Serum",
    desc: "Brightens skin and fights free radicals",
    tip: "Apply before moisturizer",
  },
  {
    id: "am-4",
    step: 4,
    title: "Moisturizer",
    desc: "Hydrate and lock in previous products",
    tip: "Apply while skin is still slightly damp",
  },
  {
    id: "am-5",
    step: 5,
    title: "Sunscreen SPF 30+",
    desc: "Protect from UV damage and aging",
    tip: "Reapply every 2 hours if outdoors",
  },
  {
    id: "am-6",
    step: 6,
    title: "Eye Cream",
    desc: "Hydrate under-eye area, reduce dark circles",
    tip: "Use ring finger, lightest pressure",
  },
  {
    id: "am-7",
    step: 7,
    title: "Lip Balm with SPF",
    desc: "Protect and moisturize lips",
    tip: "Reapply throughout the day",
  },
];

const eveningRoutine = [
  {
    id: "pm-1",
    step: 1,
    title: "Cleanser",
    desc: "Gentle face wash to remove dirt and oil",
    tip: "Use lukewarm water, not hot",
  },
  {
    id: "pm-2",
    step: 2,
    title: "Toner",
    desc: "Balance skin pH and prep for products",
    tip: "Pat gently, don't rub",
  },
  {
    id: "pm-3",
    step: 3,
    title: "Retinol / Retinoid",
    desc: "Anti-aging, reduces acne and dark spots",
    tip: "Start 2x/week, build tolerance",
  },
  {
    id: "pm-4",
    step: 4,
    title: "Moisturizer",
    desc: "Hydrate and lock in previous products",
    tip: "Apply while skin is still slightly damp",
  },
  {
    id: "pm-5",
    step: 5,
    title: "Eye Cream",
    desc: "Hydrate under-eye area, reduce dark circles",
    tip: "Use ring finger, lightest pressure",
  },
];

// --- Exercise Timer Hook ---
function useTimer(totalSeconds) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const start = () => {
    setRemaining(totalSeconds);
    setRunning(true);
  };
  const stop = () => {
    setRunning(false);
  };
  const reset = () => {
    setRunning(false);
    setRemaining(totalSeconds);
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${minutes}:${String(seconds).padStart(2, "0")}`;
  const progress =
    totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

  return {
    remaining,
    running,
    display,
    progress,
    start,
    stop,
    reset,
    finished: remaining === 0,
  };
}

// --- Completion Pop Animation ---
function CompletionBurst({ active }) {
  if (!active) return null;
  return (
    <motion.div
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 2.5, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute inset-0 rounded-full bg-primary/30 pointer-events-none"
    />
  );
}

// --- Exercise Card Component ---
function ExerciseCard({
  ex,
  index,
  isExpanded,
  onToggleExpand,
  isDone,
  onToggleComplete,
}) {
  const timer = useTimer(ex.timerSeconds || 60);
  const [showAR, setShowAR] = useState(false);
  const [showBurst, setShowBurst] = useState(false);

  const handleComplete = () => {
    if (!isDone) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 600);
    }
    onToggleComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      layout
    >
      <Card
        className={`shadow-card transition-all overflow-hidden ${isDone ? "border-success/30 bg-success/5" : ""} ${isExpanded ? "border-primary/20" : ""}`}
      >
        <CardContent className="p-0">
          {/* Collapsed Header — always visible */}
          <button
            className="w-full p-4 text-left flex items-start gap-3"
            onClick={onToggleExpand}
          >
            {/* Animated Checkbox */}
            <button
              type="button"
              className="relative mt-0.5 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleComplete();
              }}
            >
              <motion.div
                animate={isDone ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Checkbox checked={isDone} className="pointer-events-none" />
              </motion.div>
              <CompletionBurst active={showBurst} />
            </button>

            {/* Exercise Thumbnail */}
            <div className="w-10 h-10 rounded-lg bg-primary/10 overflow-hidden shrink-0">
              {ex.image ? (
                <img
                  src={ex.image}
                  alt={ex.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-lg">
                  {ex.icon || "🏋️"}
                </span>
              )}
            </div>

            {/* Exercise Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`text-sm font-medium truncate ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}
                >
                  {ex.name}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {ex.duration}
                  </Badge>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {ex.description}
              </p>
            </div>
          </button>

          {/* Expanded Detail */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                  {/* Demonstration Image */}
                  {ex.image && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="rounded-lg overflow-hidden border border-border bg-muted/30"
                    >
                      <img
                        src={ex.image}
                        alt={`How to do ${ex.name}`}
                        className="w-full h-48 object-contain"
                      />
                      <div className="px-3 py-1.5 bg-muted/50 border-t border-border">
                        <p className="text-[10px] text-muted-foreground text-center">
                          Visual guide -- {ex.name}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Target muscles */}
                  {ex.target && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">
                        Target:
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {ex.target}
                      </Badge>
                    </div>
                  )}

                  {/* Step-by-step instructions */}
                  {ex.steps && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-foreground">
                        How to perform:
                      </p>
                      {ex.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2.5 pl-1">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Timer */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-foreground font-mono">
                          {timer.display}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {!timer.running && !timer.finished && (
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs gap-1"
                            onClick={timer.start}
                          >
                            <Play className="h-3 w-3" /> Start
                          </Button>
                        )}
                        {timer.running && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs gap-1"
                            onClick={timer.stop}
                          >
                            <Square className="h-3 w-3" /> Stop
                          </Button>
                        )}
                        {timer.finished && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={timer.reset}
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                    <Progress value={timer.progress} className="h-1.5" />
                    {timer.finished && (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-success font-medium mt-2 text-center"
                      >
                        Exercise complete!
                      </motion.p>
                    )}
                  </div>

                  {/* AR Live Practice Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-2 h-8"
                    onClick={() => setShowAR(!showAR)}
                  >
                    <Camera className="h-3.5 w-3.5" />
                    {showAR ? "Hide Live Practice" : "Live Practice (AR)"}
                  </Button>

                  <AnimatePresence>
                    {showAR && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <LivePractice
                          exerciseName={ex.name}
                          onClose={() => setShowAR(false)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// --- Skincare Step Component ---
function SkincareStepCard({ item, isDone, onToggle }) {
  return (
    <motion.div
      layout
      onClick={onToggle}
      className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border border-border/40 ${isDone ? "opacity-50 bg-background/50" : "bg-card/40 hover:bg-card/80"}`}
    >
      <div className="relative mt-1 shrink-0">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            isDone
              ? "bg-primary border-primary text-background"
              : "border-muted-foreground/40 bg-transparent"
          }`}
        >
          {isDone && <Check className="w-4 h-4" strokeWidth={3} />}
        </div>
      </div>
      <div className="flex-1 space-y-1">
        <h3
          className={`text-sm font-bold ${isDone ? "text-muted-foreground" : "text-foreground"}`}
        >
          Step {item.step}: {item.title}
        </h3>
        <p className="text-xs text-muted-foreground">{item.desc}</p>
        <p className="text-[10px] text-primary font-medium tracking-wide">
          {item.tip}
        </p>
      </div>
    </motion.div>
  );
}

// --- Main Page ---
export default function FaceCarePage() {
  const [activeTab, setActiveTab] = useState("skincare");
  const todayDate = new Date().toLocaleDateString("en-CA");
  const [completedExercises, setCompletedExercises] = useState(() => {
    try {
      const saved = localStorage.getItem("fitwise_face_ex_" + todayDate);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [completedSkincare, setCompletedSkincare] = useState(() => {
    try {
      const saved = localStorage.getItem("fitwise_skin_" + todayDate);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "fitwise_face_ex_" + todayDate,
      JSON.stringify(completedExercises),
    );
  }, [completedExercises, todayDate]);

  useEffect(() => {
    localStorage.setItem(
      "fitwise_skin_" + todayDate,
      JSON.stringify(completedSkincare),
    );
  }, [completedSkincare, todayDate]);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [milestoneGlow, setMilestoneGlow] = useState(false);

  const toggleExercise = (name) => {
    setCompletedExercises((prev) => {
      const next = prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name];
      // Trigger glow at milestones (every 3rd completion)
      if (next.length > prev.length && next.length % 3 === 0) {
        setMilestoneGlow(true);
        setTimeout(() => setMilestoneGlow(false), 800);
      }
      return next;
    });
  };

  const toggleSkincare = (name) => {
    setCompletedSkincare((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const exerciseProgress =
    (completedExercises.length / faceExercises.length) * 100;

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Face & Skincare
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Improve your facial features with targeted exercises and build a
          consistent skincare routine.
        </p>
      </div>

      {/* Custom Segmented Control */}
      <div className="flex p-1 bg-card rounded-full shadow-inner border border-border/50 max-w-sm mx-auto">
        <button
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-medium rounded-full transition-all ${
            activeTab === "exercises"
              ? "bg-background shadow-md text-foreground"
              : "text-muted-foreground hover:text-foreground/80"
          }`}
          onClick={() => setActiveTab("exercises")}
        >
          <Sparkles className="h-4 w-4" /> Face Exercises
        </button>
        <button
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-medium rounded-full transition-all ${
            activeTab === "skincare"
              ? "bg-background shadow-md text-foreground"
              : "text-muted-foreground hover:text-foreground/80"
          }`}
          onClick={() => setActiveTab("skincare")}
        >
          <Sun className="h-4 w-4" /> Skincare
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "exercises" && (
          <motion.div
            key="exercises"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {/* Progress Header */}
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-foreground">
                  Today's Progress
                </p>
                <p className="text-sm text-muted-foreground">
                  {completedExercises.length}/{faceExercises.length}
                </p>
              </div>
              <div className="relative">
                <motion.div
                  animate={
                    milestoneGlow
                      ? {
                          boxShadow: [
                            "0 0 0 0 hsl(var(--primary)/0)",
                            "0 0 12px 4px hsl(var(--primary)/0.4)",
                            "0 0 0 0 hsl(var(--primary)/0)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 0.8 }}
                  className="rounded-full"
                >
                  <Progress value={exerciseProgress} className="h-2.5" />
                </motion.div>
              </div>
              {completedExercises.length === faceExercises.length && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-success font-medium mt-2 text-center"
                >
                  All exercises complete! Great job!
                </motion.p>
              )}
            </div>

            {/* Exercise Cards */}
            {faceExercises.map((ex, i) => (
              <ExerciseCard
                key={ex.name}
                ex={ex}
                index={i}
                isExpanded={expandedExercise === ex.name}
                onToggleExpand={() =>
                  setExpandedExercise(
                    expandedExercise === ex.name ? null : ex.name,
                  )
                }
                isDone={completedExercises.includes(ex.name)}
                onToggleComplete={() => toggleExercise(ex.name)}
              />
            ))}
          </motion.div>
        )}

        {activeTab === "skincare" && (
          <motion.div
            key="skincare"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Morning Routine */}
            <div className="border border-border/50 rounded-2xl overflow-hidden bg-background">
              <div className="bg-card/40 px-4 py-3 border-b border-border/50 flex items-center gap-2">
                <Sun className="h-5 w-5 text-warning" />
                <h2 className="font-semibold text-foreground">
                  Morning Routine
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {morningRoutine.map((step) => (
                  <SkincareStepCard
                    key={step.id}
                    item={step}
                    isDone={completedSkincare.includes(step.id)}
                    onToggle={() => toggleSkincare(step.id)}
                  />
                ))}
              </div>
            </div>

            {/* Evening Routine */}
            <div className="border border-border/50 rounded-2xl overflow-hidden bg-background">
              <div className="bg-card/40 px-4 py-3 border-b border-border/50 flex items-center gap-2">
                <Moon className="h-5 w-5 text-info" />
                <h2 className="font-semibold text-foreground">
                  Evening Routine
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {eveningRoutine.map((step) => (
                  <SkincareStepCard
                    key={step.id}
                    item={step}
                    isDone={completedSkincare.includes(step.id)}
                    onToggle={() => toggleSkincare(step.id)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
