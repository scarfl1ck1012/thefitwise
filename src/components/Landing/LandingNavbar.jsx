import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingNavbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-[#121212]/70 border-b border-border/40"
    >
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="Fitwise" className="w-8 h-8" />
        <span className="font-bold text-xl tracking-tight text-white">
          Fitwise
        </span>
      </div>
      <div className="flex items-center gap-6">
        <Link
          to="/auth"
          className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
        >
          Log In
        </Link>
        <Link
          to="/auth"
          className="text-sm font-bold bg-primary text-primary-foreground px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)]"
        >
          Get Started Free
        </Link>
      </div>
    </motion.nav>
  );
}
