import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, PieChart, Dumbbell, Trophy } from "lucide-react";

export default function BentoGrid() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
          Smarter Tracking.{" "}
          <span className="text-primary">Faster Results.</span>
        </h2>
        <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
          Everything you need to optimize your fitness journey, packaged in a
          sleek, distraction-free interface.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
        {/* Card 1 (Wide): AI Coach */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{
            scale: 0.99,
            borderColor: "rgba(34, 197, 94, 0.4)",
            boxShadow: "0 0 30px rgba(34, 197, 94, 0.1)",
          }}
          className="md:col-span-2 rounded-3xl bg-[#1e1e1e]/60 border border-border/50 p-8 flex flex-col justify-between overflow-hidden relative transition-all duration-300 backdrop-blur-md group"
        >
          {/* Mock Chat UI */}
          <div className="flex-1 flex flex-col gap-4 mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
            <div className="self-end bg-primary/20 text-white text-sm py-2 px-4 rounded-2xl rounded-tr-sm max-w-[80%] border border-primary/30">
              Did I hit my macros today?
            </div>
            <div className="self-start flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-[#2a2a2a] text-muted-foreground text-sm py-3 px-4 rounded-2xl rounded-tl-sm border border-border/50">
                You're crushing it! You hit 180g of protein, but you have 40g of
                carbs left. Maybe a quick banana before the gym?
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Your Personal AI Coach
            </h3>
            <p className="text-muted-foreground">
              Ask questions, verify your macro intake, and get personalized
              advice instantly.
            </p>
          </div>
        </motion.div>

        {/* Card 2 (Tall): Precision Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{
            scale: 0.99,
            borderColor: "rgba(34, 197, 94, 0.4)",
            boxShadow: "0 0 30px rgba(34, 197, 94, 0.1)",
          }}
          className="md:row-span-2 rounded-3xl bg-[#1e1e1e]/60 border border-border/50 p-8 flex flex-col items-center text-center justify-between overflow-hidden relative transition-all duration-300 backdrop-blur-md group"
        >
          {/* Glow Donut Chart Mockup */}
          <div className="flex-1 flex items-center justify-center w-full py-12 relative">
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
            <div className="w-48 h-48 rounded-full border-[16px] border-[#2a2a2a] relative">
              {/* SVG fake stroke */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90 scale-[1.15]"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-primary opacity-80"
                  strokeDasharray="251"
                  strokeDashoffset="75"
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  className="opacity-80"
                  strokeDasharray="251"
                  strokeDashoffset="200"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">2,140</span>
                <span className="text-xs text-muted-foreground font-medium">
                  KCAL
                </span>
              </div>
            </div>
          </div>
          <div className="w-full">
            <PieChart className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Track Every Gram
            </h3>
            <p className="text-muted-foreground text-sm">
              Tap into our 700+ verified food database to nail your macros with
              precision.
            </p>
          </div>
        </motion.div>

        {/* Card 3 (Square): Drag & Drop Gym */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{
            scale: 0.99,
            borderColor: "rgba(34, 197, 94, 0.4)",
            boxShadow: "0 0 30px rgba(34, 197, 94, 0.1)",
          }}
          className="rounded-3xl bg-[#1e1e1e]/60 border border-border/50 p-8 flex flex-col justify-between overflow-hidden relative transition-all duration-300 backdrop-blur-md group"
        >
          {/* Gym Split Visual */}
          <div className="flex-1 flex gap-2 mb-8 opacity-80 group-hover:opacity-100 transition-opacity justify-center items-end">
            {["M", "T", "W", "T", "F"].map((day, i) => (
              <div key={day} className="flex flex-col gap-2 items-center">
                <div
                  className={`w-10 rounded-md border text-xs font-bold flex items-center justify-center p-2 
                    ${
                      i === 0
                        ? "bg-primary/20 text-primary border-primary/30 h-20"
                        : i === 2
                          ? "bg-blue-500/20 text-blue-500 border-blue-500/30 h-16"
                          : "bg-[#2a2a2a] text-muted-foreground border-border/50 h-12"
                    }`}
                ></div>
                <span className="text-[10px] text-muted-foreground font-bold">
                  {day}
                </span>
              </div>
            ))}
          </div>
          <div>
            <Dumbbell className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Build Your Perfect Split
            </h3>
            <p className="text-muted-foreground text-sm">
              Drag, drop, and organize your weekly gym routine seamlessly.
            </p>
          </div>
        </motion.div>

        {/* Card 4 (Square): Community */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{
            scale: 0.99,
            borderColor: "rgba(34, 197, 94, 0.4)",
            boxShadow: "0 0 30px rgba(34, 197, 94, 0.1)",
          }}
          className="rounded-3xl bg-[#1e1e1e]/60 border border-border/50 p-8 flex flex-col justify-between overflow-hidden relative transition-all duration-300 backdrop-blur-md group"
        >
          {/* Podium Visual */}
          <div className="flex-1 flex items-end justify-center mb-8 gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-[#2a2a2a] rounded-t-lg border-t-2 border-gray-400 flex items-start justify-center pt-2 text-xs font-bold text-gray-400">
              2
            </div>
            <div className="w-14 h-20 bg-primary/20 rounded-t-lg border-t-2 border-primary flex items-start justify-center pt-2 text-xs font-bold text-primary">
              1
            </div>
            <div className="w-12 h-8 bg-[#2a2a2a] rounded-t-lg border-t-2 border-amber-600 flex items-start justify-center pt-2 text-xs font-bold text-amber-600">
              3
            </div>
          </div>
          <div>
            <Trophy className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Compete & Level Up
            </h3>
            <p className="text-muted-foreground text-sm">
              Climb the leaderboard, earn XP, and hold your friends accountable.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
