import { useState, useMemo, useEffect } from "react";
import { useProfile, calculateCalories } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLocalDate } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Save,
  CheckCircle2,
  Plus,
  Minus,
  Flame,
  Zap,
  Target,
  Sofa,
  Footprints,
  Bike,
  Dumbbell,
  Rocket,
  TrendingDown,
  Scale as ScaleIcon,
  TrendingUp,
  Trophy,
  Download,
  Trash2,
  Shield,
  AlertTriangle,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// --- Number Stepper ---
function NumberStepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  label,
}) {
  const num = parseFloat(value) || 0;
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => onChange(String(Math.max(min, num - step)))}
          disabled={num <= min}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <div className="flex-1 relative">
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-center pr-8"
            min={min}
            max={max}
            step={step}
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => onChange(String(Math.min(max, num + step)))}
          disabled={num >= max}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// --- Selectable Card Row ---
const ACTIVITY_OPTIONS = [
  {
    value: "sedentary",
    label: "Sedentary",
    desc: "Desk job, little movement",
    icon: Sofa,
    multiplier: 1.2,
  },
  {
    value: "light",
    label: "Light",
    desc: "Walk 1-2x/week",
    icon: Footprints,
    multiplier: 1.375,
  },
  {
    value: "moderate",
    label: "Moderate",
    desc: "Exercise 3-5x/week",
    icon: Bike,
    multiplier: 1.55,
  },
  {
    value: "active",
    label: "Very Active",
    desc: "Hard exercise 6-7x/week",
    icon: Dumbbell,
    multiplier: 1.725,
  },
  {
    value: "very_active",
    label: "Extra Active",
    desc: "Athletic / physical job",
    icon: Rocket,
    multiplier: 1.9,
  },
];

const GOAL_OPTIONS = [
  {
    value: "lose",
    label: "Lose",
    desc: "Cut 500 cal/day",
    icon: TrendingDown,
    adjust: -500,
  },
  {
    value: "maintain",
    label: "Maintain",
    desc: "Keep weight stable",
    icon: ScaleIcon,
    adjust: 0,
  },
  {
    value: "gain",
    label: "Lean Gain",
    desc: "Surplus 300 cal/day",
    icon: TrendingUp,
    adjust: 300,
  },
  {
    value: "bulk",
    label: "Bulk",
    desc: "Surplus 500 cal/day",
    icon: Trophy,
    adjust: 500,
  },
];

