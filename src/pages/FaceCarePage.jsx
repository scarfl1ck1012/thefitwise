import { useState, useEffect } from "react";
import { faceExercises } from "@/lib/workoutData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

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

// --- Main Page ---
export default function FaceCarePage() {
  const [activeTab, setActiveTab] = useState("morning");
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
        : faceExercises.map((ex, i) => ({
            id: ex.name,
            step: i + 1,
            title: ex.name,
            desc: ex.description,
            tip: ex.duration,
            target: ex.target,
            icon: ex.icon,
          }));

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
        className="rounded-[2rem] bg-surface-low border border-border/30 p-5 relative overflow-hidden"
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
                ? "bg-orange-400"
                : activeTab === "night"
                  ? "bg-indigo-400"
                  : "bg-primary"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Steps List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-3"
        >
          {currentSteps.map((step, idx) => {
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
                          {step.icon && <span className="mr-1.5">{step.icon}</span>}
                          {step.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 transition-transform ${isDone ? "text-primary rotate-90" : "text-muted-foreground/30 group-hover:text-muted-foreground"}`} />
                    </div>

                    {/* Tip / Target */}
                    {(step.tip || step.target) && !isDone && (
                      <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
                        {step.target ? (
                          <>
                            <Activity className="w-3 h-3" />
                            <span>{step.target}</span>
                            <span className="mx-1">•</span>
                            <Clock className="w-3 h-3" />
                            <span>{step.tip}</span>
                          </>
                        ) : (
                          <>
                            <Droplet className="w-3 h-3" />
                            <span>Tip: {step.tip}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
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
