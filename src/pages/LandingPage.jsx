import React from "react";
import LandingNavbar from "../components/Landing/LandingNavbar";
import HeroSection from "../components/Landing/HeroSection";
import BentoGrid from "../components/Landing/BentoGrid";
import FeaturesShowcase from "../components/Landing/FeaturesShowcase";
import TestimonialsMarquee from "../components/Landing/TestimonialsMarquee";
import FooterCTA from "../components/Landing/FooterCTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden relative selection:bg-primary/30">
      <LandingNavbar />
      <HeroSection />
      <BentoGrid />
      <FeaturesShowcase />
      <TestimonialsMarquee />
      <FooterCTA />
    </div>
  );
}
