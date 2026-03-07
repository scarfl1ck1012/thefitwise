import React from "react";
import LandingNavbar from "../components/Landing/LandingNavbar";
import HeroSection from "../components/Landing/HeroSection";
import BentoGrid from "../components/Landing/BentoGrid";
import TestimonialsMarquee from "../components/Landing/TestimonialsMarquee";
import FooterCTA from "../components/Landing/FooterCTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-foreground font-sans overflow-x-hidden relative selection:bg-primary/30">
      <LandingNavbar />
      <HeroSection />
      <BentoGrid />
      <TestimonialsMarquee />
      <FooterCTA />
    </div>
  );
}
