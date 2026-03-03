import { useState } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useUserStats } from "@/hooks/useUserStats";
import { getWorkoutPlans } from "@/lib/workoutData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Home, Clock, CheckCircle2, ChevronDown, ChevronUp, CalendarDays } from "lucide-react";
import { toast } from "sonner";
function MiniCalendar({ year, month, checkinDates, currentMonth }) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const monthLabel = new Date(year, month).toLocaleDateString("en-US", { month: "short" });
    const todayDate = new Date().getDate();
    return (<div className="flex-1 min-w-[140px]">
      <p className="text-xs font-semibold text-foreground text-center mb-1">{monthLabel}</p>
      <div className="grid grid-cols-7 gap-px">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (<div key={i} className="text-[8px] text-muted-foreground text-center">{d}</div>))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (<div key={`e-${i}`}/>))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isCheckedIn = checkinDates.has(day);
            const isCurrentDay = currentMonth && day === todayDate;
            return (<div key={day} className="flex items-center justify-center h-4">
              {isCheckedIn ? (<span className="w-2.5 h-2.5 rounded-full bg-primary"/>) : isCurrentDay ? (<span className="w-2.5 h-2.5 rounded-full ring-1 ring-primary"/>) : (<span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20"/>)}
            </div>);
        })}
      </div>
    </div>);
}
export default function WorkoutsPage() {
    const { checkins, addCheckin } = useWorkouts();
    const { addXP, addBadge } = useUserStats();
    const [type, setType] = useState("home");
    const [expanded, setExpanded] = useState(null);
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const todayCheckins = checkins.filter((c) => c.logged_at === today);
    const hasCheckedInToday = todayCheckins.length > 0;
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    // Build checkin sets for each month (Jan to current month)
    const monthsToShow = Array.from({ length: currentMonth + 1 }, (_, i) => i);
    const checkinsByMonth = monthsToShow.map((m) => {
        const prefix = `${currentYear}-${String(m + 1).padStart(2, "0")}`;
        return new Set(checkins
            .filter((c) => c.logged_at.startsWith(prefix))
            .map((c) => parseInt(c.logged_at.split("-")[2])));
    });
    const currentMonthCheckins = checkinsByMonth[currentMonth]?.size || 0;
    const quickCheckin = () => {
        addCheckin.mutate({
            workout_type: "Check-in",
            duration_min: 0,
            notes: "Daily check-in",
        });
        addXP.mutate(25);
        if (checkins.length >= 9)
            addBadge.mutate("Workout Warrior");
        toast.success("Checked in! +25 XP 💪");
    };
    const plans = getWorkoutPlans(type);
    const startWorkout = (plan) => {
        addCheckin.mutate({
            workout_type: plan.name,
            duration_min: parseInt(plan.duration) || 30,
            notes: plan.exercises.map((e) => e.name).join(", "),
        });
        addXP.mutate(50);
        if (checkins.length >= 9)
            addBadge.mutate("Workout Warrior");
        toast.success(`${plan.name} logged! +50 XP`);
    };
    return (<div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Workouts</h1>

      {/* Check-in Card */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {hasCheckedInToday ? "✅ Checked in today!" : "Mark today's check-in"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {currentMonthCheckins} check-in{currentMonthCheckins !== 1 ? "s" : ""} this month
              </p>
            </div>
            <Button onClick={quickCheckin} disabled={hasCheckedInToday} size="sm" className="gap-2">
              <CheckCircle2 className="h-4 w-4"/>
              {hasCheckedInToday ? "Done" : "Check In"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mini Calendars */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4"/> {currentYear} Check-in History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {monthsToShow.map((m) => (<MiniCalendar key={m} year={currentYear} month={m} checkinDates={checkinsByMonth[m]} currentMonth={m === currentMonth}/>))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Workout Plan */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Generate Workout Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={type} onValueChange={(v) => setType(v)}>
            <TabsList className="w-full">
              <TabsTrigger value="home" className="flex-1 gap-2">
                <Home className="h-4 w-4"/> Home
              </TabsTrigger>
              <TabsTrigger value="gym" className="flex-1 gap-2">
                <Dumbbell className="h-4 w-4"/> Gym
              </TabsTrigger>
            </TabsList>

            <TabsContent value={type} className="space-y-3 mt-4">
              {plans.map((plan) => (<motion.div key={plan.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="shadow-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{plan.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground"/>
                            <span className="text-xs text-muted-foreground">{plan.duration}</span>
                            <Badge variant="secondary" className="text-xs">{plan.exercises.length} exercises</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(expanded === plan.name ? null : plan.name)}>
                            {expanded === plan.name ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
                          </Button>
                          <Button size="sm" onClick={() => startWorkout(plan)}>Log</Button>
                        </div>
                      </div>
                    </CardHeader>
                    <AnimatePresence>
                      {expanded === plan.name && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                          <CardContent className="pt-0 space-y-2">
                            {plan.exercises.map((ex, i) => (<div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <span className="text-xs font-bold text-muted-foreground mt-0.5">{i + 1}</span>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-foreground">{ex.name}</p>
                                  <p className="text-xs text-muted-foreground">{ex.description}</p>
                                </div>
                                <Badge variant="outline" className="text-xs shrink-0">{ex.reps || ex.duration}</Badge>
                              </div>))}
                          </CardContent>
                        </motion.div>)}
                    </AnimatePresence>
                  </Card>
                </motion.div>))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Check-in History */}
      {checkins.length > 0 && (<Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Check-ins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {checkins.slice(0, 10).map((c) => (<div key={c.id} className="flex justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.workout_type}</p>
                  {c.duration_min > 0 && <p className="text-xs text-muted-foreground">{c.duration_min} min</p>}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(c.logged_at + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>))}
          </CardContent>
        </Card>)}
    </div>);
}
