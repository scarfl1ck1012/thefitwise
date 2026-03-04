// Expanded challenge pool with categories and difficulty tiers
const challengePool = [
  // Nutrition
  {
    title: "Log all meals",
    description: "Track every meal you eat today",
    xp: 40,
    category: "nutrition",
    icon: "📝",
    goals: ["lose", "maintain", "gain", "bulk"],
  },
  {
    title: "No sugar today",
    description: "Avoid added sugars in all meals",
    xp: 50,
    category: "nutrition",
    icon: "🍬",
    goals: ["lose", "maintain"],
  },
  {
    title: "Eat a salad",
    description: "Have a nutritious salad today",
    xp: 25,
    category: "nutrition",
    icon: "🥗",
    goals: ["lose", "maintain"],
  },
  {
    title: "Protein goal",
    description: "Hit your daily protein target",
    xp: 45,
    category: "nutrition",
    icon: "🥩",
    goals: ["gain", "bulk", "maintain"],
  },
  {
    title: "Eat fruit",
    description: "Have at least 2 servings of fruit",
    xp: 20,
    category: "nutrition",
    icon: "🍎",
    goals: ["lose", "maintain", "gain", "bulk"],
  },
  {
    title: "Under calorie goal",
    description: "Stay within your daily calorie limit",
    xp: 50,
    category: "nutrition",
    icon: "📊",
    goals: ["lose"],
  },
  {
    title: "High protein breakfast",
    description: "Start the day with 30g+ protein",
    xp: 35,
    category: "nutrition",
    icon: "🍳",
    goals: ["gain", "bulk"],
  },
  {
    title: "Eat vegetables",
    description: "Include veggies in at least 2 meals",
    xp: 25,
    category: "nutrition",
    icon: "🥦",
    goals: ["lose", "maintain", "gain", "bulk"],
  },
  {
    title: "No junk food",
    description: "Skip all processed snacks today",
    xp: 40,
    category: "nutrition",
    icon: "🚫",
    goals: ["lose"],
  },
  {
    title: "Calorie surplus",
    description: "Eat above your maintenance calories",
    xp: 35,
    category: "nutrition",
    icon: "📈",
    goals: ["gain", "bulk"],
  },

  // Workout
  {
    title: "30 push-ups",
    description: "Complete 30 push-ups (any sets)",
    xp: 35,
    category: "workout",
    icon: "💪",
    goals: ["gain", "bulk", "maintain"],
    activity: ["moderate", "active", "very_active"],
  },
  {
    title: "50 squats",
    description: "Complete 50 bodyweight squats",
    xp: 40,
    category: "workout",
    icon: "🦵",
    goals: ["gain", "bulk", "maintain"],
    activity: ["moderate", "active", "very_active"],
  },
  {
    title: "Plank challenge",
    description: "Hold plank for 2 minutes total",
    xp: 35,
    category: "workout",
    icon: "🏋️",
    goals: ["gain", "bulk", "maintain"],
    activity: ["moderate", "active", "very_active"],
  },
  {
    title: "10-minute walk",
    description: "Take a brisk walk outside",
    xp: 25,
    category: "workout",
    icon: "🚶",
    goals: ["lose", "maintain", "gain", "bulk"],
    activity: ["sedentary", "light", "moderate"],
  },
  {
    title: "Stretch routine",
    description: "10 minutes of full body stretching",
    xp: 25,
    category: "workout",
    icon: "🤸",
    goals: ["lose", "maintain", "gain", "bulk"],
  },
  {
    title: "20-minute cardio",
    description: "Run, cycle, or swim for 20 minutes",
    xp: 45,
    category: "workout",
    icon: "🏃",
    goals: ["lose", "maintain"],
    activity: ["moderate", "active", "very_active"],
  },
  {
    title: "100 jumping jacks",
    description: "Get your heart rate up",
    xp: 30,
    category: "workout",
    icon: "⭐",
    goals: ["lose", "maintain"],
  },
  {
    title: "Heavy lifting session",
    description: "Complete a full strength workout",
    xp: 50,
    category: "workout",
    icon: "🏋️",
    goals: ["gain", "bulk"],
    activity: ["active", "very_active"],
  },

  // Wellness
  {
    title: "Drink 8 glasses of water",
    description: "Stay hydrated throughout the day",
    xp: 30,
    category: "wellness",
    icon: "💧",
    goals: ["lose", "maintain", "gain", "bulk"],
  },
  {
    title: "5-minute meditation",
    description: "Clear your mind for 5 minutes",
    xp: 30,
    category: "wellness",
    icon: "🧘",
    goals: ["lose", "maintain", "gain", "bulk"],
  },
  {
    title: "Sleep 8 hours",
    description: "Get a full night of rest",
    xp: 40,
    category: "wellness",
    icon: "😴",
    goals: ["lose", "maintain", "gain", "bulk"],
  },
  {
    title: "No phone before bed",
    description: "Put phone away 30 min before sleep",
    xp: 35,
    category: "wellness",
    icon: "📵",
    goals: ["lose", "maintain", "gain", "bulk"],
  },
  {
    title: "Take a cold shower",
    description: "End your shower with 30s of cold water",
    xp: 40,
    category: "wellness",
    icon: "🚿",
    goals: ["lose", "maintain", "gain", "bulk"],
  },
  {
    title: "Journal 3 things",
    description: "Write down 3 things you are grateful for",
    xp: 25,
    category: "wellness",
    icon: "📓",
    goals: ["lose", "maintain", "gain", "bulk"],
  },

  // Skincare
  {
    title: "Apply sunscreen",
    description: "Protect your skin from UV today",
    xp: 20,
    category: "skincare",
    icon: "☀️",
    goals: ["lose", "maintain", "gain", "bulk"],
  },
  {
    title: "Face exercises",
    description: "Do your face exercise routine",
    xp: 30,
    category: "skincare",
    icon: "😊",
    goals: ["lose", "maintain", "gain", "bulk"],
  },
  {
    title: "Cold water splash",
    description: "Splash cold water on face morning & night",
    xp: 20,
    category: "skincare",
    icon: "❄️",
    goals: ["lose", "maintain", "gain", "bulk"],
  },
  {
    title: "Evening skincare routine",
    description: "Complete your full PM skincare steps",
    xp: 30,
    category: "skincare",
    icon: "🌙",
    goals: ["lose", "maintain", "gain", "bulk"],
  },
  {
    title: "Moisturize",
    description: "Apply moisturizer after washing your face",
    xp: 15,
    category: "skincare",
    icon: "✨",
    goals: ["lose", "maintain", "gain", "bulk"],
  },
];

