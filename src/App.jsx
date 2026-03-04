import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthPage from "./pages/AuthPage";
import AppLayout from "./components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import MealsPage from "./pages/MealsPage";
import WeightPage from "./pages/WeightPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import HabitsPage from "./pages/HabitsPage";
import FaceCarePage from "./pages/FaceCarePage";
import SettingsPage from "./pages/SettingsPage";
import GymPage from "./pages/GymPage";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
function AuthGuard() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-glow gradient-primary p-4 rounded-xl">
          <span className="text-primary-foreground font-bold text-lg">
            Fitwise
          </span>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <AppLayout />;
}
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<AuthGuard />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/meals" element={<MealsPage />} />
            <Route path="/weight" element={<WeightPage />} />
            <Route path="/workouts" element={<WorkoutsPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/face-care" element={<FaceCarePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/gym" element={<GymPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;