function SelectableCards({ options, value, onChange, label }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {options.map((opt) => {
          const Icon = opt.icon;
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all min-w-[90px] shrink-0 ${
                selected
                  ? "border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
                  : "border-border bg-muted/30 hover:border-muted-foreground/30"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${selected ? "text-primary" : "text-muted-foreground"}`}
              />
              <span
                className={`text-xs font-medium ${selected ? "text-foreground" : "text-muted-foreground"}`}
              >
                {opt.label}
              </span>
              <span className="text-[9px] text-muted-foreground leading-tight text-center">
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Main Page ---
export default function SettingsPage() {
  const { profile } = useProfile();
  const { updateProfile } = useProfile();
  const { user } = useAuth();

  const [name, setName] = useState(profile?.full_name || "");
  const [age, setAge] = useState(profile?.age?.toString() || "");
  const [gender, setGender] = useState(profile?.gender || "");
  const [height, setHeight] = useState(profile?.height_cm?.toString() || "");
  const [weight, setWeight] = useState(profile?.weight_kg?.toString() || "");
  const [activity, setActivity] = useState(
    profile?.activity_level || "moderate",
  );
  const [goal, setGoal] = useState(profile?.goal || "maintain");
  const [saved, setSaved] = useState(false);

  // Sync initial values when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setAge(profile.age?.toString() || "");
      setGender(profile.gender || "");
      setHeight(profile.height_cm?.toString() || "");
      setWeight(profile.weight_kg?.toString() || "");
      setActivity(profile.activity_level || "moderate");
      setGoal(profile.goal || "maintain");
    }
  }, [profile]);

  // Dirty state detection
  const isDirty = useMemo(() => {
    if (!profile) return false;
    return (
      name !== (profile.full_name || "") ||
      age !== (profile.age?.toString() || "") ||
      gender !== (profile.gender || "") ||
      height !== (profile.height_cm?.toString() || "") ||
      weight !== (profile.weight_kg?.toString() || "") ||
      activity !== (profile.activity_level || "moderate") ||
      goal !== (profile.goal || "maintain")
    );
  }, [name, age, gender, height, weight, activity, goal, profile]);

  // Live calorie calculation
  const liveCalories = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    if (!w || !h || !a || !gender) return null;

    // BMR (Mifflin-St Jeor)
    let bmr;
    if (gender === "male") {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    const activityOption = ACTIVITY_OPTIONS.find((o) => o.value === activity);
    const multiplier = activityOption?.multiplier || 1.55;
    const tdee = bmr * multiplier;

    const goalOption = GOAL_OPTIONS.find((o) => o.value === goal);
    const adjust = goalOption?.adjust || 0;
    const total = Math.round(tdee + adjust);
    const activeCals = Math.round(tdee - bmr);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      activeCals,
      adjust,
      total,
    };
  }, [weight, height, age, gender, activity, goal]);

  const handleSave = () => {
    updateProfile.mutate({
      full_name: name,
      age: parseInt(age) || null,
      gender,
      height_cm: parseFloat(height) || null,
      weight_kg: parseFloat(weight) || null,
      activity_level: activity,
      goal,
    });
    setSaved(true);
    toast.success("Profile saved! Calorie goal updated.");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    if (!profile) return;
    const blob = new Blob([JSON.stringify(profile, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitwise-profile-${getLocalDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Profile data exported!");
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure? This will permanently delete your account and all data. This action cannot be undone.",
      )
    )
      return;
    try {
      // Delete profile data first
      await supabase.from("profiles").delete().eq("user_id", user.id);
      await supabase.auth.signOut();
      toast.success("Account deleted. Sorry to see you go.");
    } catch {
      toast.error("Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Name & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Number Steppers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <NumberStepper
                label="Age"
                value={age}
                onChange={setAge}
                min={10}
                max={100}
                step={1}
                unit="yrs"
              />
              <NumberStepper
                label="Height"
                value={height}
                onChange={setHeight}
                min={100}
                max={250}
                step={1}
                unit="cm"
              />
              <NumberStepper
                label="Weight"
                value={weight}
                onChange={setWeight}
                min={30}
                max={300}
                step={0.5}
                unit="kg"
              />
            </div>

            {/* Activity Level Cards */}
            <SelectableCards
              label="Activity Level"
              options={ACTIVITY_OPTIONS}
              value={activity}
              onChange={setActivity}
            />

            {/* Goal Cards */}
            <SelectableCards
              label="Goal"
              options={GOAL_OPTIONS}
              value={goal}
              onChange={setGoal}
            />

            {/* Inline Save Button */}
            {isDirty && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="pt-2"
              >
                <Button
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                  className="w-full gap-2 shadow-sm"
                >
                  {saved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Profile
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Calorie Hero Card */}
      {liveCalories && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-card overflow-hidden border-primary/20">
            <div className="relative">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/3" />

              <CardContent className="relative p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Daily Calorie Goal
                  </span>
                </div>

                {/* Big number */}
                <motion.div
                  key={liveCalories.total}
                  initial={{ scale: 0.95, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-4xl font-bold text-foreground tracking-tight">
                    {liveCalories.total}
                    <span className="text-lg font-normal text-muted-foreground ml-1">
                      cal
                    </span>
                  </p>
                </motion.div>

                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Mifflin-St Jeor &middot; Updated live
                </p>

                {/* BMR + Active breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">BMR (at rest)</span>
                    <span className="font-medium text-foreground">
                      {liveCalories.bmr} cal
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-2 rounded-full bg-primary/40"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(liveCalories.bmr / liveCalories.tdee) * 100}%`,
                      }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Active calories
                    </span>
                    <span className="font-medium text-primary">
                      +{liveCalories.activeCals} cal
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-2 rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(liveCalories.activeCals / liveCalories.tdee) * 100}%`,
                      }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    />
                  </div>
                  {liveCalories.adjust !== 0 && (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
                      <span className="text-muted-foreground">
                        Goal adjustment
                      </span>
                      <span
                        className={`font-medium ${liveCalories.adjust < 0 ? "text-destructive" : "text-success"}`}
                      >
                        {liveCalories.adjust > 0 ? "+" : ""}
                        {liveCalories.adjust} cal
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Account Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="text-sm font-medium text-foreground">
                  {user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-card border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              These actions are permanent and cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs"
                onClick={handleExport}
              >
                <Download className="h-3.5 w-3.5" /> Export My Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
