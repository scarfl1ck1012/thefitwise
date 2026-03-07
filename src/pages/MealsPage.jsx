import { useState } from "react";
import { useMeals } from "@/hooks/useMeals";
import { useProfile } from "@/hooks/useProfile";
import { useUserStats } from "@/hooks/useUserStats";
import { useWaterLogs } from "@/hooks/useWaterLogs";
import { useCaffeineLogs } from "@/hooks/useCaffeineLogs";
import { searchFoods } from "@/lib/foodDatabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Droplets,
  PlusCircle,
  Coffee,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
export default function MealsPage() {
  const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const {
    meals,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalSodium,
    totalPotassium,
    addMeal,
    deleteMeal,
  } = useMeals(selectedDate);
  const { profile } = useProfile();
  const { addXP } = useUserStats();
  const { totalWaterMl, addWater, removeLastWater } =
    useWaterLogs(selectedDate);
  const { totalCaffeineMg, addCaffeine, removeLastCaffeine } =
    useCaffeineLogs(selectedDate);
  const [search, setSearch] = useState("");
  const [servings, setServings] = useState(1);
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  // Custom meal state
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customGrams, setCustomGrams] = useState("");
  const [customCalories, setCustomCalories] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs, setCustomCarbs] = useState("");
  const [customFat, setCustomFat] = useState("");
  const [customSodium, setCustomSodium] = useState("");
  const [customPotassium, setCustomPotassium] = useState("");
  const calorieGoal = profile?.daily_calories || 2000;
  const sodiumLimit = 2300; // mg, FDA recommended
  const potassiumLimit = profile?.gender === "female" ? 2600 : 3400; // mg, by gender
  const caffeineLimit = 400; // mg, FDA recommended
  const results = search.length > 1 ? searchFoods(search) : [];
  const isToday = selectedDate === getLocalDate();
  const waterLiters = (totalWaterMl / 1000).toFixed(1);
  const logFood = (food) => {
    addMeal.mutate({
      recipe_title: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      sodium: food.sodium,
      potassium: food.potassium,
      servings,
      meal_type: "manual",
    });
    addXP.mutate(10);
    toast.success(`${food.name} logged (${servings}x)`);
    setSearch("");
    setServings(1);
  };
  const logCustomMeal = () => {
    if (!customName.trim() || !customCalories) return;
    addMeal.mutate({
      recipe_title: customName,
      calories: parseInt(customCalories) || 0,
      protein: parseInt(customProtein) || 0,
      carbs: parseInt(customCarbs) || 0,
      fat: parseInt(customFat) || 0,
      sodium: parseInt(customSodium) || 0,
      potassium: parseInt(customPotassium) || 0,
      servings: 1,
      meal_type: "custom",
    });
    addXP.mutate(10);
    toast.success(`${customName} logged!`);
    setCustomOpen(false);
    setCustomName("");
    setCustomGrams("");
    setCustomCalories("");
    setCustomProtein("");
    setCustomCarbs("");
    setCustomFat("");
    setCustomSodium("");
    setCustomPotassium("");
  };
  const analyzeWithAI = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-meal", {
        body: { description: aiInput },
      });

      if (error) {
        throw new Error(error.message || "Failed to reach AI service");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const items = data?.items || [];
      if (items.length === 0) {
        throw new Error("No items could be parsed from your description.");
      }

      for (const item of items) {
        await addMeal.mutateAsync({
          recipe_title: item.name,
          calories: item.calories,
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fat: item.fat || 0,
          sodium: item.sodium || 0,
          potassium: item.potassium || 0,
          servings: item.servings || 1,
          meal_type: "ai",
        });
      }
      addXP.mutate(15 * items.length);
      toast.success(`${items.length} item(s) logged via AI`);
      setAiInput("");
      setShowAI(false);
    } catch (err) {
      toast.error("AI analysis failed: " + (err.message || "Unknown error"));
    } finally {
      setAiLoading(false);
    }
  };
  const shiftDate = (days) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    setSelectedDate(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Meals</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => shiftDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[100px] text-center">
            {isToday
              ? "Today"
              : new Date(selectedDate + "T12:00:00").toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" },
                )}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => shiftDate(1)}
            disabled={isToday}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Macro Donut + Limits */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          {/* Donut Chart */}
          {(() => {
            const macroData = [
              { name: "Protein", value: Math.round(totalProtein) || 0 },
              { name: "Carbs", value: Math.round(totalCarbs) || 0 },
              { name: "Fat", value: Math.round(totalFat) || 0 },
            ];
            const COLORS = [
              "hsl(var(--primary))", // Protein = mint green
              "hsl(var(--info))", // Carbs = blue
              "hsl(var(--accent))", // Fat = orange
            ];
            const hasData = macroData.some((d) => d.value > 0);
            const emptyData = [{ name: "Empty", value: 1 }];
            return (
              <div className="relative flex flex-col items-center">
                <div className="w-44 h-44 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={hasData ? macroData : emptyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={72}
                        paddingAngle={hasData ? 3 : 0}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {hasData ? (
                          macroData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i]} />
                          ))
                        ) : (
                          <Cell fill="hsl(var(--muted))" />
                        )}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-foreground leading-tight">
                      {totalCalories}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      / {calorieGoal} kcal
                    </span>
                  </div>
                </div>

                {/* Macro Legend */}
                <div className="flex items-center gap-4 mt-2">
                  {[
                    {
                      label: "Protein",
                      value: `${Math.round(totalProtein)}g`,
                      color: "bg-primary",
                    },
                    {
                      label: "Carbs",
                      value: `${Math.round(totalCarbs)}g`,
                      color: "bg-info",
                    },
                    {
                      label: "Fat",
                      value: `${Math.round(totalFat)}g`,
                      color: "bg-accent",
                    },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${m.color}`} />
                      <span className="text-xs text-muted-foreground">
                        {m.label}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Sodium & Potassium Limits */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              {
                label: "Sodium",
                raw: Math.round(totalSodium),
                limit: sodiumLimit,
                unit: "mg",
                color: "bg-destructive",
              },
              {
                label: "Potassium",
                raw: Math.round(totalPotassium),
                limit: potassiumLimit,
                unit: "mg",
                color: "bg-primary",
              },
            ].map((m) => (
              <div key={m.label} className="p-2.5 rounded-lg bg-muted/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-muted-foreground">
                    {m.label}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${m.raw > m.limit ? "text-destructive" : "text-foreground"}`}
                  >
                    {m.raw}/{m.limit}
                    {m.unit}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${m.raw > m.limit ? "bg-destructive" : m.color}`}
                    style={{
                      width: `${Math.min((m.raw / m.limit) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Water & Caffeine Tracker */}
      <div className="grid grid-cols-2 gap-3">
        {/* Water */}
        <Card className="shadow-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="h-4 w-4 text-info" />
              <span className="text-xs font-medium text-foreground">Water</span>
              <span className="text-xs font-bold text-info ml-auto">
                {waterLiters}L
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {Array.from({ length: Math.floor(totalWaterMl / 500) }).map(
                (_, i) => (
                  <span key={i} className="text-sm">
                    🍶
                  </span>
                ),
              )}
              {totalWaterMl % 500 >= 250 && (
                <span className="text-sm opacity-50">🍶</span>
              )}
              {totalWaterMl === 0 && (
                <span className="text-xs text-muted-foreground">
                  No water yet
                </span>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 flex-1 px-1"
                onClick={() => {
                  addWater.mutate(500);
                  toast.success("+500ml 💧");
                }}
                disabled={!isToday}
              >
                +500ml
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 flex-1 px-1"
                onClick={() => {
                  addWater.mutate(1000);
                  toast.success("+1L 💧");
                }}
                disabled={!isToday}
              >
                +1L
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-1"
                onClick={() => {
                  removeLastWater.mutate();
                  toast("Undo");
                }}
                disabled={!isToday || totalWaterMl === 0}
              >
                ↩
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Caffeine */}
        <Card className="shadow-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Coffee className="h-4 w-4 text-warning" />
              <span className="text-xs font-medium text-foreground">
                Caffeine
              </span>
              <span
                className={`text-xs font-bold ml-auto ${totalCaffeineMg > caffeineLimit ? "text-destructive" : "text-warning"}`}
              >
                {totalCaffeineMg}/{caffeineLimit}mg
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mb-2">
              <div
                className={`h-1.5 rounded-full transition-all ${totalCaffeineMg > caffeineLimit ? "bg-destructive" : "bg-warning"}`}
                style={{
                  width: `${Math.min((totalCaffeineMg / caffeineLimit) * 100, 100)}%`,
                }}
              />
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {Array.from({ length: Math.floor(totalCaffeineMg / 95) }).map(
                (_, i) => (
                  <span key={i} className="text-sm">
                    ☕
                  </span>
                ),
              )}
              {totalCaffeineMg > 0 && totalCaffeineMg % 95 >= 40 && (
                <span className="text-sm opacity-50">☕</span>
              )}
              {totalCaffeineMg === 0 && (
                <span className="text-xs text-muted-foreground">
                  No caffeine yet
                </span>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 flex-1 px-1"
                onClick={() => {
                  addCaffeine.mutate({ amount_mg: 95, drink_type: "coffee" });
                  toast.success("+1 Coffee ☕");
                }}
                disabled={!isToday}
              >
                ☕ Coffee
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 flex-1 px-1"
                onClick={() => {
                  addCaffeine.mutate({ amount_mg: 47, drink_type: "tea" });
                  toast.success("+1 Tea 🍵");
                }}
                disabled={!isToday}
              >
                🍵 Tea
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-1"
                onClick={() => {
                  removeLastCaffeine.mutate();
                  toast("Undo");
                }}
                disabled={!isToday || totalCaffeineMg === 0}
              >
                ↩
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {isToday && (
        <div className="flex gap-2">
          <Dialog open={customOpen} onOpenChange={setCustomOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 gap-2">
                <PlusCircle className="h-4 w-4" /> Custom Meal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Meal</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Meal name (e.g., Protein Shake)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
                <Input
                  placeholder="Serving size in grams"
                  type="number"
                  value={customGrams}
                  onChange={(e) => setCustomGrams(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Calories"
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                  />
                  <Input
                    placeholder="Protein (g)"
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                  />
                  <Input
                    placeholder="Carbs (g)"
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                  />
                  <Input
                    placeholder="Fat (g)"
                    type="number"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                  />
                  <Input
                    placeholder="Sodium (mg)"
                    type="number"
                    value={customSodium}
                    onChange={(e) => setCustomSodium(e.target.value)}
                  />
                  <Input
                    placeholder="Potassium (mg)"
                    type="number"
                    value={customPotassium}
                    onChange={(e) => setCustomPotassium(e.target.value)}
                  />
                </div>
                <Button
                  onClick={logCustomMeal}
                  disabled={!customName.trim() || !customCalories}
                  className="w-full"
                >
                  Log Meal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => setShowAI(!showAI)}
          >
            <Sparkles className="h-4 w-4" /> AI Analyzer
          </Button>
        </div>
      )}

      {/* AI Custom Meal */}
      <AnimatePresence>
        {isToday && showAI && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <Card className="shadow-card border-primary/20">
              <CardContent className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Describe what you ate. Multiple items will be logged
                  separately with sodium & potassium.
                </p>
                <Textarea
                  placeholder="I had 3 eggs, 2 rotis with dal, and a banana..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={analyzeWithAI}
                  disabled={aiLoading || !aiInput.trim()}
                  className="w-full"
                >
                  {aiLoading ? "Analyzing..." : "Analyze & Log Items"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food Search */}
      {isToday && (
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Log Food</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search foods..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-muted/80 placeholder:text-muted-foreground/70 focus-visible:ring-primary/50 focus-visible:ring-2 focus-visible:bg-muted"
              />
            </div>
            {search.length > 1 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Servings:</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-bold text-foreground w-8 text-center">
                  {servings}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setServings(Math.min(10, servings + 0.5))}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {results.map((food) => (
                <button
                  key={food.name}
                  onClick={() => logFood(food)}
                  className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {food.name}
                      </p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-[10px]">
                          P:{food.protein}g
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          C:{food.carbs}g
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          F:{food.fat}g
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          Na:{food.sodium}mg
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          K:{food.potassium}mg
                        </Badge>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {Math.round(food.calories * servings)} cal
                    </span>
                  </div>
                </button>
              ))}
              {search.length > 1 && results.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No results. Try the AI analyzer or add a custom meal!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Meals */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {isToday
              ? "Today's Meals"
              : `Meals on ${new Date(selectedDate + "T12:00:00").toLocaleDateString()}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {meals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No meals logged
            </p>
          ) : (
            <div className="space-y-2">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {meal.recipe_title}{" "}
                      {meal.servings > 1 ? `(${meal.servings}x)` : ""}
                    </p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {Math.round(meal.calories * meal.servings)} cal
                      </span>
                      <span className="text-xs text-info">
                        P:{Math.round(Number(meal.protein) * meal.servings)}g
                      </span>
                      <span className="text-xs text-warning">
                        C:{Math.round(Number(meal.carbs) * meal.servings)}g
                      </span>
                      <span className="text-xs text-accent">
                        F:{Math.round(Number(meal.fat) * meal.servings)}g
                      </span>
                      <span className="text-xs text-destructive">
                        Na:
                        {Math.round(Number(meal.sodium || 0) * meal.servings)}mg
                      </span>
                      <span className="text-xs text-primary">
                        K:
                        {Math.round(
                          Number(meal.potassium || 0) * meal.servings,
                        )}
                        mg
                      </span>
                    </div>
                  </div>
                  {isToday && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteMeal.mutate(meal.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
