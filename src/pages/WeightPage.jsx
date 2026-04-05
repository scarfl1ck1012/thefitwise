import { useState, useMemo } from "react";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { useUserStats } from "@/hooks/useUserStats";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Scale, TrendingDown, TrendingUp, Minus, Target, Plus, ChevronDown } from "lucide-react";
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
function buildContinuousTimeline(logs, days = 60) {
  if (!logs.length) return [];
  const dateMap = {};
  for (const log of logs) {
    dateMap[log.logged_at] = Number(log.weight_kg);
  }
  const sortedDates = Object.keys(dateMap).sort();
  const endDate = new Date();
  const latestLoggedDate = new Date(sortedDates[sortedDates.length - 1]);
  if (latestLoggedDate > endDate) endDate.setTime(latestLoggedDate.getTime());
  const startDate = new Date(sortedDates[0]);
  const earliest = new Date();
  earliest.setDate(earliest.getDate() - days);
  if (startDate > earliest) earliest.setTime(startDate.getTime());

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
      timeline.push({ date: dateStr, weight: lastKnownWeight, isActual: false });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return timeline;
}

function addRollingAverage(data) {
  return data.map((d, i) => {
    const window = data.slice(Math.max(0, i - 6), i + 1);
    const avg = window.reduce((s, v) => s + v.weight, 0) / window.length;
    return { ...d, avg: Math.round(avg * 10) / 10 };
  });
}

