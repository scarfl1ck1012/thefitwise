import { useProfile } from "@/hooks/useProfile";
import { useMeals } from "@/hooks/useMeals";
import { useUserStats } from "@/hooks/useUserStats";
import { useWorkouts } from "@/hooks/useWorkouts";
import { getDailyChallenges } from "@/lib/challenges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Flame, Zap, Trophy, Dumbbell, UtensilsCrossed, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
export default function DashboardPage() {
    const { profile, isProfileComplete } = useProfile();
    const { totalCalories } = useMeals();
    const { stats, addXP } = useUserStats();
    const { checkins } = useWorkouts();
    const today = new Date().toISOString().split("T")[0];
    const challenges = getDailyChallenges(today);
    const [completedChallenges, setCompletedChallenges] = useState([]);
    const calorieGoal = profile?.daily_calories || 2000;
    const caloriePercent = Math.min((totalCalories / calorieGoal) * 100, 100);
    const todayWorkouts = checkins.filter((c) => c.logged_at === today).length;
    const completeChallenge = (id, xp) => {
        if (completedChallenges.includes(id))
            return;
        setCompletedChallenges((prev) => [...prev, id]);
        addXP.mutate(xp);
        toast.success(`+${xp} XP earned!`);
    };
    const fadeUp = {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
    };
    return (<div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {profile?.full_name || "there"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your daily overview</p>
      </div>

      {!isProfileComplete && (<motion.div {...fadeUp}>
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Complete your profile</p>
                <p className="text-sm text-muted-foreground">Set up your details for personalized calorie goals</p>
              </div>
              <Link to="/settings">
                <Button size="sm" variant="default">Set Up</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>)}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { label: "Calories", value: `${totalCalories}/${calorieGoal}`, icon: UtensilsCrossed, color: "text-primary" },
            { label: "Workouts Today", value: todayWorkouts, icon: Dumbbell, color: "text-info" },
            { label: "Streak", value: `${stats?.current_streak || 0} days`, icon: Flame, color: "text-accent" },
            { label: "Level", value: `Lv ${stats?.level || 1}`, icon: Zap, color: "text-warning" },
        ].map((stat, i) => (<motion.div key={stat.label} {...fadeUp} transition={{ delay: i * 0.1 }}>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`}/>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>))}
      </div>

      {/* Calories Progress */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today's Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={caloriePercent} className="h-3 mb-2"/>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{totalCalories} consumed</span>
              <span>{Math.max(0, calorieGoal - totalCalories)} remaining</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* XP Progress */}
      <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-warning"/> XP Progress
              </CardTitle>
              <span className="text-sm font-bold text-foreground">{stats?.xp || 0} XP</span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={((stats?.xp || 0) % 500) / 5} className="h-3 mb-2"/>
            <p className="text-sm text-muted-foreground">
              {500 - ((stats?.xp || 0) % 500)} XP to Level {(stats?.level || 1) + 1}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Challenges */}
      <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-accent"/> Today's Challenges
              </CardTitle>
              <span className="text-sm font-medium text-muted-foreground">
                {completedChallenges.length}/{challenges.length} completed
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {challenges.map((ch) => {
            const done = completedChallenges.includes(ch.id);
            return (<div key={ch.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${done ? "bg-success/10 border-success/30" : "bg-muted/50 border-border"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{ch.icon}</span>
                    <div>
                      <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {ch.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{ch.description}</p>
                    </div>
                  </div>
                  {done ? (<CheckCircle2 className="h-5 w-5 text-success"/>) : (<Button size="sm" variant="outline" onClick={() => completeChallenge(ch.id, ch.xp)}>
                      +{ch.xp} XP
                    </Button>)}
                </div>);
        })}
          </CardContent>
        </Card>
      </motion.div>
    </div>);
}
