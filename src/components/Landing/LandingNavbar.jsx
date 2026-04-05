import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

export default function LandingNavbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex justify-center w-full px-6 pointer-events-none
        ${isScrolled ? "pt-6" : "pt-8"}`}
    >
      <div 
        className={`flex items-center justify-between transition-all duration-500 pointer-events-auto
          ${isScrolled 
            ? "w-full max-w-4xl bg-[#121212]/60 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-6 py-3 rounded-full" 
            : "w-full max-w-7xl bg-transparent px-2 py-2"
          }`}
      >
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Fitwise" className="w-8 h-8 drop-shadow-md" />
          <span className="font-extrabold text-xl tracking-tight text-white drop-shadow-md">
            FitWise
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            to="/auth"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/auth"
            className="text-sm font-bold bg-primary text-black px-6 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
