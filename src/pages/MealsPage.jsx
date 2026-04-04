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
  Loader2,
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
      calories: Math.max(0, parseInt(customCalories) || 0),
      protein: Math.max(0, parseInt(customProtein) || 0),
      carbs: Math.max(0, parseInt(customCarbs) || 0),
      fat: Math.max(0, parseInt(customFat) || 0),
      sodium: Math.max(0, parseInt(customSodium) || 0),
      potassium: Math.max(0, parseInt(customPotassium) || 0),
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
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error("Gemini API key not configured");
      }

      const systemInstruction = `You are a certified clinical nutritionist with a USDA food composition database. When given a food description, break it down into individual food items and provide PRECISE nutritional data.

CRITICAL: Return ONLY valid JSON, no markdown, no code blocks. Format:
{"items":[{"name":"Food name","calories":123,"protein":10,"carbs":20,"fat":5,"sodium":200,"potassium":300,"servings":1}]}

PRECISION RULES:
- Use USDA Standard Reference values. Do NOT estimate loosely.
- Calories must match: (protein × 4) + (carbs × 4) + (fat × 9) approximately
- For cooked foods, use cooked weight nutritional values
- For raw foods, use raw weight nutritional values
- Sodium is in milligrams (mg). Most whole foods are low (0-100mg). Processed foods are high (300-1000mg+)
- Potassium is in milligrams (mg). Fruits/vegetables are high (150-500mg). Meats moderate (200-400mg)
- If someone says "2 eggs and 1 toast", return 2 separate items: eggs (servings: 2) and toast (servings: 1)
- Be specific with names (e.g., "Boiled Egg (large)" not just "Egg")
- Use realistic per-serving values based on standard portion sizes
- The servings field represents how many of that item
- Always return at least one item

REFERENCE VALUES (per standard serving):
- 1 large egg: 78cal, 6g protein, 1g carbs, 5g fat, 62mg sodium, 63mg potassium
- 1 roti/chapati: 104cal, 3g protein, 18g carbs, 3g fat, 119mg sodium, 69mg potassium
- 1 bowl dal: 180cal, 12g protein, 30g carbs, 2g fat, 490mg sodium, 480mg potassium
- 1 medium banana: 105cal, 1g protein, 27g carbs, 0g fat, 1mg sodium, 422mg potassium
- 100g chicken breast: 165cal, 31g protein, 0g carbs, 3.6g fat, 74mg sodium, 256mg potassium
- 100g cooked white rice: 130cal, 3g protein, 28g carbs, 0.3g fat, 1mg sodium, 35mg potassium`;

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const requestBody = JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: aiInput }] }],
        generationConfig: { temperature: 0.1 },
      });

      let response;
      const maxRetries = 3;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        });

        if (response.status === 429 && attempt < maxRetries - 1) {
          const waitMs = Math.pow(2, attempt) * 1500; // 1.5s, 3s, 6s
          toast.info(`Rate limited — retrying in ${waitMs / 1000}s...`);
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }
        break;
      }

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("API rate limit reached. Please wait a minute and try again.");
        }
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      let parsed;
      try {
        const cleaned = content
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        parsed = JSON.parse(cleaned);
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error("Could not parse AI response");
        }
      }

      const items = parsed?.items || [];
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
  const macroData = [
    { name: "Protein", value: Math.round(totalProtein) || 0, color: "hsl(var(--primary))" },
    { name: "Carbs", value: Math.round(totalCarbs) || 0, color: "hsl(var(--info))" },
    { name: "Fat", value: Math.round(totalFat) || 0, color: "hsl(var(--accent))" },
  ];
  const hasData = macroData.some((d) => d.value > 0);
  const emptyData = [{ name: "Empty", value: 1, color: "hsl(var(--muted))" }];

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto pl-4 lg:pl-0 pr-4 pt-4 overflow-x-hidden">
      
      {/* Header */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Nutrition Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Fuel your body efficiently</p>
        </div>
        
        <div className="flex items-center gap-1 bg-surface-low rounded-full border border-border/30 p-1 px-3">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-white" onClick={() => shiftDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-bold text-white min-w-[80px] text-center uppercase tracking-widest">
            {isToday ? "TODAY" : new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-white" onClick={() => shiftDate(1)} disabled={isToday}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main KPI Row - Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Master Calories & Macros (Spans 2 cols) */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 rounded-[2rem] bg-[#0c0c0c] border border-border/30 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-info/5 opacity-50"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-[50px] pointer-events-none" />

            {/* KCAL Hero Circle */}
            <div className="relative w-52 h-52 shrink-0">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={hasData ? macroData : emptyData}
                     cx="50%"
                     cy="50%"
                     innerRadius={82}
                     outerRadius={100}
                     paddingAngle={hasData ? 4 : 0}
                     dataKey="value"
                     strokeWidth={0}
                     cornerRadius={10}
                   >
                     {(hasData ? macroData : emptyData).map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               
               {/* Center Metric */}
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">INTAKE</span>
                  <span className="text-4xl font-black text-white">{totalCalories}</span>
                  <span className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/10">/{calorieGoal} KCAL</span>
               </div>
            </div>

            {/* Macro & Micro Trackers */}
            <div className="flex flex-col flex-1 w-full gap-5 z-10">
                {/* Macros */}
                <div className="grid grid-cols-3 gap-3">
                    <MacroPill label="Protein" val={Math.round(totalProtein)} color="bg-primary/20 text-primary border-primary/30" unit="g" />
                    <MacroPill label="Carbs" val={Math.round(totalCarbs)} color="bg-info/20 text-info border-info/30" unit="g" />
                    <MacroPill label="Fat" val={Math.round(totalFat)} color="bg-accent/20 text-accent border-accent/30" unit="g" />
                </div>

                <div className="h-px w-full bg-border/40"></div>

                {/* Micros (Sodium / Potas) */}
                <div className="space-y-3 pt-1">
                    <MicroBar label="Sodium" val={totalSodium} limit={sodiumLimit} unit="mg" isWarning={totalSodium > sodiumLimit} />
                    <MicroBar label="Potassium" val={totalPotassium} limit={potassiumLimit} unit="mg" isWarning={false} />
                </div>
            </div>
        </motion.div>

        {/* Right Column: Hydration & Caffeine */}
        <div className="md:col-span-1 flex flex-col gap-4">
            {/* Water Tracker */}
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex-1 rounded-[2rem] bg-surface-low border border-border/30 p-5 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-info/10 rounded-full blur-[30px] pointer-events-none" />
                
                <div>
                   <div className="flex items-center justify-between mb-4">
                       <Badge variant="outline" className="border-info/50 text-info bg-info/10 ml-0 mr-auto text-[10px] tracking-widest">WATER</Badge>
                       <span className="text-xl font-black text-white">{waterLiters}L</span>
                   </div>
                   
                   <div className="flex flex-wrap gap-2 mb-4">
                      {Array.from({ length: Math.floor(totalWaterMl / 500) }).map((_, i) => (
                        <div key={`w-${i}`} className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center border border-info/40">
                           <Droplets className="w-4 h-4 text-info" />
                        </div>
                      ))}
                      {totalWaterMl % 500 >= 250 && (
                        <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center border border-info/20 opacity-50">
                           <Droplets className="w-4 h-4 text-info" />
                        </div>
                      )}
                      {totalWaterMl === 0 && <span className="text-xs text-muted-foreground font-medium">Dehydrated</span>}
                   </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-9 text-xs font-bold rounded-xl bg-[#111] hover:bg-[#1a1a1a] border-white/5 hover:border-info/30" onClick={() => { addWater.mutate(500); toast.success("+500ml 💧"); }} disabled={!isToday}>
                        +500 ML
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-muted/50 hover:bg-destructive/20 hover:text-destructive" onClick={() => { removeLastWater.mutate(); toast("Undo"); }} disabled={!isToday || totalWaterMl === 0}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </motion.div>

            {/* Caffeine Tracker */}
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="flex-1 rounded-[2rem] bg-surface-low border border-border/30 p-5 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-warning/10 rounded-full blur-[30px] pointer-events-none" />
                
                <div>
                   <div className="flex items-center justify-between mb-4">
                       <Badge variant="outline" className="border-warning/50 text-warning bg-warning/10 ml-0 mr-auto text-[10px] tracking-widest">CAFFEINE</Badge>
                       <span className={`text-xl font-black ${totalCaffeineMg > caffeineLimit ? "text-destructive" : "text-white"}`}>{totalCaffeineMg}mg</span>
                   </div>
                   
                   <div className="w-full bg-black/40 rounded-full h-1.5 mb-4 border border-white/5">
                     <div
                       className={`h-1.5 rounded-full transition-all ${totalCaffeineMg > caffeineLimit ? "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-warning shadow-[0_0_10px_rgba(245,158,11,0.5)]"}`}
                       style={{ width: `${Math.min((totalCaffeineMg / caffeineLimit) * 100, 100)}%` }}
                     />
                   </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-9 text-xs font-bold rounded-xl bg-[#111] hover:bg-[#1a1a1a] border-white/5 hover:border-warning/30" onClick={() => { addCaffeine.mutate({ amount_mg: 95, drink_type: "coffee" }); toast.success("+1 Coffee ☕"); }} disabled={!isToday}>
                        + COFFEE
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-muted/50 hover:bg-destructive/20 hover:text-destructive" onClick={() => { removeLastCaffeine.mutate(); toast("Undo"); }} disabled={!isToday || totalCaffeineMg === 0}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </motion.div>
        </div>
      </div>

      {/* Action Buttons Row */}
      {isToday && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row gap-3">
          {/* Custom Meal Dialog Trigger */}
          <Dialog open={customOpen} onOpenChange={setCustomOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 h-12 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold gap-2 group">
                <PlusCircle className="h-4 w-4" /> 
                <span>Add Custom Meal</span>
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md bg-[#111] border-border/40 rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold tracking-tight">Manual Log</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input placeholder="Meal name (e.g., Protein Shake)" value={customName} onChange={(e) => setCustomName(e.target.value)} className="bg-surface-lowest border-white/10" />
                <Input placeholder="Serving size in grams" type="number" value={customGrams} onChange={(e) => setCustomGrams(e.target.value)} className="bg-surface-lowest border-white/10" />
                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-border/40">
                  <Input placeholder="Calories" type="number" value={customCalories} onChange={(e) => setCustomCalories(e.target.value)} className="bg-surface-lowest border-white/10 font-mono" />
                  <Input placeholder="Protein (g)" type="number" value={customProtein} onChange={(e) => setCustomProtein(e.target.value)} className="bg-surface-lowest border-white/10 text-primary font-mono" />
                  <Input placeholder="Carbs (g)" type="number" value={customCarbs} onChange={(e) => setCustomCarbs(e.target.value)} className="bg-surface-lowest border-white/10 text-info font-mono" />
                  <Input placeholder="Fat (g)" type="number" value={customFat} onChange={(e) => setCustomFat(e.target.value)} className="bg-surface-lowest border-white/10 text-accent font-mono" />
                  <Input placeholder="Sodium (mg)" type="number" value={customSodium} onChange={(e) => setCustomSodium(e.target.value)} className="bg-surface-lowest border-white/10 text-destructive font-mono" />
                  <Input placeholder="Potassium (mg)" type="number" value={customPotassium} onChange={(e) => setCustomPotassium(e.target.value)} className="bg-surface-lowest border-white/10 text-primary font-mono" />
                </div>
                <Button onClick={logCustomMeal} disabled={!customName.trim() || !customCalories} className="w-full h-12 bg-white text-black font-bold rounded-xl hover:bg-neutral-200">
                  Save Meal
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* AI Analyzer Toggle */}
          <Button variant="outline" className={`flex-1 h-12 rounded-xl font-bold gap-2 border-white/10 ${showAI ? 'bg-primary/20 text-primary border-primary/30' : 'bg-surface-low hover:bg-surface-highest hover:text-white'}`} onClick={() => setShowAI(!showAI)}>
            <Sparkles className={`h-4 w-4 ${showAI ? 'animate-pulse' : ''}`} /> {showAI ? 'Hide Analyzer' : 'AI Analyzer'}
          </Button>
        </motion.div>
      )}

      {/* AI AI Panel (Collapsible) */}
      <AnimatePresence>
        {isToday && showAI && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="rounded-[2rem] bg-[#0f1712] border border-primary/20 shadow-[0_0_30px_rgba(34,197,94,0.05)] p-6 relative">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Sparkles className="w-16 h-16 text-primary" />
               </div>
               
               <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> FitWise AI Vision
               </h3>
               <p className="text-xs text-muted-foreground font-medium mb-4 max-w-md">
                 Describe your meal in natural language. We'll extract the macros, calories, and micronutrients automatically.
               </p>
               
               <Textarea placeholder="E.g., I had 3 boiled eggs, 2 slices of whole wheat toast, and a medium banana." value={aiInput} onChange={(e) => setAiInput(e.target.value)} rows={3} className="bg-black/50 border-white/10 rounded-xl resize-none focus-visible:ring-primary/40 text-sm font-medium mb-4 shadow-inner" />
               
               <Button onClick={analyzeWithAI} disabled={aiLoading || !aiInput.trim()} className="w-full sm:w-auto h-10 px-8 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90">
                 {aiLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deep Analysis...</> : "Analyze & Extract"}
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      
      {/* Food Search & Logged Meals (Side by Side on Large screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Left Column: Search foods */}
          {isToday && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="rounded-[2rem] bg-surface-low border border-border/30 p-6 flex flex-col h-[400px]">
               <div className="flex items-center justify-between mb-4 shrink-0">
                  <h2 className="text-xs uppercase tracking-widest font-bold text-white">Food Database</h2>
               </div>

               <div className="relative mb-4 shrink-0">
                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                 <Input
                   placeholder="Search millions of foods..."
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="pl-10 h-12 rounded-xl bg-[#111] border-white/10 placeholder:text-muted-foreground focus-visible:ring-primary/30 text-sm font-medium"
                 />
               </div>

               {search.length > 1 && (
                 <div className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/5 mb-3 shrink-0">
                   <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Portion</span>
                   <div className="flex items-center gap-3">
                     <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm bg-surface-lowest hover:bg-muted" onClick={() => setServings(Math.max(0.5, servings - 0.5))}>
                       <Minus className="h-3 w-3" />
                     </Button>
                     <span className="text-sm font-black text-white w-6 text-center">{servings}</span>
                     <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm bg-surface-lowest hover:bg-muted" onClick={() => setServings(Math.min(10, servings + 0.5))}>
                       <Plus className="h-3 w-3" />
                     </Button>
                   </div>
                 </div>
               )}

               <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
                 {results.length > 0 ? results.map((food) => (
                   <div key={food.name} className="w-full text-left p-3 rounded-xl bg-[#111] hover:bg-[#1a1a1a] transition-colors border border-white/5 focus-within:border-primary/50 group flex flex-col cursor-pointer" onClick={() => logFood(food)}>
                     <div className="flex justify-between items-start mb-2">
                       <p className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{food.name}</p>
                       <span className="text-xs font-black text-primary shrink-0 bg-primary/10 px-2 py-0.5 rounded-sm">{Math.round(food.calories * servings)} KCAL</span>
                     </div>
                     <div className="flex gap-1.5 flex-wrap">
                       <span className="text-[9px] font-bold uppercase tracking-widest text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded">P {Math.round(food.protein * servings)}g</span>
                       <span className="text-[9px] font-bold uppercase tracking-widest text-info/80 bg-info/5 px-1.5 py-0.5 rounded">C {Math.round(food.carbs * servings)}g</span>
                       <span className="text-[9px] font-bold uppercase tracking-widest text-accent/80 bg-accent/5 px-1.5 py-0.5 rounded">F {Math.round(food.fat * servings)}g</span>
                     </div>
                   </div>
                 )) : search.length > 1 ? (
                   <div className="h-full flex flex-col justify-center items-center text-center opacity-50">
                      <Search className="w-8 h-8 mb-3" />
                      <p className="text-xs font-medium">No foods matched your search.</p>
                   </div>
                 ) : (
                   <div className="h-full flex flex-col justify-center items-center text-center opacity-30">
                      <div className="w-12 h-12 rounded-full border border-dashed flex items-center justify-center mb-3">
                         <div className="w-6 h-6 bg-current rounded-full blur-md opacity-20" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest">Type to discover items</p>
                   </div>
                 )}
               </div>
            </motion.div>
          )}

          {/* Right Column: Logged Timeline */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }} className={`rounded-[2rem] bg-[#111] border border-border/30 p-6 flex flex-col ${isToday ? 'h-[400px]' : 'h-auto min-h-[400px] col-span-1 lg:col-span-2'}`}>
              <div className="flex items-center justify-between mb-6 shrink-0">
                  <h2 className="text-xs uppercase tracking-widest font-bold text-white">
                    {isToday ? "Today's Consumption Timeline" : `Logs for ${new Date(selectedDate + "T12:00:00").toLocaleDateString()}`}
                  </h2>
                  <Badge variant="outline" className="text-[10px] tracking-widest border-white/20 bg-white/5">{meals.length} ENTRIES</Badge>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-hide relative">
                  {meals.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-30">
                       <span className="text-[4rem] mb-4 grayscale">🍽️</span>
                       <p className="text-xs font-bold uppercase tracking-widest">Clean Slate</p>
                    </div>
                  ) : (
                    meals.map((meal, idx) => (
                      <div key={meal.id} className="relative pl-6 before:absolute before:left-[11px] before:top-4 before:bottom-[-20px] before:w-0.5 before:bg-white/5 last:before:hidden group">
                           {/* Timeline Dot */}
                           <div className="absolute left-0 top-3.5 w-6 h-6 rounded-full bg-[#111] border-[3px] border-[#1a1a1a] flex items-center justify-center z-10 group-hover:border-primary/50 transition-colors">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/70" />
                           </div>

                           {/* Card */}
                           <div className="bg-[#1a1a1a] border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-colors relative overflow-hidden group/card mt-0">
                               
                               <div className="flex justify-between items-start mb-2">
                                  <h4 className="text-sm font-bold text-white leading-tight pr-8">{meal.recipe_title}</h4>
                                  <span className="text-xs font-black text-white bg-white/10 px-2 py-0.5 rounded-md absolute right-4 top-4">
                                     {Math.round(meal.calories * meal.servings)} Cal
                                  </span>
                               </div>

                               {meal.servings > 1 && <p className="text-[10px] text-muted-foreground font-medium mb-3">Multiplier: {meal.servings}x portion</p>}

                               <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 pt-3 border-t border-white/5">
                                 <NutrientStat label="Pro" val={meal.protein} srv={meal.servings} color="text-primary" />
                                 <NutrientStat label="Crb" val={meal.carbs} srv={meal.servings} color="text-info" />
                                 <NutrientStat label="Fat" val={meal.fat} srv={meal.servings} color="text-accent" />
                                 <NutrientStat label="Na" val={meal.sodium} srv={meal.servings} color="text-destructive" sufix="mg" />
                               </div>

                               {isToday && (
                                  <button onClick={() => deleteMeal.mutate(meal.id)} className="absolute right-0 bottom-0 top-0 w-12 bg-gradient-to-l from-destructive/90 to-transparent opacity-0 group-hover/card:opacity-100 flex items-center justify-end pr-4 transition-all hover:w-16">
                                     <Trash2 className="w-4 h-4 text-white" />
                                  </button>
                               )}
                           </div>
                      </div>
                    ))
                  )}
              </div>
          </motion.div>
      </div>

    </div>
  );
}

// ──────────────────────────────────────────────
// CUSTOM COMPONENTS
// ──────────────────────────────────────────────
function MacroPill({ label, val, color, unit }) {
    return (
        <div className={`flex flex-col items-center justify-center rounded-2xl border bg-black/40 ${color} p-3 backdrop-blur-md relative overflow-hidden`}>
            <span className="text-[10px] uppercase tracking-widest opacity-80 font-bold mb-1">{label}</span>
            <div className="flex items-baseline gap-0.5">
               <span className="text-xl font-black">{val}</span>
               <span className="text-xs opacity-60 font-bold">{unit}</span>
            </div>
        </div>
    )
}

function MicroBar({ label, val, limit, unit, isWarning }) {
    const percentage = Math.min((val / limit) * 100, 100) || 0;
    return (
        <div className="bg-[#111] border border-white/5 p-3 rounded-xl flex items-center justify-between gap-4">
             <div className="w-20 shrink-0">
                 <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</p>
                 <p className={`text-xs font-black mt-0.5 ${isWarning ? 'text-destructive' : 'text-primary'}`}>{Math.round(val)} <span className="text-[10px] opacity-70">/ {limit}{unit}</span></p>
             </div>
             <div className="flex-1 bg-black rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all ${isWarning ? 'bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-primary/50'}`} 
                  style={{ width: `${percentage}%` }}
                />
             </div>
        </div>
    )
}

function NutrientStat({ label, val, srv, color, sufix="g" }) {
    return (
        <div className="flex items-center gap-1">
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{label}</span>
            <span className={`text-[11px] font-black ${color}`}>{Math.round(Number(val||0)*srv)}{sufix}</span>
        </div>
    )
}
