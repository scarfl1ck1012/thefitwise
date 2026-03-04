import { useState, useEffect, useRef } from "react";
import { faceExercises, skincareRoutine } from "@/lib/workoutData";
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
} from "lucide-react";
import LivePractice from "@/components/LivePractice";

// --- Exercise Timer Hook ---
function useTimer(totalSeconds) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && remaining > 0) {
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
  }, [running, remaining]);

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
            <div
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
            </div>

            {/* Exercise Icon placeholder */}
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
              {ex.icon || "🏋️"}
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

// --- Main Page ---
export default function FaceCarePage() {
  const [completedExercises, setCompletedExercises] = useState([]);
  const [completedSkincare, setCompletedSkincare] = useState([]);
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Face & Skincare</h1>
      <p className="text-sm text-muted-foreground">
        Improve your facial features with targeted exercises and build a
        consistent skincare routine.
      </p>

      <Tabs defaultValue="exercises">
        <TabsList className="w-full">
          <TabsTrigger value="exercises" className="flex-1 gap-2">
            <Sparkles className="h-4 w-4" /> Face Exercises
          </TabsTrigger>
          <TabsTrigger value="skincare" className="flex-1 gap-2">
            <Sun className="h-4 w-4" /> Skincare
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="mt-4 space-y-3">
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
        </TabsContent>

        <TabsContent value="skincare" className="mt-4 space-y-4">
          {/* Morning Routine */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sun className="h-4 w-4 text-warning" /> Morning Routine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {skincareRoutine
                .filter((s) => s.when === "morning" || s.when === "both")
                .map((step) => {
                  const key = `am-${step.name}`;
                  const done = completedSkincare.includes(key);
                  return (
                    <div
                      key={key}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all ${done ? "bg-success/5" : "bg-muted/50"}`}
                    >
                      <div className="relative mt-0.5">
                        <motion.div
                          animate={done ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Checkbox
                            checked={done}
                            onCheckedChange={() => toggleSkincare(key)}
                          />
                        </motion.div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}
                          >
                            Step {step.step}: {step.name}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {step.description}
                        </p>
                        <p className="text-xs text-primary mt-1">{step.tip}</p>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>

          {/* Evening Routine */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Moon className="h-4 w-4 text-info" /> Evening Routine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {skincareRoutine
                .filter((s) => s.when === "evening" || s.when === "both")
                .map((step) => {
                  const key = `pm-${step.name}`;
                  const done = completedSkincare.includes(key);
                  return (
                    <div
                      key={key}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all ${done ? "bg-success/5" : "bg-muted/50"}`}
                    >
                      <div className="relative mt-0.5">
                        <motion.div
                          animate={done ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Checkbox
                            checked={done}
                            onCheckedChange={() => toggleSkincare(key)}
                          />
                        </motion.div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}
                          >
                            Step {step.step}: {step.name}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {step.description}
                        </p>
                        <p className="text-xs text-primary mt-1">{step.tip}</p>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
