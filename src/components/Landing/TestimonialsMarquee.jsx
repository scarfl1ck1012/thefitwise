import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Users, Utensils, Dumbbell, Zap } from "lucide-react";

const testimonials = [
  {
    name: "Alex M.",
    role: "Powerlifter",
    image: "https://ui-avatars.com/api/?name=A+M&background=22c55e&color=fff&bold=true",
    quote: "The drag-and-drop workout builder is unreal. Building my PPL split takes 30 seconds now.",
  },
  {
    name: "Sarah K.",
    role: "Fitness Enthusiast",
    image: "https://ui-avatars.com/api/?name=S+K&background=3b82f6&color=fff&bold=true",
    quote: "Finally an app that looks as good as my gains. The dark mode is absolutely gorgeous.",
  },
  {
    name: "David H.",
    role: "CrossFit Athlete",
    image: "https://ui-avatars.com/api/?name=D+H&background=a855f7&color=fff&bold=true",
    quote: "The face yoga AR camera is such a unique feature. Never seen anything like that in a fitness app.",
  },
  {
    name: "Jessica L.",
    role: "Marathon Runner",
    image: "https://ui-avatars.com/api/?name=J+L&background=f59e0b&color=fff&bold=true",
    quote: "Tracking every gram is so easy. The AI coach checks my macros and tells me exactly what to eat before a run.",
  },
  {
    name: "Ryan T.",
    role: "Personal Trainer",
    image: "https://ui-avatars.com/api/?name=R+T&background=ef4444&color=fff&bold=true",
    quote: "I recommend FitWise to all my clients. The community leaderboard keeps everyone accountable.",
  },
  {
    name: "Mia C.",
    role: "Yoga Instructor",
    image: "https://ui-avatars.com/api/?name=M+C&background=ec4899&color=fff&bold=true",
    quote: "The skincare routines combined with face yoga exercises are a game changer for my morning ritual.",
  },
];

const duplicated = [...testimonials, ...testimonials, ...testimonials];

const stats = [
  { icon: Users, value: "10K+", label: "Active Users" },
  { icon: Utensils, value: "1M+", label: "Meals Tracked" },
  { icon: Dumbbell, value: "500K+", label: "Workouts Logged" },
  { icon: Zap, value: "99.9%", label: "Uptime" },
];

function AnimatedCounter({ value }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-3xl md:text-4xl font-black text-white"
    >
      {value}
    </motion.span>
  );
}

export default function TestimonialsMarquee() {
  return (
    <section className="py-28 overflow-hidden bg-[#0a0a0a] relative">
      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

      {/* Stats Banner */}
      <div className="max-w-5xl mx-auto px-6 mb-20 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
              >
                <Icon className="w-6 h-6 text-primary mx-auto mb-3" />
                <AnimatedCounter value={stat.value} />
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-2">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-16 relative z-20">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4"
        >
          Social Proof
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-black text-white tracking-tight"
        >
          Loved by{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
            Thousands.
          </span>
        </motion.h2>
      </div>

      {/* Marquee */}
      <div className="flex w-full overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{ ease: "linear", duration: 40, repeat: Infinity }}
          className="flex flex-nowrap gap-5 w-max pr-5"
        >
          {duplicated.map((t, idx) => (
            <div
              key={idx}
              className="w-[340px] md:w-[400px] shrink-0 bg-[#141414] border border-white/[0.06] p-7 rounded-2xl flex flex-col gap-5 backdrop-blur-xl hover:border-white/[0.12] transition-colors duration-300"
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                ))}
              </div>
              <p className="text-white/80 text-[15px] leading-relaxed flex-1">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-4 pt-2 border-t border-white/[0.04]">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                />
                <div>
                  <h4 className="text-white font-bold text-sm">{t.name}</h4>
                  <p className="text-muted-foreground text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
