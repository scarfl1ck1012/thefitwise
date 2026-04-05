import { useState, useEffect, useRef } from "react";
import { faceExercises } from "@/lib/workoutData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Droplet,
  Clock,
  Sun,
  Moon,
  Activity,
  Check,
  ChevronRight,
  ChevronDown,
  Timer,
  Play,
  Square,
  Camera,
} from "lucide-react";
import LivePractice from "@/components/LivePractice";

// --- Routine Data ---
const morningRoutine = [
  { id: "am-1", step: 1, title: "Cleanser", desc: "Gentle face wash to remove overnight oil and impurities", tip: "Use lukewarm water, not hot" },
  { id: "am-2", step: 2, title: "Toner", desc: "Balance skin pH and prep for products", tip: "Pat gently, don't rub" },
  { id: "am-3", step: 3, title: "Vitamin C Serum", desc: "Brightens skin and fights free radicals", tip: "Apply before moisturizer" },
  { id: "am-4", step: 4, title: "Eye Cream", desc: "Hydrate under-eye area, reduce dark circles", tip: "Use ring finger, lightest pressure" },
  { id: "am-5", step: 5, title: "Moisturizer", desc: "Hydrate and lock in previous products", tip: "Apply while skin is still slightly damp" },
  { id: "am-6", step: 6, title: "Sunscreen SPF 30+", desc: "Protect from UV damage and aging", tip: "Reapply every 2 hours if outdoors" },
];

const nightRoutine = [
  { id: "pm-1", step: 1, title: "Oil Cleanser", desc: "Remove makeup and sunscreen thoroughly", tip: "Massage gently for 60 seconds" },
  { id: "pm-2", step: 2, title: "Water Cleanser", desc: "Deep clean pores and remove remaining residue", tip: "Double cleansing is key at night" },
  { id: "pm-3", step: 3, title: "Toner", desc: "Balance skin pH after cleansing", tip: "Pat gently, don't rub" },
  { id: "pm-4", step: 4, title: "Retinol / Retinoid", desc: "Anti-aging, reduces acne and dark spots", tip: "Start 2x/week, build tolerance" },
  { id: "pm-5", step: 5, title: "Eye Cream", desc: "Hydrate and repair under-eye area overnight", tip: "Use ring finger, lightest pressure" },
  { id: "pm-6", step: 6, title: "Night Moisturizer", desc: "Rich cream to repair and hydrate overnight", tip: "Apply while skin is damp" },
];

const TABS = [
  { key: "morning", label: "Morning", icon: Sun, color: "orange" },
  { key: "night", label: "Night", icon: Moon, color: "indigo" },
  { key: "yoga", label: "Face Yoga", icon: Sparkles, color: "primary" },
];

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

