const challengePool = [
    { title: "Drink 8 glasses of water", description: "Stay hydrated throughout the day", xp: 30, category: "wellness", icon: "💧" },
    { title: "No sugar today", description: "Avoid added sugars in all meals", xp: 50, category: "nutrition", icon: "🍬" },
    { title: "10-minute walk", description: "Take a brisk walk outside", xp: 25, category: "workout", icon: "🚶" },
    { title: "Log all meals", description: "Track every meal you eat today", xp: 40, category: "nutrition", icon: "📝" },
    { title: "30 push-ups", description: "Complete 30 push-ups (any sets)", xp: 35, category: "workout", icon: "💪" },
    { title: "5-minute meditation", description: "Clear your mind for 5 minutes", xp: 30, category: "wellness", icon: "🧘" },
    { title: "Eat a salad", description: "Have a nutritious salad today", xp: 25, category: "nutrition", icon: "🥗" },
    { title: "50 squats", description: "Complete 50 bodyweight squats", xp: 40, category: "workout", icon: "🦵" },
    { title: "Apply sunscreen", description: "Protect your skin from UV today", xp: 20, category: "skincare", icon: "☀️" },
    { title: "Face exercises", description: "Do your face exercise routine", xp: 30, category: "skincare", icon: "😊" },
    { title: "Sleep 8 hours", description: "Get a full night of rest", xp: 40, category: "wellness", icon: "😴" },
    { title: "Protein goal", description: "Hit your daily protein target", xp: 45, category: "nutrition", icon: "🥩" },
    { title: "Stretch routine", description: "10 minutes of full body stretching", xp: 25, category: "workout", icon: "🤸" },
    { title: "No phone before bed", description: "Put phone away 30 min before sleep", xp: 35, category: "wellness", icon: "📵" },
    { title: "Cold water splash", description: "Splash cold water on face morning & night", xp: 20, category: "skincare", icon: "❄️" },
    { title: "Evening skincare routine", description: "Complete your full PM skincare steps", xp: 30, category: "skincare", icon: "🌙" },
    { title: "Plank challenge", description: "Hold plank for 2 minutes total", xp: 35, category: "workout", icon: "🏋️" },
    { title: "Eat fruit", description: "Have at least 2 servings of fruit", xp: 20, category: "nutrition", icon: "🍎" },
];
export function getDailyChallenges(date) {
    // Deterministic but varying based on date
    const seed = date.split("-").reduce((a, b) => a + parseInt(b), 0);
    const shuffled = [...challengePool].sort((a, b) => {
        const ha = (seed * 31 + a.title.length) % 100;
        const hb = (seed * 31 + b.title.length) % 100;
        return ha - hb;
    });
    return shuffled.slice(0, 3).map((c, i) => ({ ...c, id: `${date}-${i}` }));
}
