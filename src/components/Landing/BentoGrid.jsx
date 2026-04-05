import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { MessageSquare, PieChart, Dumbbell, Trophy, Sparkles, Heart } from "lucide-react";

function GlowCard({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      className={`relative rounded-3xl bg-[#141414] border border-white/[0.06] overflow-hidden transition-all duration-300 group ${className}`}
    >
      {/* Mouse-tracking glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34,197,94,0.08), transparent 60%)`,
        }}
      />
      {/* Border glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
        style={{
          background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34,197,94,0.15), transparent 50%)`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}

export default function BentoGrid() {
  return (
    <section className="py-28 px-6 max-w-7xl mx-auto relative z-10">
      {/* Section Header */}
      <div className="text-center mb-20">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4"
        >
          Everything You Need
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight"
        >
          Smarter Tracking.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
            Faster Results.
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-5 text-muted-foreground text-lg max-w-2xl mx-auto"
        >
          Everything you need to optimize your wellness journey, packaged in a
          sleek, distraction-free interface.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(280px,auto)]">
        {/* Card 1 (Wide): AI Coach */}
        <GlowCard className="md:col-span-2 p-8 flex flex-col justify-between" delay={0}>
          <div className="flex-1 flex flex-col gap-4 mb-8">
            {/* Chat bubbles */}
            <div className="self-end bg-white/5 text-white/90 text-sm py-3 px-5 rounded-2xl rounded-tr-sm max-w-[75%] border border-white/[0.06]">
              Did I hit my macros today?
            </div>
            <div className="self-start flex gap-3 max-w-[85%]">
              <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-white/[0.03] text-white/70 text-sm py-3 px-5 rounded-2xl rounded-tl-sm border border-white/[0.06]">
                You're crushing it! 180g protein hit. You have 40g carbs left — maybe a banana pre-gym?
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white">AI Coach</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Ask questions, verify your macro intake, and get personalized
              advice — powered by Gemini.
            </p>
          </div>
        </GlowCard>

        {/* Card 2 (Tall): Precision Tracking */}
        <GlowCard className="md:row-span-2 p-8 flex flex-col items-center text-center justify-between" delay={0.1}>
          <div className="flex-1 flex items-center justify-center w-full py-8 relative">
            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
            <div className="w-44 h-44 rounded-full border-[14px] border-white/[0.04] relative flex items-center justify-center">
              <svg
                className="absolute inset-0 w-full h-full -rotate-90 scale-[1.15]"
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="7" className="text-primary/70" strokeDasharray="251" strokeDashoffset="75" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="7" className="opacity-60" strokeDasharray="251" strokeDashoffset="200" strokeLinecap="round" />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-white">2,140</span>
                <span className="text-[10px] text-muted-foreground font-bold tracking-widest mt-1">KCAL</span>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <PieChart className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Track Every Gram</h3>
            <p className="text-muted-foreground text-sm">
              Tap into our verified food database to nail your macros with surgical precision.
            </p>
          </div>
        </GlowCard>

        {/* Card 3: Gym Builder */}
        <GlowCard className="p-8 flex flex-col justify-between" delay={0.15}>
          <div className="flex-1 flex gap-2 mb-8 justify-center items-end">
            {["M", "T", "W", "T", "F"].map((day, i) => (
              <div key={`${day}-${i}`} className="flex flex-col gap-2 items-center">
                <div
                  className={`w-10 rounded-lg border text-xs font-bold flex items-center justify-center p-2 transition-all duration-300
                    ${i === 0
                      ? "bg-primary/15 text-primary border-primary/20 h-20"
                      : i === 2
                        ? "bg-blue-500/15 text-blue-400 border-blue-500/20 h-16"
                        : "bg-white/[0.03] text-white/30 border-white/[0.06] h-12"
                    }`}
                />
                <span className="text-[10px] text-muted-foreground font-bold">{day}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white">Gym Builder</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Drag, drop, and organize your weekly gym routine seamlessly.
            </p>
          </div>
        </GlowCard>

        {/* Card 4: Community */}
        <GlowCard className="p-8 flex flex-col justify-between" delay={0.2}>
          <div className="flex-1 flex items-end justify-center mb-8 gap-3">
            <div className="w-14 h-14 bg-white/[0.03] rounded-t-xl border-t-2 border-white/20 flex items-start justify-center pt-2 text-sm font-bold text-white/40">2</div>
            <div className="w-16 h-24 bg-primary/10 rounded-t-xl border-t-2 border-primary flex items-start justify-center pt-3 text-sm font-bold text-primary">1</div>
            <div className="w-14 h-10 bg-white/[0.03] rounded-t-xl border-t-2 border-amber-500/50 flex items-start justify-center pt-2 text-sm font-bold text-amber-500/70">3</div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white">Compete & Win</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Climb the leaderboard, earn XP, and hold your friends accountable.
            </p>
          </div>
        </GlowCard>

        {/* Card 5: Face Yoga */}
        <GlowCard className="md:col-span-2 p-8 flex flex-col md:flex-row gap-8 items-center" delay={0.25}>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Face Care & Yoga</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Step-by-step morning and night skincare routines with guided face yoga exercises and a live AR practice camera.
            </p>
            <div className="flex gap-3">
              <div className="px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">Morning Routine</div>
              <div className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">Night Routine</div>
              <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">AR Camera</div>
            </div>
          </div>
          <div className="w-full md:w-64 shrink-0">
            <div className="space-y-2">
              {["Neck Tilts", "Chin Lifts", "Eye Squeeze", "Forehead Smoother"].map((name, i) => (
                <div key={name} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</div>
                  <span className="text-white text-sm font-medium">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </GlowCard>

        {/* Card 6: Health Metrics */}
        <GlowCard className="p-8 flex flex-col justify-between" delay={0.3}>
          <div className="flex-1 flex flex-col gap-3 mb-8">
            {[
              { label: "Body Fat", value: "18%", color: "bg-primary" },
              { label: "Hydration", value: "72%", color: "bg-blue-500" },
              { label: "Muscle Mass", value: "65%", color: "bg-purple-500" },
            ].map((m) => (
              <div key={m.label} className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/60 font-medium">{m.label}</span>
                  <span className="text-white font-bold">{m.value}</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className={`h-full ${m.color} rounded-full`} style={{ width: m.value }} />
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white">Body Metrics</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Accurate body fat, muscle mass, and hydration tracking based on real data.
            </p>
          </div>
        </GlowCard>
      </div>
    </section>
  );
}
