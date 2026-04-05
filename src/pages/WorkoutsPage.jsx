import { useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useProfile } from "@/hooks/useProfile";
import { useWaterLogs } from "@/hooks/useWaterLogs";
import { getLocalDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { Activity, Plus, Percent, Dumbbell, Droplets, Shield, ChevronRight, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts";

// Mock data matching the chart in the image
const weightData = [
  { date: "OCT 12", value: 76.8 },
  { date: "OCT 19", value: 76.5 },
  { date: "OCT 26", value: 75.9 },
  { date: "NOV 02", value: 75.3 },
  { date: "TODAY", value: 74.2 },
];

export default function WorkoutsPage() {
  const { checkins } = useWorkouts();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { totalWaterMl } = useWaterLogs();

  const age = profile?.age || 25;
  const weight = profile?.weight_kg || 70;
  const height = profile?.height_cm || 175;
  const gender = profile?.gender === "female" ? 0 : 1;
  const bmi = weight / Math.pow(height / 100, 2);
  const bfValue = ((1.20 * bmi) + (0.23 * age) - (10.8 * gender) - 5.4).toFixed(1);
  const mmValue = (weight * (1 - (bfValue / 100)) * 0.85).toFixed(1);
  const hydraValue = Math.min(100, Math.round((totalWaterMl / 2500) * 100));

  // Build real activity data for the contribution graph
  const { contributionGrid } = useMemo(() => {
    const wDays = new Set();
    checkins.forEach((c) => wDays.add(c.logged_at));

    // Generate last 364 days (52 weeks x 7 days)
    const grid = [];
    const today = new Date();
    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      
      let intensity = 0;
      if (wDays.has(dateStr)) {
        // Randomly assign peak vs active if it's a workout day, just for visual parity with the image
        intensity = Math.random() > 0.3 ? 1 : 2; 
      }
      grid.push(intensity);
    }
    
    // Split into weeks (columns)
    const columns = [];
    for (let i = 0; i < grid.length; i += 7) {
      columns.push(grid.slice(i, i + 7));
    }
    
    return { contributionGrid: columns };
  }, [checkins]);

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto pl-4 lg:pl-0 pr-4">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Progress & Metrics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tracking elite physical evolution through kinetic data points.
        </p>
      </div>

      {/* Top Row: Weight & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Current Weight Card */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 rounded-[2rem] bg-surface-low/80 p-6 lg:p-8 flex flex-col justify-between border border-border/30">
           <div>
              <p className="text-[11px] font-bold text-muted-foreground tracking-[0.2em] uppercase mb-4">Current Weight</p>
              <div className="flex items-baseline gap-2">
                 <h2 className="text-6xl font-black tracking-tighter text-primary">74.2</h2>
                 <span className="text-xl font-medium text-primary">kg</span>
              </div>
              <p className="text-xs font-semibold text-primary mt-2 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                -1.4 kg from last month
              </p>
           </div>
           
           <div className="mt-8">
              <Button className="w-full rounded-full py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-[0_0_20px_rgba(34,197,94,0.3)] border-none">
                 <Plus className="mr-2 h-5 w-5" /> Log Weight
              </Button>
           </div>
        </motion.div>

        {/* Weight Evolution Chart */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 rounded-[2rem] bg-surface-low/80 p-6 lg:p-8 border border-border/30">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-base font-bold text-foreground">Weight Evolution</h3>
              <div className="flex gap-4 text-xs font-bold tracking-widest text-muted-foreground">
                 <button className="text-primary border-b-2 border-primary pb-1">1M</button>
                 <button className="hover:text-foreground transition-colors pb-1 border-b-2 border-transparent">3M</button>
                 <button className="hover:text-foreground transition-colors pb-1 border-b-2 border-transparent">1Y</button>
              </div>
           </div>
           
           <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1C1C1E", border: "none", borderRadius: "12px", color: "#fff", fontWeight: "bold" }}
                    itemStyle={{ color: "hsl(var(--primary))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorWeight)"
                  />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#666", fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </motion.div>
      </div>

      {/* Activity Consistency Grid */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="w-full">
         <div className="flex items-center justify-between mb-4 px-2">
            <div>
               <h3 className="text-lg font-bold text-foreground">Activity Consistency</h3>
               <p className="text-xs text-muted-foreground mt-0.5">Daily kinetic commitment over the last 6 months.</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-surface-high border border-border/30"></div>
                  <span className="text-[10px] text-muted-foreground font-semibold">Rest</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-[3px] bg-primary/40 border border-transparent"></div>
                  <span className="text-[10px] text-muted-foreground font-semibold">Active</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-[3px] bg-primary border border-transparent shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                  <span className="text-[10px] text-muted-foreground font-semibold">Intensity Peak</span>
               </div>
            </div>
         </div>
         
         <div className="rounded-[2rem] bg-surface-low/80 p-6 lg:p-8 border border-border/30 overflow-x-auto scrollbar-hide">
             <div className="flex gap-[3px] w-max min-w-full justify-end">
                {contributionGrid.map((week, wi) => (
                   <div key={wi} className="flex flex-col gap-[3px]">
                      {week.map((intensity, di) => {
                         let bgClass = "bg-surface-high/50 border border-border/30";
                         if (intensity === 1) bgClass = "bg-[#22c55e]/40 rounded-[3px]";
                         if (intensity === 2) bgClass = "bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.6)] rounded-[3px]";
                         return <div key={di} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px] ${bgClass} transition-colors`} />
                      })}
                   </div>
                ))}
             </div>
         </div>
      </motion.div>

      {/* Body Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {[
           { icon: Percent, label: "Body Fat", value: `${bfValue}%`, change: "Computed", progress: `${bfValue}%`, color: "text-primary" },
           { icon: Dumbbell, label: "Muscle Mass", value: `${mmValue} kg`, change: "Estimated", progress: `70%`, color: "text-primary", segmented: true },
           { icon: Droplets, label: "Hydration", value: `${hydraValue}%`, change: "Today", progress: `${hydraValue}%`, color: "text-primary" },
         ].map((stat, i) => (
           <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i*0.05) }} className="rounded-[2rem] bg-surface-low/80 p-6 lg:p-8 border border-border/30 flex flex-col justify-between h-[180px]">
              <div className="flex items-start justify-between">
                 <div className="w-10 h-10 rounded-full bg-surface-high/50 border border-border/30 flex items-center justify-center">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                 </div>
                 <span className={`text-[10px] font-bold tracking-widest ${stat.change === "Stable" ? "text-muted-foreground" : "text-primary"}`}>
                    {stat.change}
                 </span>
              </div>
              
              <div>
                 <p className="text-[11px] text-muted-foreground mb-1 font-semibold">{stat.label}</p>
                 <h4 className="text-3xl font-bold tracking-tight text-foreground">{stat.value.split(" ")[0]}<span className="text-lg font-medium text-muted-foreground ml-1">{stat.value.split(" ")[1]}</span></h4>
                 
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

      {/* Bottom Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-[2rem] bg-surface-low/80 p-6 flex items-center gap-6 border border-border/30 overflow-hidden relative group cursor-pointer hover:bg-surface transition-colors">
             <div className="w-24 h-24 rounded-2xl bg-surface-high overflow-hidden shrink-0">
                 {/* Decorative image placeholder */}
                 <div className="w-full h-full bg-gradient-to-tr from-primary/20 to-surface-high flex items-center justify-center">
                    <User className="h-10 w-10 text-muted-foreground" />
                 </div>
             </div>
             <div className="flex-1">
                <h4 className="text-sm font-bold text-foreground mb-1">Kinetic Prediction</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed pr-4">Based on your current muscle mass velocity, you're on track to hit 65kg by December 20.</p>
                <div className="mt-3 flex items-center gap-1 text-[10px] font-bold tracking-widest text-primary uppercase">
                   View Roadmap <ChevronRight className="h-3 w-3" />
                </div>
             </div>
         </motion.div>
         
         <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-[2rem] bg-surface-low/80 p-6 flex flex-col justify-center gap-6 border border-border/30">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1A2E20] border border-[#22c55e]/20 flex items-center justify-center shrink-0">
                   <Shield className="h-5 w-5 text-[#22c55e]" />
                </div>
                <div>
                   <h4 className="text-sm font-bold text-foreground mb-1">Data Accuracy</h4>
                   <p className="text-[11px] text-muted-foreground">Last synced with Smart Scale Pro 5:24 AM</p>
                </div>
             </div>
             <Button variant="outline" className="w-full rounded-full border-border/40 bg-transparent hover:bg-white/5 font-semibold text-xs py-5">
                Manage Data Sources
             </Button>
         </motion.div>
      </div>

    </div>
  );
}

