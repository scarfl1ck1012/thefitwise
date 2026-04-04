import { useState, useEffect, useRef } from "react";
import { faceExercises } from "@/lib/workoutData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Droplet,
  Clock,
  Play,
  MoveRight,
  Sun,
  Moon,
  Activity
} from "lucide-react";

// --- Skincare Data (Hidden but preserved for structure) ---
const morningRoutine = [
  { id: "am-1", step: 1, title: "Cleanser", desc: "Gentle face wash to remove dirt and oil" },
  { id: "am-2", step: 2, title: "Toner", desc: "Balance skin pH and prep for products" },
  { id: "am-3", step: 3, title: "Vitamin C Serum", desc: "Brightens skin and fights free radicals" },
  { id: "am-4", step: 4, title: "Moisturizer", desc: "Hydrate and lock in previous products" },
  { id: "am-5", step: 5, title: "Sunscreen SPF 30+", desc: "Protect from UV damage and aging" },
];

const eveningRoutine = [
  { id: "pm-1", step: 1, title: "Cleanser", desc: "Gentle face wash to remove dirt and oil" },
  { id: "pm-2", step: 2, title: "Toner", desc: "Balance skin pH and prep for products" },
  { id: "pm-3", step: 3, title: "Retinol / Retinoid", desc: "Anti-aging, reduces acne and dark spots" },
  { id: "pm-4", step: 4, title: "Moisturizer", desc: "Hydrate and lock in previous products" },
];

// --- Main Page ---
export default function FaceCarePage() {
  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto pl-4 lg:pl-0 pr-4 pt-4 overflow-x-hidden">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
         <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Daily Rituals</h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Clear skin starts from within</p>
         </div>
      </div>

      {/* Hero Central Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {/* Skin Type Card */}
         <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-1 rounded-[2rem] bg-surface-low border border-border/30 p-6 hidden md:flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/10 transition-colors"></div>
            <div>
               <Badge variant="outline" className="border-primary/50 text-primary mb-4 bg-primary/10 tracking-widest text-[10px]">PROFILE</Badge>
               <h3 className="text-xl font-bold text-white mb-1">Skin Type</h3>
               <p className="text-sm text-white/50 font-medium">Combination / Oily</p>
            </div>
            <div className="mt-8 flex justify-start">
               <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center bg-primary/5">
                  <Activity className="w-5 h-5 text-primary opacity-80" />
               </div>
            </div>
         </motion.div>

         {/* Main Circle Hero */}
         <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 rounded-[2rem] bg-[#0c0c0c] border border-border/30 p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[340px]">
            {/* Background Glows */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-80"></div>
            
            {/* Concentric Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border-[1px] border-dashed border-primary/20 rounded-full animate-[spin_60s_linear_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 border-[1px] border-primary/30 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[11rem] h-[11rem] border-[4px] border-primary/10 rounded-full"></div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-50 pulse-glow"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
               <span className="text-[9px] uppercase tracking-widest text-primary font-bold mb-3">Next Active Focus</span>
               <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Cleansing Ritual</h2>
               
               <div className="flex items-center gap-2 mt-5 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-white/90">12:30</span>
               </div>
               
               <Button className="mt-8 bg-white text-black hover:bg-neutral-200 rounded-full px-8 py-5 h-auto font-bold text-xs transform hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  <Play className="w-4 h-4 mr-2 fill-black" /> Begin Session
               </Button>
            </div>
         </motion.div>

         {/* Hydration Card */}
         <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-1 rounded-[2rem] bg-surface-low border border-border/30 p-6 hidden md:flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] group-hover:bg-blue-500/10 transition-colors"></div>
            <div>
               <Badge variant="outline" className="border-blue-500/50 text-blue-400 mb-4 bg-blue-500/10 tracking-widest text-[10px]">STATUS</Badge>
               <h3 className="text-xl font-bold text-white mb-1">Hydration</h3>
               <p className="text-sm text-blue-400/80 font-bold tracking-tight">Optimal Level</p>
            </div>
            <div className="mt-8 flex justify-start">
               <div className="w-12 h-12 rounded-full border border-blue-500/20 flex items-center justify-center bg-blue-500/5">
                  <Droplet className="w-5 h-5 text-blue-400 opacity-80" />
               </div>
            </div>
         </motion.div>
      </div>

      {/* Bottom Section - Horizontal Routines */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
         <div className="flex items-center justify-between mb-4 px-2">
            <div>
               <h3 className="text-lg font-bold text-foreground">Curated Routines</h3>
               <p className="text-xs text-muted-foreground mt-1">Schedules perfect for your skin type</p>
            </div>
            <Button variant="ghost" className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
               View All <MoveRight className="w-3.5 h-3.5 ml-2"/>
            </Button>
         </div>
         
         <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x pt-2">
             <RoutineCard 
               title="Morning Refresh" 
               desc="Wake up your skin" 
               time="5 min" 
               steps={morningRoutine.length} 
               icon={<Sun className="w-5 h-5 text-orange-400" />}
               gradient="from-orange-500/20 to-transparent" 
             />
             <RoutineCard 
               title="Evening Repair" 
               desc="Deep restoration step" 
               time="15 min" 
               steps={eveningRoutine.length} 
               icon={<Moon className="w-5 h-5 text-indigo-400" />}
               gradient="from-indigo-500/20 to-transparent" 
             />
             <RoutineCard 
               title="Face Yoga Focus" 
               desc="Tone facial muscles" 
               time="10 min" 
               steps={faceExercises.length} 
               icon={<Sparkles className="w-5 h-5 text-primary" />}
               gradient="from-primary/20 to-transparent" 
             />
             <RoutineCard 
               title="Quick Cleanse" 
               desc="Post-workout refresh" 
               time="3 min" 
               steps={3} 
               icon={<Droplet className="w-5 h-5 text-cyan-400" />}
               gradient="from-cyan-500/20 to-transparent" 
             />
         </div>
      </motion.div>

    </div>
  );
}

// ──────────────────────────────────────────────
// STYLED ROUTINE CARD
// ──────────────────────────────────────────────
function RoutineCard({ title, desc, time, steps, icon, gradient }) {
    return (
        <div className="min-w-[260px] sm:min-w-[300px] snap-center rounded-[2rem] bg-surface-low border border-border/30 p-1 relative overflow-hidden group hover:border-border/60 transition-colors cursor-pointer shrink-0">
           {/* Inner Gradient Banner */}
           <div className={`w-full h-32 rounded-[1.75rem] bg-gradient-to-br ${gradient} p-5 flex flex-col justify-between relative overflow-hidden`}>
               {/* Decorative Icon inside banner */}
               <div className="absolute -right-4 -bottom-4 opacity-10 transform -rotate-12 scale-150">
                   {icon}
               </div>

               <div className="w-10 h-10 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 flex items-center justify-center relative z-10">
                   {icon}
               </div>
               
               <div className="flex justify-between items-end relative z-10">
                   <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                       <span className="text-[10px] font-bold text-white/90">{time}</span>
                   </div>
               </div>
           </div>

           {/* Content Below Banner */}
           <div className="p-5">
               <h4 className="font-bold text-foreground text-md mb-1">{title}</h4>
               <p className="text-xs text-muted-foreground font-medium mb-4">{desc}</p>
               
               <div className="flex items-center justify-between">
                   <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{steps} Steps</span>
                   <div className="w-8 h-8 rounded-full bg-surface-highest flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                       <MoveRight className="w-3.5 h-3.5" />
                   </div>
               </div>
           </div>
        </div>
    );
}
