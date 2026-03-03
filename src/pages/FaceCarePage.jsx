import { useState } from "react";
import { faceExercises, skincareRoutine } from "@/lib/workoutData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Sparkles, Sun, Moon } from "lucide-react";
export default function FaceCarePage() {
    const [completedExercises, setCompletedExercises] = useState([]);
    const [completedSkincare, setCompletedSkincare] = useState([]);
    const toggleExercise = (name) => {
        setCompletedExercises((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);
    };
    const toggleSkincare = (name) => {
        setCompletedSkincare((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);
    };
    return (<div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Face & Skincare</h1>
      <p className="text-sm text-muted-foreground">
        Improve your facial features with targeted exercises and build a consistent skincare routine.
      </p>

      <Tabs defaultValue="exercises">
        <TabsList className="w-full">
          <TabsTrigger value="exercises" className="flex-1 gap-2">
            <Sparkles className="h-4 w-4"/> Face Exercises
          </TabsTrigger>
          <TabsTrigger value="skincare" className="flex-1 gap-2">
            <Sun className="h-4 w-4"/> Skincare
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="mt-4 space-y-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              {completedExercises.length}/{faceExercises.length} completed today
            </p>
          </div>
          {faceExercises.map((ex, i) => {
            const done = completedExercises.includes(ex.name);
            return (<motion.div key={ex.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={`shadow-card transition-all ${done ? "border-success/30 bg-success/5" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={done} onCheckedChange={() => toggleExercise(ex.name)} className="mt-1"/>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {ex.name}
                          </p>
                          <Badge variant="outline" className="text-xs">{ex.duration}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{ex.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>);
        })}
        </TabsContent>

        <TabsContent value="skincare" className="mt-4 space-y-4">
          {/* Morning Routine */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sun className="h-4 w-4 text-warning"/> Morning Routine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {skincareRoutine
            .filter((s) => s.when === "morning" || s.when === "both")
            .map((step) => {
            const key = `am-${step.name}`;
            const done = completedSkincare.includes(key);
            return (<div key={key} className={`flex items-start gap-3 p-3 rounded-lg transition-all ${done ? "bg-success/5" : "bg-muted/50"}`}>
                      <Checkbox checked={done} onCheckedChange={() => toggleSkincare(key)} className="mt-0.5"/>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            Step {step.step}: {step.name}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                        <p className="text-xs text-primary mt-1">💡 {step.tip}</p>
                      </div>
                    </div>);
        })}
            </CardContent>
          </Card>

          {/* Evening Routine */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Moon className="h-4 w-4 text-info"/> Evening Routine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {skincareRoutine
            .filter((s) => s.when === "evening" || s.when === "both")
            .map((step) => {
            const key = `pm-${step.name}`;
            const done = completedSkincare.includes(key);
            return (<div key={key} className={`flex items-start gap-3 p-3 rounded-lg transition-all ${done ? "bg-success/5" : "bg-muted/50"}`}>
                      <Checkbox checked={done} onCheckedChange={() => toggleSkincare(key)} className="mt-0.5"/>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            Step {step.step}: {step.name}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                        <p className="text-xs text-primary mt-1">💡 {step.tip}</p>
                      </div>
                    </div>);
        })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);
}
