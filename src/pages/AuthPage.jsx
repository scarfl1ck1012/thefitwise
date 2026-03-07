import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Dumbbell, Heart } from "lucide-react";
import { motion } from "framer-motion";
export default function AuthPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data?.user && data?.session === null) {
          toast.success(
            "Confirmation email sent! Please check your inbox and verify your email.",
            {
              duration: 5000,
            },
          );
          setIsLogin(true);
        } else {
          toast.success("Account created! You're signed in.");
        }
      }
    } catch (err) {
      const msg = err?.message?.toLowerCase() || "";
      if (
        err instanceof TypeError ||
        msg.includes("failed to fetch") ||
        msg.includes("network")
      ) {
        toast.error(
          "Network error. Check your internet connection and try again.",
        );
      } else if (err.status === 400) {
        if (msg.includes("password") && msg.includes("at least")) {
          toast.error("Password must be at least 6 characters long.");
        } else if (msg.includes("email not confirmed")) {
          toast.error(
            "Please check your email and confirm your account first.",
          );
        } else {
          toast.error("Incorrect email or password. Please try again.");
        }
      } else if (err.status === 422) {
        toast.error(
          "This email already has an account. Try signing in instead.",
        );
      } else if (err.status === 429) {
        toast.error("Too many attempts. Please wait a moment and try again.");
      } else {
        toast.error(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <img src="/logo.png" alt="FitWise" className="h-20 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">The Fit Wise</h1>
          <p className="text-muted-foreground mt-1">
            Wellness · Guidance · Knowledge
          </p>
        </div>

        <Card className="shadow-elevated">
          <CardHeader className="text-center">
            <CardTitle>{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Sign in to continue your journey"
                : "Start your fitness journey today"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}
              </Button>
            </form>
            <div className="text-center mt-4">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
