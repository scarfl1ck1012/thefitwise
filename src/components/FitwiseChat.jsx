import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";

import { useProfile } from "@/hooks/useProfile";
import { useMeals } from "@/hooks/useMeals";
import { useWorkouts } from "@/hooks/useWorkouts";
import { getLocalDate } from "@/lib/utils";

function getQuickPrompts() {
  const hour = new Date().getHours();
  if (hour < 11) {
    return [
      "Suggest a high-protein breakfast",
      "How much water today?",
      "Morning stretch routine",
    ];
  } else if (hour < 16) {
    return ["Quick lunch ideas", "Afternoon energy boost", "Desk stretches"];
  } else {
    return [
      "Did I hit my macros today?",
      "Evening wind-down routine",
      "Low-calorie snacks",
    ];
  }
}

export default function FitwiseChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey! 👋 I'm your Fitwise coach. Ask me about nutrition, workouts, skincare, or health tips!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef(null);

  const { profile } = useProfile();
  const { totalCalories, totalProtein, totalCarbs, totalFat } = useMeals();
  const { checkins } = useWorkouts();

  // Scroll to bottom on new msg
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const quickPrompts = useMemo(() => getQuickPrompts(), []);

  const sendToLLM = async (userText) => {
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!geminiKey) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "**Oops!** API key is missing. Please add `VITE_GEMINI_API_KEY` to your `.env.local` file.",
        },
      ]);
      setIsLoading(false);
      return;
    }

    const today = getLocalDate();
    const workoutsToday = checkins.filter((c) => c.logged_at === today).length;

    const systemContext = `
The user's global state is as follows:
- Profile: ${profile ? JSON.stringify(profile) : "Not set"}
- Logged Calories Today: ${totalCalories}
- Logged Macros: Protein ${totalProtein}g, Carbs ${totalCarbs}g, Fat ${totalFat}g
- Workouts Today: ${workoutsToday > 0 ? "Yes" : "No"}

Context instructions:
If the user asks about their progress today or if they hit their macros/calories, use this exact exact data. Calculate their goal based on their profile data (like daily_calories) and give them an accurate, customized answer. Do not hallucinate data. If they haven't logged anything, tell them to log their meals/workouts.
`;

    const SYSTEM_PROMPT = `You are the "Fitwise Coach", a highly supportive, concise, science-based fitness and nutrition assistant.
Tone: Energetic, friendly, and highly encouraging, but absolutely no fluff. Keep answers short, scannable, and directly to the point. Give practical tips.
Formatting: Use Markdown. Bold key terms, use bullet points for lists.
Boundaries: You are not a doctor. If the user asks for medical advice regarding injuries, disease, or illness, politely decline and advise them to see a physician.
Actionable: Always try to reference the app's features (e.g., "You can log that in your Meals tab!" or "Try searching for that in the Gym Exercises database!").
${systemContext}
`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${geminiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            contents: newMessages.map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
            generationConfig: {
              temperature: 0.7,
            },
          }),
        },
      );

      if (!response.ok) {
        let errorMessage = "Failed to fetch from Gemini";
        try {
          const errData = await response.json();
          errorMessage = errData.error?.message || errorMessage;
        } catch (_) {}
        throw new Error(errorMessage);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      // Add a placeholder message for the streaming text
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setIsLoading(false);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));
              const delta =
                data.candidates?.[0]?.content?.parts?.[0]?.text || "";
              assistantResponse += delta;

              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = assistantResponse;
                return updated;
              });
            } catch (e) {
              console.error("Error parsing stream chunk", e);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I ran into an error connecting to my brain: **${e.message}**.`,
        },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 gradient-primary p-4 rounded-full shadow-elevated"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? (
          <X className="h-6 w-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[400px] bg-card border border-border rounded-2xl shadow-elevated overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="gradient-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-primary-foreground font-bold text-sm">
                    Fitwise Coach
                  </p>
                  <p className="text-primary-foreground/80 text-xs flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> AI Assistant
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="h-[360px] overflow-y-auto p-4 space-y-4 bg-background"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-secondary text-secondary-foreground rounded-br-sm"
                        : "border border-primary/20 bg-primary/5 text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-muted/50 w-full max-w-none break-words">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl border border-primary/20 bg-primary/5 text-muted-foreground w-16 flex justify-center items-center gap-1 rounded-bl-sm">
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Input & Quick Actions */}
            <div className="p-3 border-t border-border bg-card">
              {/* Quick Prompts */}
              {messages.length < 3 && !isLoading && (
                <div className="flex gap-2 overflow-x-auto pb-3 mb-1 -mx-2 px-2 scrollbar-hide">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendToLLM(prompt)}
                      className="whitespace-nowrap px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors border border-border shrink-0"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (input.trim() && !isLoading) sendToLLM(input.trim());
                }}
                className="flex gap-2 items-end"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your coach..."
                  className="flex-1 text-sm bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="shrink-0 rounded-full"
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
