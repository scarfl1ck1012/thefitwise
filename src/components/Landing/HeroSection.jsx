import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, Droplets, Activity, PieChart, Sparkles } from "lucide-react";

export default function HeroSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yDashboard = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const yWidget1 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const yWidget2 = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  // Staggered text animation
  const textChars = "Stop Guessing.".split(" ");
  const textChars2 = "Start Growing.".split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section ref={containerRef} className="relative pt-36 pb-32 lg:pt-52 lg:pb-40 overflow-hidden perspective-1000">
      {/* Background Deep Space Glow */}
      <motion.div style={{ y: yBg }} className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 z-10 flex flex-col items-center">
        {/* Kinetic Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[1.1]">
            <div className="flex justify-center gap-4 flex-wrap">
              {textChars.map((word, i) => (
                <motion.span key={`w1-${i}`} variants={wordVariants} className="inline-block">
                  {word}
                </motion.span>
              ))}
            </div>
            <div className="flex justify-center gap-4 flex-wrap mt-2">
              {textChars2.map((word, i) => (
                <motion.span key={`w2-${i}`} variants={wordVariants} className="inline-block text-primary drop-shadow-[0_0_25px_rgba(34,197,94,0.4)]">
                  {word}
                </motion.span>
              ))}
            </div>
          </h1>

          <motion.p
            variants={wordVariants}
            className="mt-8 text-xl md:text-2xl text-muted-foreground/80 leading-relaxed font-medium max-w-2xl mx-auto"
          >
            The ultimate AI-powered wellness OS. Track precision macros, build
            drag-and-drop workouts, and evolve daily—all in one place.
          </motion.p>

          <motion.div variants={wordVariants} className="mt-12 flex items-center justify-center">
            <Link
              to="/auth"
              className="group relative inline-flex items-center gap-3 bg-primary text-black font-extrabold text-lg px-8 py-4 rounded-full overflow-hidden transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_50px_rgba(34,197,94,0.5)] hover:-translate-y-1"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Parallax UI Mockup */}
        <div className="mt-24 md:mt-32 w-full max-w-5xl relative h-[400px] md:h-[600px] mx-auto pointer-events-none">
          {/* Main Dashboard layer */}
          <motion.div
            style={{ y: yDashboard, rotateX: 10, rotateZ: -1 }}
            className="absolute inset-x-0 mx-auto w-[90%] md:w-[800px] aspect-[16/10] rounded-2xl border border-white/10 bg-[#121212]/80 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Fake Nav */}
            <div className="w-full h-12 border-b border-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            {/* Fake Content area */}
            <div className="p-6 flex gap-6 h-full">
              <div className="w-48 hidden md:flex flex-col gap-4">
                <div className="h-6 w-24 bg-white/5 rounded-md" />
                <div className="h-4 w-full bg-white/5 rounded-md mt-4" />
                <div className="h-4 w-full bg-white/5 rounded-md" />
                <div className="h-4 w-3/4 bg-white/5 rounded-md" />
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex-1 h-24 bg-primary/10 rounded-xl border border-primary/20 flex flex-col justify-center p-4">
                     <Flame className="text-primary w-6 h-6 mb-2" />
                     <div className="h-4 w-16 bg-white/20 rounded" />
                  </div>
                  <div className="flex-1 h-24 bg-blue-500/10 rounded-xl border border-blue-500/20 flex flex-col justify-center p-4">
                     <Droplets className="text-blue-500 w-6 h-6 mb-2" />
                     <div className="h-4 w-16 bg-white/20 rounded" />
                  </div>
                </div>
                <div className="flex-1 bg-white/5 rounded-xl border border-white/10 flex items-end gap-2 p-4">
                   {[...Array(10)].map((_, i) => (
                      <div key={i} className="flex-1 bg-primary/30 rounded-t-sm" style={{ height: `${Math.max(20, Math.random() * 100)}%` }} />
                   ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating Widget 1: Macros Donut */}
          <motion.div
            style={{ y: yWidget1 }}
            className="absolute top-[10%] left-[5%] md:-left-[5%] w-48 h-56 rounded-2xl border border-white/10 bg-[#1a1a1a]/90 backdrop-blur-xl shadow-2xl p-5 flex flex-col items-center justify-center gap-4"
          >
            <div className="w-24 h-24 rounded-full border-8 border-[#2a2a2a] relative flex items-center justify-center">
               <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[1.1]" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-primary opacity-80" strokeDasharray="251" strokeDashoffset="60" strokeLinecap="round" />
               </svg>
               <PieChart className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white">Daily Macros</div>
              <div className="text-xs text-muted-foreground mt-1">140g Protein left</div>
            </div>
          </motion.div>

          {/* Floating Widget 2: Face Yoga Card */}
          <motion.div
            style={{ y: yWidget2 }}
            className="absolute bottom-[20%] right-[5%] md:-right-[5%] w-56 h-auto rounded-2xl border border-white/10 bg-[#1a1a1a]/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 flex gap-4 items-center"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Face Care</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 font-bold">Morning Routine</div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
