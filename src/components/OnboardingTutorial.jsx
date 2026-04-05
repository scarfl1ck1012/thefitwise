import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Weight,
  Activity,
  Dumbbell,
  Trophy,
  Sparkles,
  Users,
  Settings,
  ArrowRight,
  ArrowLeft,
  X,
  Rocket,
  CheckCircle2,
} from "lucide-react";

const ONBOARDING_KEY = "fitwise_onboarding_complete";

const steps = [
  {
    id: "welcome",
    icon: Rocket,
    color: "primary",
    title: "Welcome to FitWise!",
    subtitle: "Your all-in-one wellness companion",
    description:
      "Let's take a quick tour so you can get the most out of FitWise. This will only take a minute.",
    tip: null,
  },
  {
    id: "settings",
    icon: Settings,
    color: "primary",
    title: "First Things First",
    subtitle: "Set up your profile",
    description:
      "Head to Settings and fill in your personal details — age, height, weight, gender, and fitness goal. This powers all your calorie calculations, body metrics, and personalized recommendations.",
    tip: "Without this step, your dashboard data won't be accurate!",
    route: "/settings",
  },
  {
    id: "dashboard",
    icon: LayoutDashboard,
    color: "primary",
    title: "Dashboard",
    subtitle: "Your daily command center",
    description:
      "See your calorie budget, water intake, caffeine tracker, workout streak, and weekly activity calendar — all at a glance. Everything updates in real-time as you log throughout the day.",
    tip: null,
    route: "/dashboard",
  },
  {
    id: "meals",
    icon: UtensilsCrossed,
    color: "blue-500",
    title: "Meals",
    subtitle: "Track every bite",
    description:
      "Search from a massive recipe database, log meals by type (breakfast, lunch, dinner, snack), and watch your macro pie chart fill up. You can also use the AI meal analyzer to snap a photo of your plate.",
    tip: null,
    route: "/meals",
  },
  {
    id: "weight",
    icon: Weight,
    color: "purple-500",
    title: "Weight Tracker",
    subtitle: "Watch your transformation",
    description:
      "Log your weight daily or weekly to see trend lines. Set a goal weight and target date — FitWise will auto-adjust your daily calorie target to keep you on track.",
    tip: null,
    route: "/weight",
  },
  {
    id: "workouts",
    icon: Activity,
    color: "orange-500",
    title: "Progress",
    subtitle: "Body metrics & workout data",
    description:
      "View your calculated body fat percentage, muscle mass ratio, and hydration levels based on your real profile data. Track workout check-ins and see your consistency over time.",
    tip: null,
    route: "/workouts",
  },
  {
    id: "gym",
    icon: Dumbbell,
    color: "red-500",
    title: "Gym",
    subtitle: "Build your perfect split",
    description:
      "Create a fully custom weekly gym routine. Add exercises with sets, reps, and weights. Track your active workout session in real-time with built-in rest timers.",
    tip: null,
    route: "/gym",
  },
  {
    id: "habits",
    icon: Trophy,
    color: "amber-500",
    title: "Habits & XP",
    subtitle: "Gamify your journey",
    description:
      "Earn XP for logging meals, completing workouts, and hitting streaks. Level up, unlock badges, and compete on the leaderboard. Consistency is rewarded!",
    tip: null,
    route: "/habits",
  },
  {
    id: "facecare",
    icon: Sparkles,
    color: "orange-400",
    title: "Face & Skincare",
    subtitle: "Glow from within",
    description:
      "Follow step-by-step morning and night skincare routines with product tips. Practice guided face yoga exercises with a live AR camera that mirrors your movements.",
    tip: null,
    route: "/face-care",
  },
  {
    id: "community",
    icon: Users,
    color: "teal-500",
    title: "Community",
    subtitle: "Compete & connect",
    description:
      "See the global leaderboard, add friends, and keep each other accountable. Your XP, level, and streak are visible to everyone — so stay consistent!",
    tip: null,
    route: "/community",
  },
  {
    id: "done",
    icon: CheckCircle2,
    color: "primary",
    title: "You're All Set!",
    subtitle: "Time to crush it",
    description:
      "Head to Settings to fill in your profile, then start logging your first meal or workout. FitWise adapts to you — the more you use it, the smarter it gets.",
    tip: "Pro tip: Start with Settings → fill your info → then explore!",
  },
];

const colorMap = {
  "primary": { bg: "bg-primary/15", border: "border-primary/30", text: "text-primary", glow: "shadow-[0_0_30px_rgba(34,197,94,0.15)]" },
  "blue-500": { bg: "bg-blue-500/15", border: "border-blue-500/30", text: "text-blue-400", glow: "shadow-[0_0_30px_rgba(59,130,246,0.15)]" },
  "purple-500": { bg: "bg-purple-500/15", border: "border-purple-500/30", text: "text-purple-400", glow: "shadow-[0_0_30px_rgba(168,85,247,0.15)]" },
  "orange-500": { bg: "bg-orange-500/15", border: "border-orange-500/30", text: "text-orange-400", glow: "shadow-[0_0_30px_rgba(249,115,22,0.15)]" },
  "red-500": { bg: "bg-red-500/15", border: "border-red-500/30", text: "text-red-400", glow: "shadow-[0_0_30px_rgba(239,68,68,0.15)]" },
  "amber-500": { bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-400", glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]" },
  "orange-400": { bg: "bg-orange-400/15", border: "border-orange-400/30", text: "text-orange-400", glow: "shadow-[0_0_30px_rgba(251,146,60,0.15)]" },
  "teal-500": { bg: "bg-teal-500/15", border: "border-teal-500/30", text: "text-teal-400", glow: "shadow-[0_0_30px_rgba(20,184,166,0.15)]" },
};

export default function OnboardingTutorial() {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      // Small delay so the page loads first
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsVisible(false);
    navigate("/settings");
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsVisible(false);
  };

  const handleNext = () => {
    if (step === steps.length - 1) {
      handleComplete();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  const current = steps[step];
  const colors = colorMap[current.color];
  const Icon = current.icon;
  const progress = ((step + 1) / steps.length) * 100;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleSkip} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-card dark:bg-[#141414] rounded-3xl border border-border/30 shadow-2xl overflow-hidden"
          >
            {/* Progress Bar */}
            <div className="h-1 bg-surface-high">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            {/* Close/Skip button */}
            <button
              onClick={handleSkip}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${colors.bg} ${colors.border} border ${colors.glow} flex items-center justify-center mb-6`}>
                    <Icon className={`w-8 h-8 ${colors.text}`} />
                  </div>

                  {/* Step Counter */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Step {step + 1} of {steps.length}
                    </span>
                    {current.route && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                        {current.route}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-black text-foreground tracking-tight mb-1">
                    {current.title}
                  </h2>
                  <p className={`text-sm font-bold ${colors.text} mb-4`}>
                    {current.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-muted-foreground text-[15px] leading-relaxed mb-6">
                    {current.description}
                  </p>

                  {/* Tip */}
                  {current.tip && (
                    <div className={`p-4 rounded-xl ${colors.bg} ${colors.border} border`}>
                      <p className={`text-sm font-semibold ${colors.text}`}>
                        💡 {current.tip}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Dots & Buttons */}
            <div className="px-8 pb-8 flex items-center justify-between">
              {/* Dots */}
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step
                        ? "w-6 bg-primary"
                        : i < step
                        ? "w-1.5 bg-primary/40"
                        : "w-1.5 bg-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                {step > 0 && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-primary text-black font-bold text-sm px-6 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.35)]"
                >
                  {step === steps.length - 1 ? "Go to Settings" : "Next"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
