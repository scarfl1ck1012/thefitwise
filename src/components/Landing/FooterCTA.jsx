import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Instagram, Mail } from "lucide-react";

export default function FooterCTA() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(34,197,94,0.15),transparent_60%)] pointer-events-none" />

      <section className="relative z-10 py-32 px-6 flex flex-col items-center text-center max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
          Ready to build your <span className="text-primary">best self?</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-10">
          Join thousands of users leveling up their fitness today. No credit
          card required.
        </p>
        <Link
          to="/auth"
          className="bg-primary text-primary-foreground font-bold text-lg px-10 py-4 rounded-full hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] hover:-translate-y-1"
        >
          Create Free Account
        </Link>
      </section>

      <footer className="relative z-10 border-t border-border/30 bg-[#121212]/50 backdrop-blur-md pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Fitwise"
              className="w-6 h-6 grayscale opacity-80"
            />
            <span className="font-bold text-muted-foreground tracking-tight">
              Fitwise.
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 text-center text-xs text-muted-foreground/50">
          © {new Date().getFullYear()} Fitwise Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
