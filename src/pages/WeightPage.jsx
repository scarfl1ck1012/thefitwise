import { useState } from "react";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { useUserStats } from "@/hooks/useUserStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Scale, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
export default function WeightPage() {
    const { logs, addWeight } = useWeightLogs();
    const { addXP } = useUserStats();
    const [weight, setWeight] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
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
    const chartData = logs.map((l) => ({
        date: new Date(l.logged_at + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        weight: Number(l.weight_kg),
    }));
    // 7-day rolling average
    const avgData = chartData.map((d, i) => {
        const slice = chartData.slice(Math.max(0, i - 6), i + 1);
        const avg = slice.reduce((s, v) => s + v.weight, 0) / slice.length;
        return { ...d, avg: Math.round(avg * 10) / 10 };
    });
    const latest = logs.length > 0 ? Number(logs[logs.length - 1].weight_kg) : null;
    const previous = logs.length > 1 ? Number(logs[logs.length - 2].weight_kg) : null;
    const diff = latest && previous ? Math.round((latest - previous) * 10) / 10 : 0;
    return (<div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Weight Tracking</h1>

      {/* Log Weight */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary"/> Log Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input type="number" placeholder="Weight in kg" value={weight} onChange={(e) => setWeight(e.target.value)} step="0.1"/>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40"/>
              <Button onClick={handleLog}>Log</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      {latest && (<div className="grid grid-cols-2 gap-4">
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
                {diff > 0 ? <TrendingUp className="h-4 w-4 text-accent"/> : diff < 0 ? <TrendingDown className="h-4 w-4 text-success"/> : <Minus className="h-4 w-4 text-muted-foreground"/>}
                <p className="text-2xl font-bold text-foreground">{diff > 0 ? "+" : ""}{diff} kg</p>
              </div>
            </CardContent>
          </Card>
        </div>)}

      {/* Chart */}
      {avgData.length > 1 && (<Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weight Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={avgData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border"/>
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }}/>
                  <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fill: "hsl(var(--muted-foreground))" }}/>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}/>
                  <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Weight"/>
                  <Line type="monotone" dataKey="avg" stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="7-day avg"/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>)}

      {/* Recent Entries */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-4">No entries yet</p>) : (<div className="space-y-2">
              {[...logs].reverse().slice(0, 10).map((l) => (<div key={l.id} className="flex justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">
                    {new Date(l.logged_at + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  <span className="text-sm font-bold text-foreground">{Number(l.weight_kg)} kg</span>
                </div>))}
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
