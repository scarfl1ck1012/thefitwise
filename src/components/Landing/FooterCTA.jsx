import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Twitter, Instagram, Mail, Github } from "lucide-react";

export default function FooterCTA() {
  return (
    <div className="relative overflow-hidden bg-[#080808]">
      {/* Cinematic radial glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-primary/8 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/15 blur-[120px] rounded-full pointer-events-none" />

      {/* CTA Section */}
      <section className="relative z-10 py-40 px-6 flex flex-col items-center text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-6">
            Start Today
          </p>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1]">
            Ready to build your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-teal-400">
              best self?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">
            Join the community of people leveling up their fitness, nutrition, and wellness. Free forever.
          </p>
          <Link
            to="/auth"
            className="group inline-flex items-center gap-3 bg-primary text-black font-extrabold text-lg px-10 py-5 rounded-full hover:bg-primary/90 transition-all shadow-[0_0_40px_rgba(34,197,94,0.25)] hover:shadow-[0_0_60px_rgba(34,197,94,0.4)] hover:-translate-y-1"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Top row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-10">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="FitWise" className="w-8 h-8" />
              <span className="font-extrabold text-xl text-white tracking-tight">FitWise</span>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <Link to="/auth" className="text-white/50 hover:text-white transition-colors font-medium">Features</Link>
              <a href="#" className="text-white/50 hover:text-white transition-colors font-medium">Pricing</a>
              <a href="#" className="text-white/50 hover:text-white transition-colors font-medium">About</a>
              <a href="#" className="text-white/50 hover:text-white transition-colors font-medium">Contact</a>
            </div>

            <div className="flex items-center gap-5">
              <a href="#" className="text-white/30 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/30 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/30 hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/30 hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.04] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-white/25">
              © {new Date().getFullYear()} FitWise. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-xs text-white/25">
              <a href="#" className="hover:text-white/50 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white/50 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white/50 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
