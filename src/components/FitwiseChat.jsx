import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const RULES = [
    {
        patterns: [/hi|hello|hey|morning|evening/i],
        response: "Hey there! 💪 I'm your Fitwise coach. Ask me about nutrition, workouts, skincare, or anything health-related!",
    },
    {
        patterns: [/protein/i],
        response: "Great question! Aim for 1.6-2.2g of protein per kg of body weight daily. Best sources: chicken breast, eggs, Greek yogurt, fish, lentils, whey protein. Spread intake across meals for optimal absorption.",
    },
    {
        patterns: [/lose weight|weight loss|fat loss|cut/i],
        response: "For sustainable weight loss: 1) Create a 300-500 calorie deficit 2) Eat high-protein foods to preserve muscle 3) Do resistance training 3x/week 4) Walk 8,000+ steps daily 5) Sleep 7-9 hours. Avoid crash diets!",
    },
    {
        patterns: [/gain|bulk|muscle|mass/i],
        response: "To build muscle: 1) Eat 300-500 cal surplus 2) Hit 1.8-2.2g protein/kg 3) Progressive overload in training 4) Train each muscle 2x/week 5) Sleep 8+ hours for recovery. Consistency > intensity!",
    },
    {
        patterns: [/calorie|calories|tdee|bmr/i],
        response: "Your calorie needs depend on age, gender, height, weight & activity. Go to Settings to fill in your profile — I'll calculate your TDEE automatically using the Mifflin-St Jeor equation!",
    },
    {
        patterns: [/workout|exercise|train/i],
        response: "Check the Workouts tab for structured plans! For beginners: 3 full-body sessions/week. Intermediate: Push/Pull/Legs split. Always warm up, focus on form, and progressively increase weight or reps.",
    },
    {
        patterns: [/skin|skincare|acne|face|glow/i],
        response: "Check the Face & Skincare tab for routines! Key tips: 1) Cleanse twice daily 2) Always wear SPF 30+ 3) Retinol at night for anti-aging 4) Stay hydrated 5) Change pillowcase weekly. Consistency matters more than expensive products!",
    },
    {
        patterns: [/water|hydrat/i],
        response: "Hydration is crucial! Aim for 2.5-3.5L water daily. More if you're active. Signs of dehydration: dark urine, fatigue, headaches. Tip: Start your day with a glass of water before coffee!",
    },
    {
        patterns: [/sleep|rest|recovery/i],
        response: "Sleep is when your body repairs and grows! Aim for 7-9 hours. Tips: 1) No screens 30min before bed 2) Keep room cool & dark 3) Same sleep schedule daily 4) No caffeine after 2pm 5) Magnesium before bed can help.",
    },
    {
        patterns: [/stretch|flexibility|mobility/i],
        response: "Stretching improves recovery and prevents injury. Dynamic stretches before workouts, static after. Hold each stretch 20-30 seconds. Focus on hips, hamstrings, shoulders, and thoracic spine.",
    },
    {
        patterns: [/creatine|supplement/i],
        response: "Evidence-backed supplements: 1) Creatine monohydrate (5g/day) - proven muscle/strength gains 2) Whey protein - convenient protein source 3) Vitamin D - if deficient 4) Omega-3 - anti-inflammatory. Skip fat burners and test boosters.",
    },
    {
        patterns: [/meal prep|prep/i],
        response: "Meal prep saves time! 1) Pick 3-4 proteins, 2-3 carb sources, lots of veggies 2) Cook in bulk on Sunday 3) Portion into containers 4) Store 3 days in fridge, rest in freezer. Simple = sustainable!",
    },
    {
        patterns: [/thank|thanks/i],
        response: "You're welcome! Keep pushing toward your goals. Remember, consistency beats perfection. 💪 I'm always here to help!",
    },
];
function getResponse(input) {
    const lower = input.toLowerCase();
    for (const rule of RULES) {
        if (rule.patterns.some((p) => p.test(lower))) {
            return rule.response;
        }
    }
    return "Great question! I'm your rule-based coach — I can help with protein intake, weight loss, muscle gain, workouts, skincare, sleep, supplements, and meal prep. Try asking about any of those topics! 🏋️";
}
export default function FitwiseChat() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hey! 👋 I'm your Fitwise coach. Ask me about nutrition, workouts, skincare, or health tips!" },
    ]);
    const [input, setInput] = useState("");
    const scrollRef = useRef(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);
    const send = () => {
        if (!input.trim())
            return;
        const userMsg = { role: "user", content: input };
        const response = getResponse(input);
        setMessages((prev) => [...prev, userMsg, { role: "assistant", content: response }]);
        setInput("");
    };
    return (<>
      {/* FAB */}
      <motion.button onClick={() => setOpen(!open)} className="fixed bottom-6 right-6 z-50 gradient-primary p-4 rounded-full shadow-elevated" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        {open ? <X className="h-5 w-5 text-primary-foreground"/> : <MessageCircle className="h-5 w-5 text-primary-foreground"/>}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (<motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 glass rounded-2xl shadow-elevated overflow-hidden">
            {/* Header */}
            <div className="gradient-primary p-4">
              <p className="text-primary-foreground font-bold text-sm">Fitwise Coach</p>
              <p className="text-primary-foreground/80 text-xs">Ask me anything about health & fitness</p>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="h-72 overflow-y-auto p-3 space-y-3 bg-background">
              {messages.map((msg, i) => (<div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${msg.role === "user"
                    ? "gradient-primary text-primary-foreground"
                    : "bg-muted text-foreground"}`}>
                    {msg.content}
                  </div>
                </div>))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-card">
              <form onSubmit={(e) => {
                e.preventDefault();
                send();
            }} className="flex gap-2">
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your coach..." className="flex-1 text-sm"/>
                <Button type="submit" size="icon" className="shrink-0">
                  <Send className="h-4 w-4"/>
                </Button>
              </form>
            </div>
          </motion.div>)}
      </AnimatePresence>
    </>);
}
