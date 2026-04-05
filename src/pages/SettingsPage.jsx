import { useState, useMemo, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation, LANGUAGES } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { getLocalDate } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  User,
  Save,
  CheckCircle2,
  Plus,
  Minus,
  Sofa,
  Footprints,
  Bike,
  Dumbbell,
  Rocket,
  TrendingDown,
  Scale as ScaleIcon,
  TrendingUp,
  Trophy,
  Shield,
  Moon,
  Globe,
  Bell,
  UserCog,
  Target,
  Calendar,
  Clock,
  MapPin,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// --- Number Stepper ---
function NumberStepper({ value, onChange, min, max, step = 1, unit = "", label }) {
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
  { value: "sedentary", label: "Sedentary", desc: "Desk job, little movement", icon: Sofa, multiplier: 1.2 },
  { value: "light", label: "Light", desc: "Walk 1-2x/week", icon: Footprints, multiplier: 1.375 },
  { value: "moderate", label: "Moderate", desc: "Exercise 3-5x/week", icon: Bike, multiplier: 1.55 },
  { value: "active", label: "Very Active", desc: "Hard exercise 6-7x/week", icon: Dumbbell, multiplier: 1.725 },
  { value: "very_active", label: "Extra Active", desc: "Athletic / physical job", icon: Rocket, multiplier: 1.9 },
];

