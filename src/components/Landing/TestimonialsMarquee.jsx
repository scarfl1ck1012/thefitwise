import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Alex M.",
    role: "Powerlifter",
    image: "https://ui-avatars.com/api/?name=A+M&background=22c55e&color=fff",
    quote:
      "The drag-and-drop workout builder saved my routine. I don't use anything else now.",
  },
  {
    name: "Sarah K.",
    role: "Fitness Enthusiast",
    image: "https://ui-avatars.com/api/?name=S+K&background=3b82f6&color=fff",
    quote:
      "Finally, a dark-mode fitness app that actually looks good. The aesthetics are unparalleled.",
  },
  {
    name: "David H.",
    role: "Crossfit",
    image: "https://ui-avatars.com/api/?name=D+H&background=ef4444&color=fff",
    quote:
      "The live cardio timer is a game-changer. My HIIT sessions are so much more organized.",
  },
  {
    name: "Jessica L.",
    role: "Marathoner",
    image: "https://ui-avatars.com/api/?name=J+L&background=f59e0b&color=fff",
    quote:
      "Tracking every gram of food is so easy. The AI coach even checks if I hit my macros!",
  },
];

// Duplicate the array to create a seamless loop
const duplicatedTestimonials = [
  ...testimonials,
  ...testimonials,
  ...testimonials,
];

export default function TestimonialsMarquee() {
  return (
    <section className="py-24 overflow-hidden bg-[#121212] relative border-y border-border/30 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#121212] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#121212] to-transparent z-10 pointer-events-none" />

      <div className="text-center mb-16 relative z-20">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          The Wall of <span className="text-primary">Love</span>
        </h2>
      </div>

      <div className="flex w-full overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 30, repeat: Infinity }}
          className="flex flex-nowrap gap-6 w-max pr-6"
        >
          {duplicatedTestimonials.map((t, idx) => (
            <div
              key={idx}
              className="w-[350px] md:w-[450px] shrink-0 bg-[#1e1e1e]/40 border border-border/50 p-6 rounded-2xl flex flex-col gap-4 backdrop-blur-sm"
            >
              <div className="flex items-center gap-1 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-white text-lg leading-relaxed flex-1">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-4 mt-4">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-white font-bold text-sm tracking-tight">
                    {t.name}
                  </h4>
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
