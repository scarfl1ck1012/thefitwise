import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { User, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
export default function SettingsPage() {
    const { profile } = useProfile();
    const { updateProfile } = useProfile();
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
    useState(() => {
        if (profile) {
            setName(profile.full_name || "");
            setAge(profile.age?.toString() || "");
            setGender(profile.gender || "");
            setHeight(profile.height_cm?.toString() || "");
            setWeight(profile.weight_kg?.toString() || "");
            setActivity(profile.activity_level || "moderate");
            setGoal(profile.goal || "maintain");
        }
    });
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
    return (<div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary"/> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"/>
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25"/>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175"/>
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70"/>
              </div>
              <div className="space-y-2">
                <Label>Activity Level</Label>
                <Select value={activity} onValueChange={setActivity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="light">Lightly Active</SelectItem>
                    <SelectItem value="moderate">Moderately Active</SelectItem>
                    <SelectItem value="active">Very Active</SelectItem>
                    <SelectItem value="very_active">Extra Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Goal</Label>
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose">Lose Weight (-500 cal)</SelectItem>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                    <SelectItem value="gain">Lean Gain (+300 cal)</SelectItem>
                    <SelectItem value="bulk">Bulk (+500 cal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {profile?.daily_calories && (<div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground">
                  Your daily calorie goal: <span className="font-bold text-primary">{profile.daily_calories} cal</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">Calculated from your profile using Mifflin-St Jeor formula</p>
              </div>)}

            <Button onClick={handleSave} disabled={updateProfile.isPending} className="w-full sm:w-auto">
              {saved ? <CheckCircle2 className="h-4 w-4 mr-2"/> : <Save className="h-4 w-4 mr-2"/>}
              {saved ? "Saved!" : "Save Profile"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user?.email}</span>
          </p>
        </CardContent>
      </Card>
    </div>);
}