// Simple seeded hash for deterministic randomization
function seededHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

export function getDailyChallenges(date, userProfile) {
  const userId = userProfile?.userId || "default";
  const userGoal = userProfile?.goal || "maintain";
  const userActivity = userProfile?.activity_level || "moderate";
  const seed = seededHash(date + userId);

  // Filter challenges relevant to this user's goal
  let filtered = challengePool.filter((c) => {
    // Must match user's goal
    if (!c.goals.includes(userGoal)) return false;
    // If challenge has activity requirements, user must match one
    if (c.activity && !c.activity.includes(userActivity)) return false;
    return true;
  });

  // Fallback if filtering is too aggressive
  if (filtered.length < 5) {
    filtered = challengePool;
  }

  // Seeded shuffle using the combined date + userId seed
  const shuffled = [...filtered].sort((a, b) => {
    const ha = seededHash(seed + a.title) % 1000;
    const hb = seededHash(seed + b.title) % 1000;
    return ha - hb;
  });

  // Pick 3 challenges, try to get variety across categories
  const picked = [];
  const usedCategories = new Set();

  for (const ch of shuffled) {
    if (picked.length >= 3) break;
    if (picked.length < 3 && !usedCategories.has(ch.category)) {
      picked.push(ch);
      usedCategories.add(ch.category);
    }
  }

  // Fill remaining slots if we couldn't get 3 unique categories
  for (const ch of shuffled) {
    if (picked.length >= 3) break;
    if (!picked.includes(ch)) {
      picked.push(ch);
    }
  }

  // Scale XP based on activity level
  const xpMultiplier = {
    sedentary: 0.8,
    light: 0.9,
    moderate: 1.0,
    active: 1.1,
    very_active: 1.2,
  };
  const multiplier = xpMultiplier[userActivity] || 1.0;

  return picked.map((c, i) => ({
    ...c,
    xp: Math.round(c.xp * multiplier),
    id: `${date}-${userId.slice(0, 8)}-${i}`,
  }));
}
