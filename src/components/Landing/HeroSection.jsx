import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, Droplets, Activity } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 z-10">
        {/* Text Content */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight"
          >
            Stop Guessing. <br className="hidden md:block" />
            <span className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">
              Start Growing.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed"
          >
            The ultimate AI-powered fitness companion. Track precision macros,
            build drag-and-drop workouts, and consult your personal AI coach—all
            in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10"
          >
            <Link
              to="/auth"
              className="group flex items-center gap-2 bg-primary text-primary-foreground font-bold text-lg px-8 py-4 rounded-full hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:shadow-[0_0_30px_rgba(var(--primary),0.6)] hover:-translate-y-1"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Dashboard Mockup Visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-20 md:mt-28 relative mx-auto max-w-5xl"
        >
          {/* Decorative gradients for the mock up */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 blur-2xl rounded-[2rem] opacity-50" />

          <div
            className="relative rounded-2xl border border-border/50 bg-[#121212]/80 backdrop-blur-xl p-4 md:p-6 shadow-2xl overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to bottom, black 60%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 60%, transparent 100%)",
            }}
          >
            {/* The CSS Grid Mockup */}
            <div className="flex gap-6 h-[400px] md:h-[500px] opacity-80 pointer-events-none">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col w-64 gap-4 bg-[#1e1e1e] rounded-xl border border-border/50 p-4">
                <div className="h-8 w-32 bg-border/50 rounded-lg mb-4" />
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-border/30 rounded-lg w-full"
                  />
                ))}
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col gap-6">
                {/* Top Header stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-24 bg-[#1e1e1e] rounded-xl border border-border/50 flex flex-col justify-center p-4 gap-2"
                    >
                      <div className="h-4 w-8 bg-border/50 rounded" />
                      <div className="h-6 w-16 bg-border/80 rounded" />
                    </div>
                  ))}
                </div>

                {/* Main Graph Area */}
                <div className="flex-1 bg-[#1e1e1e] rounded-xl border border-border/50 p-6 flex flex-col gap-4">
                  <div className="h-6 w-32 bg-border/50 rounded mb-4" />
                  {/* Fake bars */}
                  <div className="flex-1 flex items-end gap-2 md:gap-4 overflow-hidden">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary/20 rounded-t-sm relative"
                      >
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-primary/80 rounded-t-sm"
                          style={{ height: `${Math.random() * 60 + 20}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
