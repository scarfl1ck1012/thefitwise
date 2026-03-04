import { useState, useMemo } from "react";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { useUserStats } from "@/hooks/useUserStats";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Scale, TrendingDown, TrendingUp, Minus, Target } from "lucide-react";
import { toast } from "sonner";
import { getLocalDate } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

// --- Sparse Data Utility ---
// Builds a continuous timeline with forward-fill for missing days
function buildContinuousTimeline(logs, days = 60) {
  if (!logs.length) return [];

  // Step 1: Create a Date Dictionary (Hash Map) for O(1) lookups
  const dateMap = {};
  for (const log of logs) {
    dateMap[log.logged_at] = Number(log.weight_kg);
  }

  // Step 2: Determine the range
  const sortedDates = Object.keys(dateMap).sort();
  const endDate = new Date();
  const startDate = new Date(sortedDates[0]);
  // Go back at most `days` from today
  const earliest = new Date(endDate);
  earliest.setDate(earliest.getDate() - days);
  if (startDate > earliest) earliest.setTime(startDate.getTime());

  // Step 3: Generate continuous master timeline with forward-fill
  const timeline = [];
  let lastKnownWeight = null;
  const cursor = new Date(earliest);
  cursor.setHours(12, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(12, 0, 0, 0);

  while (cursor <= end) {
    const dateStr = getLocalDate(cursor);
    const actualWeight = dateMap[dateStr];

    if (actualWeight !== undefined) {
      lastKnownWeight = actualWeight;
      timeline.push({ date: dateStr, weight: actualWeight, isActual: true });
    } else if (lastKnownWeight !== null) {
      // Forward-fill: carry over last known weight
      timeline.push({
        date: dateStr,
        weight: lastKnownWeight,
        isActual: false,
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return timeline;
}

// Compute 7-day rolling average
function addRollingAverage(data) {
  return data.map((d, i) => {
    const window = data.slice(Math.max(0, i - 6), i + 1);
    const avg = window.reduce((s, v) => s + v.weight, 0) / window.length;
    return { ...d, avg: Math.round(avg * 10) / 10 };
  });
}

// Custom dot: only show dots on actual logged data points
function ActualDot(props) {
  const { cx, cy, payload } = props;
  if (!payload.isActual) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="hsl(var(--primary))"
      stroke="hsl(var(--background))"
      strokeWidth={2}
    />
  );
}

// Custom tooltip
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const dateLabel = new Date(d.date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-elevated">
      <p className="text-xs text-muted-foreground mb-1">{dateLabel}</p>
      <p className="text-sm font-bold text-foreground">
        {d.weight} kg{" "}
        {!d.isActual && (
          <span className="text-muted-foreground font-normal">(carried)</span>
        )}
      </p>
      {payload[1] && (
        <p className="text-xs text-accent">7-day avg: {payload[1].value} kg</p>
      )}
    </div>
  );
}

export default function WeightPage() {
  const { logs, addWeight } = useWeightLogs();
  const { addXP } = useUserStats();
  const { profile } = useProfile();
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(getLocalDate());

  const handleLog = () => {
    const w = parseFloat(weight);
    if (!w || w < 20 || w > 400) {
      toast.error("Enter a valid weight (20-400 kg)");
      return;
    }
    addWeight.mutate({ weight_kg: w, logged_at: date });
    addXP.mutate(15);
    toast.success(`Weight logged: ${w} kg`);
    setWeight("");
  };

  // Build the chart data with sparse fill and rolling average
  const chartData = useMemo(() => {
    const timeline = buildContinuousTimeline(logs, 60);
    return addRollingAverage(timeline);
  }, [logs]);

  // Format dates for X axis
  const formatTick = (dateStr) => {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const latest =
    logs.length > 0 ? Number(logs[logs.length - 1].weight_kg) : null;
  const previous =
    logs.length > 1 ? Number(logs[logs.length - 2].weight_kg) : null;
  const diff =
    latest && previous ? Math.round((latest - previous) * 10) / 10 : 0;

  // Goal weight from profile or a sensible default
  const goalWeight =
    profile?.goal === "lose" && latest ? Math.round(latest * 0.9) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Weight Tracking</h1>

      {/* Log Weight */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" /> Log Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="Weight in kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                step="0.1"
              />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-40"
              />
              <Button onClick={handleLog}>Log</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      {latest && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Current</p>
              <p className="text-2xl font-bold text-foreground">{latest} kg</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Change</p>
              <div className="flex items-center justify-center gap-1">
                {diff > 0 ? (
                  <TrendingUp className="h-4 w-4 text-accent" />
                ) : diff < 0 ? (
                  <TrendingDown className="h-4 w-4 text-success" />
                ) : (
                  <Minus className="h-4 w-4 text-muted-foreground" />
                )}
                <p className="text-2xl font-bold text-foreground">
                  {diff > 0 ? "+" : ""}
                  {diff} kg
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Area Chart */}
      {chartData.length > 1 && (
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Weight Trend</CardTitle>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-primary rounded" /> Weight
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-0.5 bg-accent rounded border-dashed"
                    style={{
                      borderTop: "1.5px dashed hsl(var(--accent))",
                      background: "none",
                    }}
                  />{" "}
                  7d avg
                </span>
                {goalWeight && (
                  <span className="flex items-center gap-1.5">
                    <Target className="h-3 w-3" /> Goal
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 5, bottom: 5, left: -10 }}
                >
                  <defs>
                    <linearGradient
                      id="weightGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatTick}
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                    interval="preserveStartEnd"
                    minTickGap={40}
                  />
                  <YAxis
                    domain={["dataMin - 2", "dataMax + 2"]}
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                    unit=" kg"
                  />
                  <Tooltip content={<ChartTooltip />} />
                  {goalWeight && (
                    <ReferenceLine
                      y={goalWeight}
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="6 4"
                      strokeWidth={1.5}
                      label={{
                        value: `Goal: ${goalWeight}kg`,
                        position: "right",
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 11,
                      }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fill="url(#weightGradient)"
                    dot={<ActualDot />}
                    activeDot={{
                      r: 5,
                      fill: "hsl(var(--primary))",
                      stroke: "hsl(var(--background))",
                      strokeWidth: 2,
                    }}
                    name="Weight"
                    connectNulls
                  />
                  <Area
                    type="monotone"
                    dataKey="avg"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="none"
                    dot={false}
                    name="7-day avg"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Entries */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No entries yet
            </p>
          ) : (
            <div className="space-y-2">
              {[...logs]
                .reverse()
                .slice(0, 10)
                .map((l) => (
                  <div
                    key={l.id}
                    className="flex justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <span className="text-sm text-muted-foreground">
                      {new Date(l.logged_at + "T12:00:00").toLocaleDateString(
                        "en-US",
                        { weekday: "short", month: "short", day: "numeric" },
                      )}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {Number(l.weight_kg)} kg
                    </span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