const GOAL_OPTIONS = [
  { value: "lose", label: "Lose", desc: "Cut 500 cal/day", icon: TrendingDown, adjust: -500 },
  { value: "maintain", label: "Maintain", desc: "Keep weight stable", icon: ScaleIcon, adjust: 0 },
  { value: "gain", label: "Lean Gain", desc: "Surplus 300 cal/day", icon: TrendingUp, adjust: 300 },
  { value: "bulk", label: "Bulk", desc: "Surplus 500 cal/day", icon: Trophy, adjust: 500 },
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
              <Icon className={`h-5 w-5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs font-medium ${selected ? "text-foreground" : "text-muted-foreground"}`}>
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
  const { profile, updateProfile } = useProfile();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang, t } = useTranslation();

  const [name, setName] = useState(profile?.full_name || "");
  const [age, setAge] = useState(profile?.age?.toString() || "");
  const [gender, setGender] = useState(profile?.gender || "");
  const [height, setHeight] = useState(profile?.height_cm?.toString() || "");
  const [weight, setWeight] = useState(profile?.weight_kg?.toString() || "");
  const [activity, setActivity] = useState(profile?.activity_level || "moderate");
  const [goal, setGoal] = useState(profile?.goal || "maintain");
  const [goalWeight, setGoalWeight] = useState(profile?.goal_weight_kg?.toString() || "");
  const [targetDate, setTargetDate] = useState(profile?.target_date || "");
  const [saved, setSaved] = useState(false);

  // Login history
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Notification Preferences
  const [workoutReminders, setWorkoutReminders] = useState(() => localStorage.getItem("fitwise_workout_reminders") === "true");
  const [routineReminders, setRoutineReminders] = useState(() => localStorage.getItem("fitwise_routine_reminders") === "true");

  const handleNotificationToggle = async (type, checked) => {
    if (checked) {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          toast.success("Notifications enabled!", { id: "notif" });
          if (type === "workout") {
            setWorkoutReminders(true);
            localStorage.setItem("fitwise_workout_reminders", "true");
            new Notification("Fitwise", { body: "Workout reminders are now active! You'll get notified daily.", icon: "/logo.png" });
          } else {
            setRoutineReminders(true);
            localStorage.setItem("fitwise_routine_reminders", "true");
            new Notification("Fitwise", { body: "Routine reminders are active! We'll remind you to take care of your skin.", icon: "/logo.png" });
          }
        } else {
          toast.error("Notification permission denied by browser.", { id: "notif" });
        }
      } else {
        toast.error("Your browser does not support notifications.", { id: "notif" });
      }
    } else {
      if (type === "workout") {
        setWorkoutReminders(false);
        localStorage.setItem("fitwise_workout_reminders", "false");
      } else {
        setRoutineReminders(false);
        localStorage.setItem("fitwise_routine_reminders", "false");
      }
      toast.success("Notifications disabled.", { id: "notif" });
    }
  };

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
      setGoalWeight(profile.goal_weight_kg?.toString() || "");
      setTargetDate(profile.target_date || "");
    }
  }, [profile]);

  // Fetch login history
  useEffect(() => {
    if (user?.id) {
      fetchLoginHistory();
    }
  }, [user?.id]);

  const fetchLoginHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("login_history")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(5);
      if (!error && data) {
        setLoginHistory(data);
      }
    } catch {
      // Table might not exist yet — silently fail
    }
    setLoadingHistory(false);
  };

  // Calculate recommended calories based on goal weight + timeline
  const recommendedCalories = useMemo(() => {
    if (!goalWeight || !targetDate || !weight) return null;
    const gw = parseFloat(goalWeight);
    const cw = parseFloat(weight);
    if (!gw || !cw) return null;

    const daysDiff = Math.max(1, Math.round((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24)));
    const totalKgChange = gw - cw;
    // 1 kg ≈ 7700 calories
    const totalCalChange = totalKgChange * 7700;
    const dailyAdjust = Math.round(totalCalChange / daysDiff);

    // Calculate base TDEE
    const h = parseFloat(height) || 170;
    const a = parseInt(age) || 25;
    const w = cw;
    let bmr;
    if (gender === "male") {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }
    const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    const tdee = bmr * (multipliers[activity] || 1.55);

    return Math.round(tdee + dailyAdjust);
  }, [goalWeight, targetDate, weight, height, age, gender, activity]);

  // Dirty state detection
  const isDirty = useMemo(() => {
    if (!profile) return true;
    return (
      name !== (profile.full_name || "") ||
      age !== (profile.age?.toString() || "") ||
      gender !== (profile.gender || "") ||
      height !== (profile.height_cm?.toString() || "") ||
      weight !== (profile.weight_kg?.toString() || "") ||
      activity !== (profile.activity_level || "moderate") ||
      goal !== (profile.goal || "maintain") ||
      goalWeight !== (profile.goal_weight_kg?.toString() || "") ||
      targetDate !== (profile.target_date || "")
    );
  }, [name, age, gender, height, weight, activity, goal, goalWeight, targetDate, profile]);

  const handleSave = () => {
    updateProfile.mutate({
      full_name: name,
      age: parseInt(age) || null,
      gender,
      height_cm: parseFloat(height) || null,
      weight_kg: parseFloat(weight) || null,
      activity_level: activity,
      goal,
      goal_weight_kg: parseFloat(goalWeight) || null,
      target_date: targetDate || null,
    });
    setSaved(true);
    toast.success(t("saved") + " Calorie goal updated.");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to log out");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("Uploading photo...", { id: "upload" });
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      updateProfile.mutate({ avatar_url: data.publicUrl });
      toast.success("Profile photo updated!", { id: "upload" });
    } catch (error) {
      toast.error("Error uploading photo. Make sure 'avatars' storage bucket exists.", { id: "upload" });
      console.error(error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const oldPassword = fd.get("oldPassword");
    const newPassword = fd.get("newPassword");
    if (!oldPassword || !newPassword) {
      toast.error("Please fill in both fields");
      return;
    }

    try {
      // Verify old password by re-authenticating
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (authError) {
        toast.error("Current password is incorrect");
        return;
      }

      // Update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast.success("Password updated successfully");
      e.target.reset();
    } catch (error) {
      toast.error("Failed to update password: " + error.message);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    toast.success(
      newLang === "en"
        ? "Language set to English"
        : newLang === "es"
          ? "Idioma configurado a Español"
          : "Langue définie sur Français"
    );
  };

  const currentLangLabel = LANGUAGES.find((l) => l.value === lang)?.label || "English (US)";

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto pl-4 lg:pl-0 pr-4">
      <h1 className="text-2xl font-bold text-foreground">{t("settingsTitle")}</h1>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center pt-8 pb-10"
      >
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-surface border-2 border-primary/40 shadow-[0_0_25px_rgba(34,197,94,0.2)] flex items-center justify-center overflow-hidden shrink-0 relative group">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                className="w-full h-full object-cover"
                alt="Avatar"
              />
            ) : (
              <User className="h-12 w-12 text-muted-foreground/50 group-hover:scale-110 transition-transform" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
              <User className="w-6 h-6 text-white" />
            </div>
            <input
              type="file"
              onChange={handlePhotoUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*"
            />
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-4 border-background shadow-md pointer-events-none">
            <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          {name || user?.email?.split("@")[0] || "User"}
        </h2>
        <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-1.5 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
          {t("proMember")}
        </div>
      </motion.div>

      {/* ACCOUNT */}
      <div className="space-y-3 pt-2">
        <h3 className="text-[11px] font-bold text-muted-foreground tracking-[0.2em] uppercase mb-3 pl-2">
          {t("account")}
        </h3>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem
            value="personal-info"
            className="border-none rounded-2xl bg-surface-low/80 hover:bg-surface-low transition-colors mb-2 overflow-hidden px-4"
          >
            <AccordionTrigger className="hover:no-underline py-5 lg:py-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface flex flex-col items-center justify-center border border-border/30 shadow-sm">
                  <UserCog className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">
                    {t("personalInfo")}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {t("personalInfoDesc")}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-8 px-2 lg:px-4">
              <div className="space-y-6">
                {/* Name & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("fullName")}</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="bg-surface border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("gender")}</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="bg-surface border-border/50">
                        <SelectValue placeholder={t("select")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t("male")}</SelectItem>
                        <SelectItem value="female">{t("female")}</SelectItem>
                        <SelectItem value="other">{t("other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Number Steppers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <NumberStepper label={t("age")} value={age} onChange={setAge} min={10} max={100} step={1} unit={t("yrs")} />
                  <NumberStepper label={t("height")} value={height} onChange={setHeight} min={100} max={250} step={1} unit={t("cm")} />
                  <NumberStepper label={t("currentWeight")} value={weight} onChange={setWeight} min={30} max={300} step={0.5} unit={t("kg")} />
                </div>

                {/* Goal Weight Slider */}
                <div className="bg-surface/50 p-4 rounded-xl space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-semibold">{t("goalWeight")}</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-10 text-right">30kg</span>
                    <Slider
                      value={[parseFloat(goalWeight) || parseFloat(weight) || 70]}
                      onValueChange={([v]) => setGoalWeight(String(v))}
                      min={30}
                      max={200}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-12">200kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-primary">
                      {goalWeight || "—"} {t("kg")}
                    </p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <Label className="text-xs text-muted-foreground">{t("achieveBy")}</Label>
                      <Input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-40 h-8 text-xs bg-surface border-border/50"
                        min={getLocalDate()}
                      />
                    </div>
                  </div>
                  {recommendedCalories && (
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <TrendingDown className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                          {t("recommendedCalories")}
                        </p>
                        <p className="text-lg font-black text-primary">
                          {recommendedCalories} <span className="text-xs font-medium text-muted-foreground">cal/day</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Activity Level Cards */}
                <div className="bg-surface/50 p-4 rounded-xl">
                  <SelectableCards
                    label={t("activityLevel")}
                    options={ACTIVITY_OPTIONS}
                    value={activity}
                    onChange={setActivity}
                  />
                </div>

                {/* Goal Cards */}
                <div className="bg-surface/50 p-4 rounded-xl">
                  <SelectableCards
                    label={t("goal")}
                    options={GOAL_OPTIONS}
                    value={goal}
                    onChange={setGoal}
                  />
                </div>

                {/* Save Button */}
                {isDirty && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-2"
                  >
                    <Button
                      onClick={handleSave}
                      disabled={updateProfile.isPending}
                      className="w-full gap-2 shadow-sm rounded-xl py-6"
                    >
                      {saved ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> {t("saved")}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" /> {t("saveProfile")}
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Security */}
          <AccordionItem
            value="security"
            className="border-none rounded-2xl bg-surface-low/80 hover:bg-surface-low transition-colors mb-2 overflow-hidden px-4"
          >
            <AccordionTrigger className="hover:no-underline py-5 lg:py-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface flex flex-col items-center justify-center border border-border/30 shadow-sm">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">
                    {t("security")}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {t("securityDesc")}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-8 px-2 lg:px-4">
              <div className="space-y-6">
                {/* Password Change */}
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("oldPassword")}</Label>
                    <Input
                      name="oldPassword"
                      type="password"
                      placeholder="Enter current password"
                      required
                      className="bg-surface border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("newPassword")}</Label>
                    <Input
                      name="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      required
                      className="bg-surface border-border/50"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {t("updatePassword")}
                  </Button>
                </form>

                {/* Login History */}
                <div className="pt-4 border-t border-border/30">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold text-foreground">
                      {t("loginHistory")}
                    </h4>
                  </div>
                  {loginHistory.length > 0 ? (
                    <div className="space-y-2">
                      {loginHistory.map((entry, idx) => (
                        <div
                          key={entry.id || idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-surface-lowest/40 border border-border/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-border/30">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-foreground">
                                {new Date(entry.logged_at).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(entry.logged_at).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          {entry.location && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {entry.location}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      {t("noLoginHistory")}
                    </p>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* PREFERENCES */}
      <div className="space-y-3 pt-6">
        <h3 className="text-[11px] font-bold text-muted-foreground tracking-[0.2em] uppercase mb-3 pl-2">
          {t("preferences")}
        </h3>

        <div className="w-full rounded-2xl bg-surface-low/80 overflow-hidden">
          {/* Dark Mode */}
          <div className="px-4 py-5 lg:py-6 flex justify-between items-center border-b border-border/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface flex flex-col items-center justify-center border border-border/30 shadow-sm">
                <Moon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">
                  {t("darkMode")}
                </p>
              </div>
            </div>
            <div className="mr-2">
              <Switch checked={isDark} onCheckedChange={toggleTheme} />
            </div>
          </div>

          {/* Language */}
          <div className="px-4 py-5 lg:py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface flex flex-col items-center justify-center border border-border/30 shadow-sm">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">
                  {t("language")}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {currentLangLabel}
                </p>
              </div>
            </div>
            <Select value={lang} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[140px] bg-surface border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      <div className="space-y-3 pt-6">
        <h3 className="text-[11px] font-bold text-muted-foreground tracking-[0.2em] uppercase mb-3 pl-2">
          {t("notifications")}
        </h3>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem
            value="notifications"
            className="border-none rounded-2xl bg-surface-low/80 hover:bg-surface-low transition-colors mb-2 overflow-hidden px-4"
          >
            <AccordionTrigger className="hover:no-underline py-5 lg:py-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface flex flex-col items-center justify-center border border-border/30 shadow-sm">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">
                    {t("notificationSettings")}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {t("notificationSettingsDesc")}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-8 px-2 lg:px-4">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{t("workoutReminders")}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("workoutRemindersDesc")}
                    </p>
                  </div>
                  <Switch checked={workoutReminders} onCheckedChange={(checked) => handleNotificationToggle("workout", checked)} />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Routine Reminders</p>
                    <p className="text-[11px] text-muted-foreground">
                      Morning & night face care nudges
                    </p>
                  </div>
                  <Switch checked={routineReminders} onCheckedChange={(checked) => handleNotificationToggle("routine", checked)} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* LOG OUT */}
      <div className="pt-10 flex flex-col items-center justify-center gap-4">
        <Button
          onClick={handleLogOut}
          variant="outline"
          className="w-full max-w-sm rounded-xl py-6 border-border/30 bg-[#2a1c1c]/50 text-[#ffb4b4] hover:bg-[#3a2020] hover:text-[#ffb4b4] border transition-colors opacity-80 hover:opacity-100 font-semibold shadow-sm"
        >
          {t("logOut")}
        </Button>
        <p className="text-[10px] text-muted-foreground mb-4">
          {t("appVersion")}
        </p>
      </div>
    </div>
  );
}
