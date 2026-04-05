import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Dumbbell, Utensils, Sparkles, Activity, Camera, BarChart3 } from "lucide-react";

const features = [
  {
    tag: "Workouts",
    title: "Your Gym, Digitized.",
    description: "Build custom workout splits with drag-and-drop simplicity. Track sets, reps, and rest timers — everything syncs to your progress dashboard automatically.",
    icon: Dumbbell,
    color: "primary",
    visual: "gym",
  },
  {
    tag: "Nutrition",
    title: "Fuel Your Machine.",
    description: "Log meals in seconds with our AI-powered food scanner. Get real-time macro breakdowns and personalized calorie targets that adapt to your goals.",
    icon: Utensils,
    color: "blue-500",
    visual: "nutrition",
  },
  {
    tag: "Face Care",
    title: "Glow From Within.",
    description: "Follow guided morning and night skincare routines. Practice face yoga with our live AR camera that mirrors your movements in real-time.",
    icon: Sparkles,
    color: "orange-400",
    visual: "facecare",
  },
  {
    tag: "Analytics",
    title: "Data That Drives.",
    description: "Visualize your progress with body composition tracking, workout streaks, and personalized insights that help you understand what's working.",
    icon: BarChart3,
    color: "purple-500",
    visual: "analytics",
  },
];

function FeatureVisual({ type }) {
  if (type === "gym") {
    return (
      <div className="space-y-3 p-2">
        {["Push Day", "Pull Day", "Legs"].map((day, i) => (
          <div key={day} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${i === 0 ? "bg-primary/15 text-primary" : i === 1 ? "bg-blue-500/15 text-blue-400" : "bg-purple-500/15 text-purple-400"}`}>
              <Dumbbell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white">{day}</div>
              <div className="text-xs text-white/40 mt-0.5">{3 + i} exercises • {40 + i * 5} min</div>
            </div>
            <div className="text-xs font-bold text-primary/60">{i === 0 ? "Today" : ""}</div>
          </div>
        ))}
      </div>
    );
  }
  if (type === "nutrition") {
    return (
      <div className="p-4 flex flex-col items-center gap-6">
        <div className="w-32 h-32 rounded-full border-[10px] border-white/[0.04] relative flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[1.12]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="7" strokeDasharray="251" strokeDashoffset="60" strokeLinecap="round" className="opacity-80" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="7" strokeDasharray="251" strokeDashoffset="190" strokeLinecap="round" className="opacity-70" />
          </svg>
          <div className="text-center">
            <div className="text-xl font-black text-white">1,840</div>
            <div className="text-[9px] font-bold text-white/40 tracking-widest">KCAL</div>
          </div>
        </div>
        <div className="flex gap-6 text-center">
          {[{ label: "Protein", val: "142g", color: "text-primary" }, { label: "Carbs", val: "210g", color: "text-blue-400" }, { label: "Fat", val: "58g", color: "text-amber-400" }].map((m) => (
            <div key={m.label}>
              <div className={`text-lg font-bold ${m.color}`}>{m.val}</div>
              <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (type === "facecare") {
    return (
      <div className="p-2 space-y-3">
        {[{ name: "Neck Tilts", time: "60s" }, { name: "Chin Lifts", time: "75s" }, { name: "Eye Squeeze", time: "75s" }].map((ex, i) => (
          <div key={ex.name} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="w-9 h-9 rounded-lg bg-orange-500/15 border border-orange-500/20 text-orange-400 text-sm font-bold flex items-center justify-center">{i + 1}</div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white">{ex.name}</div>
              <div className="text-xs text-white/40 mt-0.5">{ex.time} per set</div>
            </div>
            <Camera className="w-4 h-4 text-white/20" />
          </div>
        ))}
      </div>
    );
  }
  if (type === "analytics") {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-end gap-1.5 h-28">
          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
            <div key={i} className="flex-1 bg-primary/20 rounded-t-sm relative">
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.6 }}
                className="absolute bottom-0 left-0 right-0 bg-primary/70 rounded-t-sm"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-4">
          {[{ label: "Streak", val: "12 days", icon: "🔥" }, { label: "XP", val: "2,450", icon: "⚡" }].map((s) => (
            <div key={s.label} className="flex-1 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
              <div className="text-lg mb-1">{s.icon}</div>
              <div className="text-sm font-bold text-white">{s.val}</div>
              <div className="text-[10px] text-white/40 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

function FeatureRow({ feature, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const isReversed = index % 2 !== 0;

  const colorMap = {
    "primary": { bg: "bg-primary/10", border: "border-primary/20", text: "text-primary" },
    "blue-500": { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
    "orange-400": { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400" },
    "purple-500": { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" },
  };

  const colors = colorMap[feature.color];
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col ${isReversed ? "md:flex-row-reverse" : "md:flex-row"} gap-12 md:gap-20 items-center`}
    >
      {/* Text */}
      <div className="flex-1 max-w-lg">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bg} ${colors.border} border mb-6`}>
          <Icon className={`w-4 h-4 ${colors.text}`} />
          <span className={`text-xs font-bold uppercase tracking-widest ${colors.text}`}>{feature.tag}</span>
        </div>
        <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4 leading-tight">
          {feature.title}
        </h3>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {feature.description}
        </p>
      </div>

      {/* Visual */}
      <div className="flex-1 w-full max-w-md">
        <div className="relative rounded-2xl border border-white/[0.06] bg-[#141414] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="w-full h-10 border-b border-white/[0.04] flex items-center px-4 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
          </div>
          <FeatureVisual type={feature.visual} />
        </div>
      </div>
    </motion.div>
  );
}

export default function FeaturesShowcase() {
  return (
    <section className="py-28 px-6 max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-24">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4"
        >
          Deep Dive
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-black text-white tracking-tight"
        >
          Built for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
            Every Goal.
          </span>
        </motion.h2>
      </div>

      <div className="space-y-32">
        {features.map((feature, i) => (
          <FeatureRow key={feature.tag} feature={feature} index={i} />
        ))}
      </div>
    </section>
  );
}