function calculatePrediction(logs, goalWeight) {
  if (!logs || logs.length < 3 || !goalWeight) return null;
  
  // Use up to last 30 logs for recent trend
  const recentLogs = logs.slice(-30);
  const xs = recentLogs.map(l => new Date(l.logged_at).getTime());
  const ys = recentLogs.map(l => Number(l.weight_kg));
  
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += Math.pow(xs[i] - meanX, 2);
  }
  
  if (den === 0) return null;
  const slope = num / den; 
  const intercept = meanY - slope * meanX;
  
  const targetTimeMs = (goalWeight - intercept) / slope;
  
  const latestWeight = ys[ys.length - 1];
  if (goalWeight < latestWeight && slope >= 0) return null; 
  if (goalWeight > latestWeight && slope <= 0) return null;

  const predictedDate = new Date(targetTimeMs);
  const daysAway = Math.round((targetTimeMs - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysAway < 0 || daysAway > 365 * 3) return null; 
  
  return predictedDate;
}

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

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const dateLabel = new Date(d.date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return (
    <div className="bg-surface-high/90 backdrop-blur-md border border-surface-highest/30 rounded-xl p-3 shadow-elevated">
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{dateLabel}</p>
      <p className="text-sm font-bold text-foreground">
        {d.weight} kg{" "}
        {!d.isActual && (
          <span className="text-muted-foreground font-normal text-[10px]">(carried)</span>
        )}
      </p>
      {payload[1] && (
        <p className="text-[10px] text-primary font-bold mt-0.5">7-day avg: {payload[1].value} kg</p>
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
  const [showForm, setShowForm] = useState(false);

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
    setShowForm(false);
  };

  const chartData = useMemo(() => {
    const timeline = buildContinuousTimeline(logs, 60);
    return addRollingAverage(timeline);
  }, [logs]);

  const formatTick = (dateStr) => {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const latest = logs.length > 0 ? Number(logs[logs.length - 1].weight_kg) : null;
  const previous = logs.length > 1 ? Number(logs[logs.length - 2].weight_kg) : null;
  const diff = latest && previous ? Math.round((latest - previous) * 10) / 10 : 0;
  
  let goalWeight = null;
  if(profile?.goal === "lose" && latest) goalWeight = Math.round(latest * 0.9);
  if((profile?.goal === "gain" || profile?.goal === "bulk") && latest) goalWeight = Math.round(latest * 1.1);

  const predictedDate = useMemo(() => calculatePrediction(logs, goalWeight), [logs, goalWeight]);

  const fadeUp = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Weight Tracking</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="gap-1.5 h-9 rounded-full px-4 text-xs font-bold tracking-wide uppercase bg-primary text-primary-foreground hover:brightness-110 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all"
        >
          <Plus className="h-3.5 w-3.5" /> Log Weight
        </Button>
      </div>

      {/* Log Weight Form */}
      {showForm && (
        <motion.div {...fadeUp}>
          <div className="glass rounded-[2rem] p-6 border border-primary/20 shadow-[0_0_30px_rgba(34,197,94,0.1)] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-sm uppercase tracking-widest font-bold text-foreground">
                  Log Weight
                </h2>
              </div>
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Weight in kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  step="0.1"
                  className="flex-1 bg-surface-lowest/50 border-surface-highest/20"
                />
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-40 bg-surface-lowest/50 border-surface-highest/20"
                />
                <Button onClick={handleLog} className="shrink-0">Log</Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Hero */}
      {latest && (
        <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Weight */}
            <div className="glass rounded-[2rem] p-6 text-center relative overflow-hidden group hover:border-primary/30 hover:shadow-[0_10px_40px_rgba(34,197,94,0.1)] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 mb-3 mx-auto shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-black text-foreground mb-1">{latest}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Current (kg)
              </p>
            </div>

            {/* Change */}
            <div className="glass rounded-[2rem] p-6 text-center relative overflow-hidden group hover:border-info/30 hover:shadow-[0_10px_40px_rgba(59,130,246,0.1)] transition-all">
              <div className="absolute top-0 left-0 w-24 h-24 bg-info/5 rounded-full blur-2xl pointer-events-none" />
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-info/20 to-info/5 flex items-center justify-center border border-info/20 mb-3 mx-auto shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                {diff > 0 ? (
                  <TrendingUp className="h-6 w-6 text-accent" />
                ) : diff < 0 ? (
                  <TrendingDown className="h-6 w-6 text-success" />
                ) : (
                  <Minus className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <p className="text-3xl font-black text-foreground mb-1">
                {diff > 0 ? "+" : ""}
                {diff}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Change (kg)
              </p>
            </div>

            {/* Total Entries */}
            <div className="glass rounded-[2rem] p-6 text-center relative overflow-hidden group hover:border-warning/30 hover:shadow-[0_10px_40px_rgba(245,158,11,0.1)] transition-all">
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-warning/5 rounded-full blur-2xl pointer-events-none" />
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-warning/20 to-warning/5 flex items-center justify-center border border-warning/20 mb-3 mx-auto shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <ChevronDown className="h-6 w-6 text-warning" />
              </div>
              <p className="text-3xl font-black text-foreground mb-1">{logs.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Entries
              </p>
            </div>

            {/* Goal Weight */}
            {goalWeight ? (
              <div className="glass rounded-[2rem] p-6 text-center relative overflow-hidden group hover:border-success/30 hover:shadow-[0_10px_40px_rgba(34,197,94,0.1)] transition-all">
                <div className="absolute top-0 left-0 w-24 h-24 bg-success/5 rounded-full blur-2xl pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-success/20 to-success/5 flex items-center justify-center border border-success/20 mb-3 mx-auto shadow-[0_0_15px_rgba(34,197,94,0.15)] group-hover:scale-105 transition-transform">
                  <Target className="h-6 w-6 text-success" />
                </div>
                <p className="text-3xl font-black text-foreground mb-1">{goalWeight}</p>
                {predictedDate ? (
                   <p className="text-[9px] font-bold uppercase tracking-widest text-success bg-success/10 py-1 px-2 rounded-full inline-block mt-0.5">
                     Goal: {predictedDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                   </p>
                ) : (
                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                     Goal (kg)
                   </p>
                )}
              </div>
            ) : (
              <div className="glass rounded-[2rem] p-6 text-center relative overflow-hidden group hover:border-surface-highest/60 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-surface-highest/40 to-surface-highest/10 flex items-center justify-center border border-surface-highest/30 mb-3 mx-auto">
                  <Target className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-xl font-black text-muted-foreground mb-1">—</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Goal (kg)
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Area Chart */}
      {chartData.length > 1 && (
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <div className="glass rounded-[2rem] p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <TrendingDown className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-sm uppercase tracking-widest font-bold text-foreground">
                    Weight Trend
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-primary rounded" /> Weight
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-0.5 rounded"
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
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Entries */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
        <div className="glass rounded-[2rem] p-6 lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center border border-info/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Scale className="h-5 w-5 text-info" />
            </div>
            <h2 className="text-sm uppercase tracking-widest font-bold text-foreground">
              Recent Entries
            </h2>
          </div>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No entries yet. Log your first weight above!
            </p>
          ) : (
            <div className="space-y-2">
              {[...logs]
                .reverse()
                .slice(0, 10)
                .map((l) => (
                  <div
                    key={l.id}
                    className="flex justify-between items-center p-4 rounded-2xl bg-surface-lowest/40 border border-border/30 hover:bg-surface-lowest/60 transition-colors"
                  >
                    <span className="text-[13px] font-medium text-muted-foreground">
                      {new Date(l.logged_at + "T12:00:00").toLocaleDateString(
                        "en-US",
                        { weekday: "short", month: "short", day: "numeric" }
                      )}
                    </span>
                    <span className="text-[15px] font-bold text-foreground">
                      {Number(l.weight_kg)} kg
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
