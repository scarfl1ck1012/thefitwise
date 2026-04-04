import { useState, useMemo, useCallback, useEffect } from "react";
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
  Moon
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  const handleStartSession = () => {
    if (checkedIn) {
      toast.error("Already completed a session today.");
      return;
    }
    addCheckin.mutate({
      workout_type: "gym",
      duration_min: 60,
      notes: "Gym session",
    });
    addXP.mutate(25);
    toast.success("Session Started! +25 XP");
  };

  const dayExercises = weeklyPlan[selectedDay] || [];

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto pl-4 lg:pl-0 pr-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4">
         <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Hypertrophy Program</h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Phase 2: Volume Accumulation</p>
         </div>
         <div className="flex gap-3">
            <Button variant="outline" className="border-border bg-surface-low rounded-full px-6 hover:bg-surface-high font-bold text-xs h-12">
              Workout Builder
            </Button>
            <Button onClick={handleStartSession} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-6 h-12 shadow-[0_0_20px_rgba(34,197,94,0.3)] border-none text-xs">
              {checkedIn ? "Session Completed" : "Start Session"}
            </Button>
         </div>
      </div>

      {/* Top Banner Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         {/* Rest Day Focus */}
         <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 rounded-[2rem] bg-surface-low border border-border/30 overflow-hidden relative min-h-[240px] flex items-end p-8 group cursor-pointer">
             <div className="absolute inset-0 bg-gradient-to-br from-[#0a1610] to-[#111111] z-0"></div>
             
             {/* Neon Abstract Element (Pure CSS approximation) */}
             <div className="absolute right-[-10%] top-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/30 transition-colors duration-700"></div>
             <div className="absolute right-10 bottom-10 w-32 h-32 rounded-full border border-primary/30 transform rotate-12 blur-[1px]"></div>
             <div className="absolute right-16 bottom-16 w-24 h-24 rounded-full border-2 border-primary/50 transform rotate-45 blur-[2px]"></div>

             <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <Badge variant="outline" className="border-primary/50 text-primary mb-4 bg-primary/10 tracking-widest text-[10px]">RECOVERY</Badge>
                    <h3 className="text-2xl font-black text-white mb-1 tracking-tight">Rest Day Focus</h3>
                    <p className="text-sm text-white/60 font-medium">Active recovery and mobility routine.</p>
                </div>
                <Button variant="outline" className="text-white hover:bg-white/10 rounded-full bg-white/5 border border-white/10 shrink-0 font-bold px-6">
                  Explore <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
             </div>
         </motion.div>

         {/* Cardiovascular Conditioning */}
         <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1 rounded-[2rem] bg-surface-low p-6 lg:p-8 border border-border/30 flex flex-col relative overflow-hidden">
             {/* subtle glow */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[40px]"></div>

             <div className="relative z-10">
                 <h3 className="font-bold text-foreground text-sm">Cardiovascular Conditioning</h3>
                 <p className="text-[11px] text-muted-foreground mt-0.5 tracking-widest uppercase">Weekly targets</p>
             </div>

             <div className="flex justify-around items-center flex-1 mt-6 relative z-10">
                {/* Ring 1 - Zone 2 */}
                <div className="flex flex-col items-center gap-3">
                   <div className="relative w-[84px] h-[84px]">
                      <svg className="w-full h-full transform -rotate-90">
                          {/* Background Track */}
                          <circle cx="42" cy="42" r="36" fill="none" className="stroke-surface-high" strokeWidth="6" />
                          {/* Progress Track */}
                          <circle cx="42" cy="42" r="36" fill="none" className="stroke-primary" strokeWidth="6" strokeDasharray="226" strokeDashoffset="75" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-xl font-bold text-foreground">45</span>
                         <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Min</span>
                      </div>
                   </div>
                   <span className="text-[11px] font-bold text-foreground tracking-widest uppercase">Zone 2</span>
                </div>

                {/* Ring 2 - HIIT */}
                <div className="flex flex-col items-center gap-3">
                   <div className="relative w-[84px] h-[84px]">
                      <svg className="w-full h-full transform -rotate-90">
                          {/* Background Track */}
                          <circle cx="42" cy="42" r="36" fill="none" className="stroke-surface-high" strokeWidth="6" />
                          {/* Progress Track */}
                          <circle cx="42" cy="42" r="36" fill="none" className="stroke-accent" strokeWidth="6" strokeDasharray="226" strokeDashoffset="150" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-xl font-bold text-foreground">15</span>
                         <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Min</span>
                      </div>
                   </div>
                   <span className="text-[11px] font-bold tracking-widest uppercase text-accent">HIIT</span>
                </div>
             </div>
         </motion.div>
      </div>

      {/* Workout Builder Main Section */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-[2rem] bg-surface-low/80 p-6 lg:p-8 border border-border/30">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
             <div>
                <h3 className="text-lg font-bold text-foreground">Workout Builder</h3>
                <p className="text-xs text-muted-foreground mt-1">Configure your weekly routine</p>
             </div>
             
             {/* Day Tabs matching the image */}
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
                    <p className="text-xs text-muted-foreground mt-1">Focus on recovery and mobility.</p>
                 </div>
             ) : (
                 <>
                   {/* Fallback items if empty (to match UI strictly) */}
                   {dayExercises.length === 0 ? (
                      <>
                        <ExerciseRow name="Barbell Bench Press" sets="4" repRange="8-10" weight="85kg" type="Chest" />
                        <ExerciseRow name="Incline Dumbbell Press" sets="3" repRange="10-12" weight="35kg" type="Chest" />
                        <ExerciseRow name="Cable Crossovers" sets="3" repRange="12-15" weight="20kg" type="Chest" />
                      </>
                   ) : (
                      dayExercises.map((ex) => (
                         <ExerciseRow 
                            key={ex.instanceId} 
                            name={ex.name} 
                            sets={String(ex.sets)} 
                            repRange={String(ex.reps)} 
                            weight="-" 
                            type={ex.muscle} 
                         />
                      ))
                   )}

                   {/* Add new button */}
                   <Button variant="outline" className="w-full rounded-xl border-dashed border-white/10 bg-transparent hover:bg-white/5 py-6 mt-4 opacity-50 hover:opacity-100 transition-opacity">
                      <Plus className="h-4 w-4 mr-2" /> Add Exercise
                   </Button>
                 </>
             )}
          </div>
      </motion.div>
    </div>
  );
}

