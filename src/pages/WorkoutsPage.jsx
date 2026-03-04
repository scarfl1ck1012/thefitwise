import { useMemo } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useMeals } from "@/hooks/useMeals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Activity, Flame, Calendar } from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_HEADERS = ["M", "T", "W", "T", "F", "S", "S"];

const INTENSITY_CLASSES = [
  "bg-muted-foreground/10",
  "bg-primary/30",
  "bg-primary/60",
  "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]",
];

const INTENSITY_LABELS = [
  "No activity",
  "Logged Meals",
  "Completed Workout",
  "Meals + Workout (Perfect Day)",
];

function getLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Build calendar grid for a single month
function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0

  const cells = [];
  // Padding before the 1st
  for (let i = 0; i < startDow; i++) cells.push(null);
  // Days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push(
      `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    );
  }
  // Pad to fill last week row
  while (cells.length % 7 !== 0) cells.push(null);

  // Split into weeks
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function getIntensity(day, workoutDays, mealDates) {
  const hasWorkout = workoutDays.has(day);
  const hasMeals = mealDates.has(day);
  if (hasWorkout && hasMeals) return 3;
  if (hasWorkout) return 2;
  if (hasMeals) return 1;
  return 0;
}

// Mini calendar for one month
function MonthCalendar({ year, month, workoutDays, mealDates, todayStr }) {
  const weeks = useMemo(() => getMonthGrid(year, month), [year, month]);

  return (
    <div>
      <p className="text-xs font-medium text-foreground mb-1.5">
        {MONTHS[month]}
      </p>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-[2px] mb-[2px]">
        {DAY_HEADERS.map((d, i) => (
          <div
            key={i}
            className="text-[8px] text-muted-foreground/60 text-center"
          >
            {d}
          </div>
        ))}
      </div>
      {/* Weeks */}
      <div className="space-y-[2px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-[2px]">
            {week.map((day, di) => {
              if (!day)
                return <div key={di} className="w-full aspect-square" />;
              const isFuture = day > todayStr;
              const intensity = isFuture
                ? -1
                : getIntensity(day, workoutDays, mealDates);
              const isCurrentDay = day === todayStr;
              return (
                <div
                  key={di}
                  className={`w-full aspect-square rounded-sm transition-colors ${
                    isFuture
                      ? "bg-muted/20"
                      : INTENSITY_CLASSES[intensity] || "bg-muted/20"
                  } ${isCurrentDay ? "ring-1 ring-foreground/30" : ""}`}
                  title={`${day}: ${isFuture ? "Future" : INTENSITY_LABELS[intensity]}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WorkoutsPage() {
  const { checkins } = useWorkouts();

  const todayStr = getLocalDateStr(new Date());

  // Build real activity data — only from actual workout checkins
  const { workoutDays, totalWorkouts, longestRun } = useMemo(() => {
    const wDays = new Set();
    checkins.forEach((c) => wDays.add(c.logged_at));

    // Longest consecutive streak
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
      totalWorkouts: wDays.size,
      longestRun: sortedDays.length > 0 ? maxRun : 0,
    };
  }, [checkins]);

  // Meal dates: empty set for now — we'd need a separate hook to fetch all meal dates
  // This ensures no fake data is shown
  const mealDates = useMemo(() => new Set(), []);

  const year = 2026;
  const perfectDays = useMemo(() => {
    let count = 0;
    workoutDays.forEach((d) => {
      if (mealDates.has(d)) count++;
    });
    return count;
  }, [workoutDays, mealDates]);

  return (
    <div className="space-y-5">
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

      {/* Monthly Mini-Calendars */}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }, (_, i) => (
                <MonthCalendar
                  key={i}
                  year={year}
                  month={i}
                  workoutDays={workoutDays}
                  mealDates={mealDates}
                  todayStr={todayStr}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <span className="text-[10px] text-muted-foreground">Less</span>
              {INTENSITY_CLASSES.map((cls, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-sm ${cls}`} />
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
