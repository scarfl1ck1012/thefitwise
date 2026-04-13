import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, CalendarDays, Clock3 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkouts } from "@/hooks/useWorkouts";

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function getMonthDays(cursor) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const total = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: total }, (_, i) => new Date(year, month, i + 1));
}

function addMinutesToTime(dateLike, mins) {
  const end = new Date(dateLike);
  end.setMinutes(end.getMinutes() + mins);
  return end;
}

export default function GymCalendarPage() {
  const { checkins } = useWorkouts();
  const [cursorMonth, setCursorMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));

  const monthDays = useMemo(() => getMonthDays(cursorMonth), [cursorMonth]);

  const selectedEntries = useMemo(() => {
    return checkins
      .filter((entry) => entry.logged_at === selectedDate)
      .map((entry) => {
        const start = new Date(entry.created_at || `${entry.logged_at}T14:30:00`);
        const end = addMinutesToTime(start, entry.duration_min || 60);
        const startStr = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const endStr = end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const kind =
          entry.workout_type === "cardio"
            ? "Cardio"
            : entry.workout_type === "home"
              ? "Home"
              : "Gym";
        return {
          id: entry.id,
          kind,
          range: `${startStr} - ${endStr}`,
          detail: entry.notes || `${kind} session`,
        };
      })
      .sort((a, b) => a.range.localeCompare(b.range));
  }, [checkins, selectedDate]);

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto pl-4 lg:pl-0 pr-4 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Workout Calendar Log</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Date-first view for workout and cardio sessions.
          </p>
        </div>
        <Link to="/gym">
          <Button variant="outline" className="rounded-xl">Back to Gym</Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] bg-card p-5 lg:p-6 border border-border/30 shadow-card"
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() =>
              setCursorMonth(
                (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1),
              )
            }
            className="h-9 w-9 rounded-full bg-surface border border-border/30 flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {cursorMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
              Select a day
            </p>
          </div>
          <button
            onClick={() =>
              setCursorMonth(
                (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1),
              )
            }
            className="h-9 w-9 rounded-full bg-surface border border-border/30 flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-3">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, idx) => (
            <div key={`${d}-${idx}`} className="text-center text-[10px] font-bold text-muted-foreground uppercase">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {monthDays.map((day) => {
            const key = formatDateKey(day);
            const isSelected = selectedDate === key;
            const hasData = checkins.some((c) => c.logged_at === key);
            return (
              <button
                key={key}
                onClick={() => setSelectedDate(key)}
                className={`h-11 rounded-xl border text-sm font-bold transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary/40"
                    : hasData
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-surface text-muted-foreground border-border/30 hover:text-foreground"
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-[2rem] bg-card p-5 lg:p-6 border border-border/30 shadow-card"
      >
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold text-foreground">
            {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        <div className="space-y-3">
          {selectedEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions logged on this date.</p>
          ) : (
            selectedEntries.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-border/30 bg-surface p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    {entry.range}
                  </div>
                  <Badge variant="outline">{entry.kind}</Badge>
                </div>
                <p className="text-sm font-semibold text-foreground mt-2">{entry.detail}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