// ──────────────────────────────────────────────
// STYLED EXERCISE ROW
// ──────────────────────────────────────────────
function ExerciseRow({ name, sets, repRange, weight, type }) {
   return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-surface hover:bg-surface-high transition-colors border border-transparent group">
         <div className="flex items-center gap-4 mb-3 sm:mb-0">
            {/* Grab handle placeholder */}
            <div className="flex flex-col gap-[2px] opacity-20 group-hover:opacity-100 transition-opacity cursor-grab">
               <div className="w-1 h-1 rounded-full bg-white"></div>
               <div className="w-1 h-1 rounded-full bg-white"></div>
               <div className="w-1 h-1 rounded-full bg-white"></div>
            </div>
            
            <div>
               <div className="flex items-center gap-2 mb-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary/70"></div>
                 <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">{type}</span>
               </div>
               <p className="text-sm font-bold text-foreground">{name}</p>
            </div>
         </div>

         <div className="flex items-center gap-2 pl-8 sm:pl-0">
            <div className="px-3 py-1.5 rounded-lg border border-white/5 bg-surface-lowest flex items-center justify-center">
               <span className="text-xs font-bold text-white">{sets} <span className="text-white/50 font-medium">Sets</span></span>
            </div>
            <div className="px-3 py-1.5 rounded-lg border border-white/5 bg-surface-lowest flex items-center justify-center">
               <span className="text-xs font-bold text-white">{repRange} <span className="text-white/50 font-medium">Reps</span></span>
            </div>
            <div className="px-3 py-1.5 rounded-lg border border-white/5 bg-surface-lowest flex items-center justify-center">
               <span className="text-xs font-bold text-primary">{weight}</span>
            </div>
         </div>
      </div>
   );
}
