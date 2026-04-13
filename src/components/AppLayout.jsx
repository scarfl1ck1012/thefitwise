import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "@/hooks/useTheme";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Weight,
  Dumbbell,
  Activity,
  Trophy,
  Sparkles,
  Users,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FitwiseChat from "@/components/FitwiseChat";
import OnboardingTutorial from "@/components/OnboardingTutorial";
const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/meals", icon: UtensilsCrossed, label: "Meals" },
  { to: "/weight", icon: Weight, label: "Weight" },
  { to: "/workouts", icon: Activity, label: "Progress" },
  { to: "/gym", icon: Dumbbell, label: "Gym" },
  { to: "/habits", icon: Trophy, label: "Habits & XP" },
  { to: "/face-care", icon: Sparkles, label: "Face & Skincare" },
  { to: "/community", icon: Users, label: "Community" },
  { to: "/settings", icon: Settings, label: "Settings" },
];
export default function AppLayout() {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = profile?.full_name || "User";
  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface-low p-4 fixed h-full z-20">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <img src="/logo.png" alt="FitWise" className="h-6 w-auto" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            The Fit Wise
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                    : "text-muted-foreground hover:bg-surface-high/50 hover:text-foreground"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2 pt-4 border-t border-surface-high/50">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">{displayName}</span>
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 w-full transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface-low/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="FitWise" className="h-7 w-auto" />
          <span className="font-bold text-foreground">The Fit Wise</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-foreground"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 z-40 bg-surface-lowest/95 backdrop-blur-xl pt-16"
          >
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/dashboard"}
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    setTimeout(() => navigate(item.to), 250);
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]" : "text-muted-foreground hover:bg-surface-high/50 hover:text-foreground"}`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}

              <button
                onClick={signOut}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 w-full"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 min-w-0 lg:ml-64 pt-14 lg:pt-0 overflow-x-hidden">
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="fixed top-4 right-4 lg:top-6 lg:right-6 z-[70] h-11 w-20 rounded-full border border-border/50 bg-surface-low/85 backdrop-blur-xl shadow-card transition-all hover:scale-[1.02] active:scale-95"
      >
        <span
          className={`absolute top-1 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-transform duration-300 ${isDark ? "translate-x-1" : "translate-x-10"}`}
        >
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </span>
      </button>

      <FitwiseChat />
      <OnboardingTutorial />
    </div>
  );
}