// --- Face Yoga Card Component ---
function FaceYogaCard({ ex, idx, isExpanded, onToggleExpand, isDone, onToggleComplete }) {
  const timer = useTimer(ex.timerSeconds || 60);
  const [showAR, setShowAR] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className={`rounded-2xl border transition-all overflow-hidden ${
        isDone
          ? "bg-primary/5 border-primary/20 opacity-80"
          : isExpanded
          ? "bg-card dark:bg-[#151515] border-primary/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
          : "bg-surface-low border-border/30 hover:border-border/60 hover:bg-surface-low/90"
      }`}
    >
      <button
        className="w-full p-5 text-left flex items-start gap-4"
        onClick={onToggleExpand}
      >
        <div
          className="relative mt-0.5 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isDone
                ? "bg-primary border border-primary text-primary-foreground shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                : "bg-surface border border-border/40 text-primary"
            }`}
          >
            {isDone ? <Check className="w-5 h-5" /> : <span className="text-xl">{ex.icon}</span>}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className={`text-sm font-bold ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {ex.name}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {ex.description}
              </p>
            </div>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
            </motion.div>
          </div>
          
          {(!isExpanded && !isDone) && (
            <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
              <Activity className="w-3 h-3" />
              <span>{ex.target}</span>
              <span className="mx-1">•</span>
              <Clock className="w-3 h-3" />
              <span>{ex.duration}</span>
            </div>
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 space-y-5 border-t border-border/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Image and Instructions */}
                <div className="space-y-4">
                  <div className="aspect-square rounded-xl overflow-hidden bg-surface-lowest border border-border/30 flex items-center justify-center p-2">
                    <img src={ex.image} alt={ex.name} className="w-full h-full object-contain rounded-lg" />
                  </div>
                </div>

                {/* Steps and Timer */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">How To Perform</p>
                    {ex.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-xs text-foreground/80 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-surface-lowest/50 border border-border/30 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-foreground font-mono">
                          {timer.display}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {!timer.running && !timer.finished && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 hover:bg-primary/10 hover:text-primary hover:border-primary/30" onClick={timer.start}>
                            <Play className="h-3 w-3" /> Start
                          </Button>
                        )}
                        {timer.running && (
                          <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={timer.stop}>
                            <Square className="h-3 w-3" /> Stop
                          </Button>
                        )}
                        {timer.finished && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={timer.reset}>
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-surface-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${timer.progress}%` }}></div>
                    </div>
                    {timer.finished && (
                      <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-primary font-bold uppercase tracking-widest mt-3 text-center">
                        Set Complete!
                      </motion.p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full text-xs font-bold gap-2 h-9 rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
                    onClick={() => setShowAR(!showAR)}
                  >
                    <Camera className="h-3.5 w-3.5" />
                    {showAR ? "Close Camera" : "Open AR Practice"}
                  </Button>
                </div>
              </div>

              {/* AR View */}
              <AnimatePresence>
                {showAR && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <div className="pt-2">
                      <LivePractice exerciseName={ex.name} onClose={() => setShowAR(false)} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Main Page ---
export default function FaceCarePage() {
  const [activeTab, setActiveTab] = useState("morning");
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(() => {
    try {
      const saved = localStorage.getItem("fitwise_skincare_done");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("fitwise_skincare_done", JSON.stringify(completedSteps));
  }, [completedSteps]);

  const toggleStep = (id) => {
    setCompletedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentSteps =
    activeTab === "morning"
      ? morningRoutine
      : activeTab === "night"
        ? nightRoutine
        : faceExercises.map((ex, i) => ({ id: ex.name, ...ex }));

  const completedCount = currentSteps.filter(
    (s) => completedSteps[s.id]
  ).length;
  const progress = currentSteps.length
    ? Math.round((completedCount / currentSteps.length) * 100)
    : 0;

  const tabColors = {
    morning: { bg: "from-orange-500/15 to-amber-500/5", ring: "ring-orange-400/30", text: "text-orange-400" },
    night: { bg: "from-indigo-500/15 to-purple-500/5", ring: "ring-indigo-400/30", text: "text-indigo-400" },
    yoga: { bg: "from-primary/15 to-emerald-500/5", ring: "ring-primary/30", text: "text-primary" },
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto pl-4 lg:pl-0 pr-4 pt-4 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Daily Rituals
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Clear skin starts from within
          </p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex bg-surface-low border border-border/30 p-1.5 rounded-full relative overflow-hidden">
        {TABS.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex justify-center items-center gap-2 py-3.5 px-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 relative z-10 ${
                isActive
                  ? tabColors[tab.key].text
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}

        {/* Animated Pill */}
        <div
          className={`absolute top-1.5 bottom-1.5 rounded-full transition-all duration-300 ease-out z-0 border bg-gradient-to-r ${tabColors[activeTab].bg} ${tabColors[activeTab].ring}`}
          style={{
            width: "calc(33.333% - 4px)",
            transform: `translateX(${TABS.findIndex((t) => t.key === activeTab) * 100}%)`,
            boxShadow:
              activeTab === "morning"
                ? "0 0 15px rgba(251,146,60,0.15)"
                : activeTab === "night"
                  ? "0 0 15px rgba(129,140,248,0.15)"
                  : "0 0 15px rgba(34,197,94,0.15)",
          }}
        />
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] bg-surface-low border border-border/30 p-5 relative overflow-hidden shadow-card"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase tracking-widest font-bold ${tabColors[activeTab].text}`}>
              {activeTab === "morning"
                ? "Morning Routine"
                : activeTab === "night"
                  ? "Night Routine"
                  : "Face Yoga Session"}
            </span>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {completedCount}/{currentSteps.length} Complete
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-highest/50 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              activeTab === "morning"
                ? "bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]"
                : activeTab === "night"
                  ? "bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]"
                  : "bg-primary shadow-[0_0_10px_rgba(34,197,94,0.5)]"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Routine Steps / Yoga Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-3"
        >
          {activeTab === "yoga" ? (
            // Face Yoga uses specific Expandable Cards
            currentSteps.map((ex, idx) => (
              <FaceYogaCard
                key={ex.id}
                ex={ex}
                idx={idx}
                isExpanded={expandedExercise === ex.id}
                onToggleExpand={() =>
                  setExpandedExercise(expandedExercise === ex.id ? null : ex.id)
                }
                isDone={completedSteps[ex.id]}
                onToggleComplete={() => toggleStep(ex.id)}
              />
            ))
          ) : (
            // Morning/Night use simple toggle lists
            currentSteps.map((step, idx) => {
              const isDone = completedSteps[step.id];
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => toggleStep(step.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
                    isDone
                      ? "bg-primary/5 border-primary/20 opacity-70"
                      : "bg-surface-low border-border/30 hover:border-border/60 hover:bg-surface-low/90"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Step Number / Check */}
                    <div
                      className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 transition-all ${
                        isDone
                          ? "bg-primary border border-primary text-primary-foreground shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                          : `bg-surface border border-border/40 ${tabColors[activeTab].text}`
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-black">{step.step}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4
                            className={`text-sm font-bold ${
                              isDone
                                ? "line-through text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {step.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 transition-transform ${isDone ? "text-primary rotate-90" : "text-muted-foreground/30 group-hover:text-muted-foreground"}`} />
                      </div>

                      {/* Tip */}
                      {!isDone && step.tip && (
                        <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
                          <Droplet className="w-3 h-3" />
                          <span>Tip: {step.tip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>

      {/* Reset Button */}
      {completedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center pt-2"
        >
          <Button
            variant="outline"
            onClick={() => {
              const resetKeys = currentSteps.map((s) => s.id);
              setCompletedSteps((prev) => {
                const next = { ...prev };
                resetKeys.forEach((k) => delete next[k]);
                return next;
              });
            }}
            className="rounded-full px-8 border-border/30 text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest"
          >
            Reset {activeTab === "morning" ? "Morning" : activeTab === "night" ? "Night" : "Yoga"} Progress
          </Button>
        </motion.div>
      )}
    </div>
  );
}
