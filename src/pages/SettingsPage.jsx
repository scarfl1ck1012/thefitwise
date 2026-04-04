import { useState, useMemo, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
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
  ChevronRight,
  Moon,
  Globe,
  Cloud,
  Bell,
  Megaphone,
  UserCog
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
  const { profile, updateProfile } = useProfile();
  const { user } = useAuth();

  const [name, setName] = useState(profile?.full_name || "");
  const [age, setAge] = useState(profile?.age?.toString() || "");
  const [gender, setGender] = useState(profile?.gender || "");
  const [height, setHeight] = useState(profile?.height_cm?.toString() || "");
  const [weight, setWeight] = useState(profile?.weight_kg?.toString() || "");
  const [activity, setActivity] = useState(profile?.activity_level || "moderate");
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
    if (!profile) return true;
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

  const handleLogOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto pl-4 lg:pl-0 pr-4">
      <h1 className="text-2xl font-bold text-foreground">Settings & Profile</h1>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center pt-8 pb-10">
         <div className="relative mb-6">
            <div className="w-28 h-28 rounded-full bg-surface border-2 border-primary/40 shadow-[0_0_25px_rgba(34,197,94,0.2)] flex items-center justify-center overflow-hidden shrink-0">
                <User className="h-12 w-12 text-muted-foreground/50" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10 pointer-events-none"></div>
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-4 border-background shadow-md">
                <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
            </div>
         </div>
         <h2 className="text-3xl font-bold tracking-tight mb-2">{name || user?.email?.split('@')[0] || "User"}</h2>
         <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-1.5 shadow-sm">
           <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
           Pro Member
         </div>
      </motion.div>

      {/* ACCOUNT */}
      <div className="space-y-3 pt-2">
        <h3 className="text-[11px] font-bold text-muted-foreground tracking-[0.2em] uppercase mb-3 pl-2">Account</h3>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="personal-info" className="border-none rounded-2xl bg-surface-low/80 hover:bg-surface-low transition-colors mb-2 overflow-hidden px-4">
             <AccordionTrigger className="hover:no-underline py-5 lg:py-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-surface flex flex-col items-center justify-center border border-white/5 shadow-sm">
                      <UserCog className="h-5 w-5 text-primary" />
                   </div>
                   <div className="text-left">
                     <p className="text-sm font-semibold text-foreground">Personal Information</p>
                     <p className="text-[11px] text-muted-foreground mt-1">Update your details & biometric data</p>
                   </div>
                </div>
             </AccordionTrigger>
             <AccordionContent className="pt-2 pb-8 px-2 lg:px-4">
                <div className="space-y-6">
                  {/* Name & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="bg-surface border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger className="bg-surface border-border/50">
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
                    <NumberStepper label="Age" value={age} onChange={setAge} min={10} max={100} step={1} unit="yrs" />
                    <NumberStepper label="Height" value={height} onChange={setHeight} min={100} max={250} step={1} unit="cm" />
                    <NumberStepper label="Weight" value={weight} onChange={setWeight} min={30} max={300} step={0.5} unit="kg" />
                  </div>

                  {/* Activity Level Cards */}
                  <div className="bg-surface/50 p-4 rounded-xl">
                     <SelectableCards label="Activity Level" options={ACTIVITY_OPTIONS} value={activity} onChange={setActivity} />
                  </div>

                  {/* Goal Cards */}
                  <div className="bg-surface/50 p-4 rounded-xl">
                    <SelectableCards label="Goal" options={GOAL_OPTIONS} value={goal} onChange={setGoal} />
                  </div>

                  {/* Save Button */}
                  {isDirty && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2">
                      <Button onClick={handleSave} disabled={updateProfile.isPending} className="w-full gap-2 shadow-sm rounded-xl py-6">
                        {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Profile</>}
                      </Button>
                    </motion.div>
                  )}
                </div>
             </AccordionContent>
          </AccordionItem>
          
          <div className="w-full rounded-2xl bg-surface-low/80 hover:bg-surface-low transition-colors mb-2 px-4 py-5 lg:py-6 cursor-pointer flex justify-between items-center group">
             <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-surface flex flex-col items-center justify-center border border-white/5 shadow-sm">
                    <Shield className="h-5 w-5 text-primary" />
                 </div>
                 <div className="text-left">
                   <p className="text-sm font-semibold text-foreground">Security</p>
                   <p className="text-[11px] text-muted-foreground mt-1">Password, 2FA, and login history</p>
                 </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors mr-2" />
          </div>
        </Accordion>
      </div>

      {/* PREFERENCES */}
      <div className="space-y-3 pt-6">
        <h3 className="text-[11px] font-bold text-muted-foreground tracking-[0.2em] uppercase mb-3 pl-2">Preferences</h3>
        
        <div className="w-full rounded-2xl bg-surface-low/80 overflow-hidden">
           <div className="px-4 py-5 lg:py-6 flex justify-between items-center border-b border-border/30">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-surface flex flex-col items-center justify-center border border-white/5 shadow-sm">
                    <Moon className="h-5 w-5 text-primary" />
                 </div>
                 <div className="text-left">
                   <p className="text-sm font-semibold text-foreground">Dark Mode</p>
                 </div>
              </div>
              <div className="mr-2"><Switch checked={true} /></div>
           </div>
           
           <div className="px-4 py-5 lg:py-6 flex justify-between items-center border-b border-border/30 hover:bg-surface-low cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-surface flex flex-col items-center justify-center border border-white/5 shadow-sm">
                    <Globe className="h-5 w-5 text-primary" />
                 </div>
                 <div className="text-left">
                   <p className="text-sm font-semibold text-foreground">Language</p>
                   <p className="text-[11px] text-muted-foreground mt-1">English (US)</p>
                 </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground mr-2" />
           </div>

           <div className="px-4 py-5 lg:py-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-surface flex flex-col items-center justify-center border border-white/5 shadow-sm">
                    <Cloud className="h-5 w-5 text-primary" />
                 </div>
                 <div className="text-left">
                   <p className="text-sm font-semibold text-foreground">Cloud Sync</p>
                 </div>
              </div>
              <div className="mr-2"><Switch checked={true} /></div>
           </div>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      <div className="space-y-3 pt-6">
        <h3 className="text-[11px] font-bold text-muted-foreground tracking-[0.2em] uppercase mb-3 pl-2">Notifications</h3>
        
        <div className="w-full rounded-2xl bg-surface-low/80 overflow-hidden">
           <div className="px-4 py-5 lg:py-6 flex justify-between items-center border-b border-border/30">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-surface flex flex-col items-center justify-center border border-white/5 shadow-sm">
                    <Bell className="h-5 w-5 text-primary" />
                 </div>
                 <div className="text-left">
                   <p className="text-sm font-semibold text-foreground">Workout Reminders</p>
                 </div>
              </div>
              <div className="mr-2"><Switch checked={true} /></div>
           </div>
           
           <div className="px-4 py-5 lg:py-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-surface flex flex-col items-center justify-center border border-white/5 shadow-sm">
                    <Megaphone className="h-5 w-5 text-primary" />
                 </div>
                 <div className="text-left">
                   <p className="text-sm font-semibold text-foreground">Marketing & Newsletter</p>
                 </div>
              </div>
              <div className="mr-2"><Switch checked={false} /></div>
           </div>
        </div>
      </div>

      {/* LOG OUT */}
      <div className="pt-10 flex flex-col items-center justify-center gap-4">
         <Button onClick={handleLogOut} variant="outline" className="w-full max-w-sm rounded-xl py-6 border-white/5 bg-[#2a1c1c]/50 text-[#ffb4b4] hover:bg-[#3a2020] hover:text-[#ffb4b4] border transition-colors opacity-80 hover:opacity-100 font-semibold shadow-sm">
            Log Out
         </Button>
         <p className="text-[10px] text-muted-foreground mb-4">App Version 4.2.0 (Build 991)</p>
      </div>

    </div>
  );
}

