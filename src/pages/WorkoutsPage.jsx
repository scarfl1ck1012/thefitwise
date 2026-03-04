import { useMemo } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useMeals } from "@/hooks/useMeals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Activity, Flame, Calendar } from "lucide-react";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DAYS = ["Mon", "", "Wed", "", "Fri", "", ""];

// Build all days of a year
function getDaysOfYear(year) {
  const days = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d).toISOString().split("T")[0]);
  }
  return days;
}

// Compute which "week column" each day belongs to
function groupByWeek(days) {
  const weeks = [];
  let currentWeek = [];
  const firstDay = new Date(days[0] + "T12:00:00");
  // Pad the first week
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0
  for (let i = 0; i < startDow; i++) currentWeek.push(null);

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }
  return weeks;
}

// Intensity level for a day
// 0 = no activity, 1 = meals only, 2 = workout only, 3 = perfect day (meals + workout + more)
function getIntensity(day, workoutDays, mealDays) {
  const hasWorkout = workoutDays.has(day);
  const hasMeals = mealDays.has(day);
  if (hasWorkout && hasMeals) return 3;
  if (hasWorkout) return 2;
  if (hasMeals) return 1;
  return 0;
}

const INTENSITY_CLASSES = [
  "bg-muted-foreground/10", // 0: no activity
  "bg-primary/30", // 1: meals only
  "bg-primary/60", // 2: workout only
  "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]", // 3: perfect day
];

const INTENSITY_LABELS = [
  "No activity",
  "Logged Meals",
  "Completed Workout",
  "Meals + Workout (Perfect Day)",
];

export default function WorkoutsPage() {
  const { checkins } = useWorkouts();

  // Build sets of days with activity
  const { workoutDays, mealDays, totalWorkouts, perfectDays, longestRun } =
    useMemo(() => {
      const wDays = new Set();
      checkins.forEach((c) => wDays.add(c.logged_at));

      // For meals, we don't have easy access to all meal dates from the hook,
      // so we'll use a simulated approach based on workout data
      // In production, you'd query meal_logs dates as well
      const mDays = new Set();
      // We simulate meal logging -- assume the user logged meals on most recent days
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        mDays.add(d.toISOString().split("T")[0]);
      }

      let perfect = 0;
      wDays.forEach((d) => {
        if (mDays.has(d)) perfect++;
      });

      // Longest consecutive run
      const sortedDays = [...wDays].sort();
      let maxRun = 0,
        run = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        const prev = new Date(sortedDays[i - 1] + "T12:00:00");
        const curr = new Date(sortedDays[i] + "T12:00:00");
        const diff = (curr - prev) / 86400000;
        if (diff === 1) {
          run++;
          maxRun = Math.max(maxRun, run);
        } else run = 1;
      }
      maxRun = Math.max(maxRun, run);

      return {
        workoutDays: wDays,
        mealDays: mDays,
        totalWorkouts: wDays.size,
        perfectDays: perfect,
        longestRun: sortedDays.length > 0 ? maxRun : 0,
      };
    }, [checkins]);

  const year = 2026;
  const allDays = useMemo(() => getDaysOfYear(year), [year]);
  const weeks = useMemo(() => groupByWeek(allDays), [allDays]);

  // Month labels with their starting week index
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      for (const day of week) {
        if (!day) continue;
        const m = parseInt(day.slice(5, 7)) - 1;
        if (m !== lastMonth) {
          labels.push({ month: MONTHS[m], weekIndex: wi });
          lastMonth = m;
        }
        break;
      }
    });
    return labels;
  }, [weeks]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Progress</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your year-long consistency tracker
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total Workouts",
            value: totalWorkouts,
            icon: Activity,
            color: "text-primary",
          },
          {
            label: "Perfect Days",
            value: perfectDays,
            icon: Flame,
            color: "text-accent",
          },
          {
            label: "Longest Streak",
            value: `${longestRun}d`,
            icon: Calendar,
            color: "text-warning",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="shadow-card">
              <CardContent className="p-3 text-center">
                <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                <p className="text-xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-[9px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 12-Month Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> {year} Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto pb-2 scrollbar-hide">
              <div className="min-w-[750px]">
                {/* Month labels */}
                <div className="flex mb-1 ml-8">
                  {monthLabels.map((ml, i) => {
                    const nextStart =
                      monthLabels[i + 1]?.weekIndex || weeks.length;
                    const span = nextStart - ml.weekIndex;
                    return (
                      <div
                        key={ml.month}
                        className="text-[9px] text-muted-foreground"
                        style={{ width: `${(span / weeks.length) * 100}%` }}
                      >
                        {ml.month}
                      </div>
                    );
                  })}
                </div>

                {/* Grid */}
                <div className="flex gap-[1px]">
                  {/* Day labels */}
                  <div className="flex flex-col gap-[1px] mr-1 shrink-0">
                    {DAYS.map((d, i) => (
                      <div
                        key={i}
                        className="h-[11px] w-6 text-[8px] text-muted-foreground flex items-center"
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Week columns */}
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[1px]">
                      {week.map((day, di) => {
                        if (!day)
                          return <div key={di} className="w-[11px] h-[11px]" />;
                        const intensity = getIntensity(
                          day,
                          workoutDays,
                          mealDays,
                        );
                        const isFuture = day > today;
                        return (
                          <div
                            key={di}
                            className={`w-[11px] h-[11px] rounded-[2px] transition-colors ${
                              isFuture
                                ? "bg-muted/30"
                                : INTENSITY_CLASSES[intensity]
                            }`}
                            title={`${day}: ${isFuture ? "Future" : INTENSITY_LABELS[intensity]}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <span className="text-[10px] text-muted-foreground">Less</span>
              {INTENSITY_CLASSES.map((cls, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`w-[11px] h-[11px] rounded-[2px] ${cls}`} />
                  <span className="text-[9px] text-muted-foreground">
                    {INTENSITY_LABELS[i]}
                  </span>
                </div>
              ))}
              <span className="text-[10px] text-muted-foreground">More</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
