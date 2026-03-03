const homeWorkouts = [
    {
        name: "Full Body Burn",
        type: "home",
        duration: "25 min",
        exercises: [
            { name: "Jumping Jacks", duration: "60s", description: "Full body warm-up cardio" },
            { name: "Push-ups", reps: "3x12", duration: "4 min", description: "Chest, shoulders, triceps" },
            { name: "Bodyweight Squats", reps: "3x15", duration: "4 min", description: "Quads, glutes, hamstrings" },
            { name: "Plank", duration: "3x45s", description: "Core stability" },
            { name: "Lunges", reps: "3x10 each", duration: "5 min", description: "Legs and balance" },
            { name: "Burpees", reps: "3x8", duration: "4 min", description: "Full body explosive" },
            { name: "Mountain Climbers", duration: "3x30s", description: "Core and cardio" },
        ],
    },
    {
        name: "Core Crusher",
        type: "home",
        duration: "20 min",
        exercises: [
            { name: "Bicycle Crunches", reps: "3x20", duration: "4 min", description: "Obliques and abs" },
            { name: "Leg Raises", reps: "3x12", duration: "3 min", description: "Lower abs" },
            { name: "Russian Twists", reps: "3x20", duration: "4 min", description: "Obliques" },
            { name: "Plank", duration: "3x60s", description: "Full core engagement" },
            { name: "Dead Bug", reps: "3x10 each", duration: "4 min", description: "Core stability" },
            { name: "Flutter Kicks", duration: "3x30s", description: "Lower abs and hip flexors" },
        ],
    },
    {
        name: "HIIT Cardio",
        type: "home",
        duration: "20 min",
        exercises: [
            { name: "High Knees", duration: "45s on/15s off x4", description: "Cardio burst" },
            { name: "Squat Jumps", reps: "3x10", duration: "3 min", description: "Explosive legs" },
            { name: "Burpees", reps: "3x8", duration: "4 min", description: "Full body" },
            { name: "Tuck Jumps", reps: "3x8", duration: "3 min", description: "Plyometric power" },
            { name: "Speed Skaters", duration: "3x30s", description: "Lateral cardio" },
        ],
    },
];
const gymWorkouts = [
    {
        name: "Push Day",
        type: "gym",
        duration: "45 min",
        exercises: [
            { name: "Bench Press", reps: "4x8", duration: "8 min", description: "Main chest compound" },
            { name: "Overhead Press", reps: "3x10", duration: "6 min", description: "Shoulders" },
            { name: "Incline Dumbbell Press", reps: "3x10", duration: "6 min", description: "Upper chest" },
            { name: "Lateral Raises", reps: "3x12", duration: "5 min", description: "Side delts" },
            { name: "Tricep Pushdowns", reps: "3x12", duration: "5 min", description: "Triceps isolation" },
            { name: "Dips", reps: "3x10", duration: "5 min", description: "Chest and triceps" },
        ],
    },
    {
        name: "Pull Day",
        type: "gym",
        duration: "45 min",
        exercises: [
            { name: "Deadlifts", reps: "4x6", duration: "10 min", description: "Full posterior chain" },
            { name: "Pull-ups", reps: "3x8", duration: "6 min", description: "Back and biceps" },
            { name: "Barbell Rows", reps: "3x10", duration: "6 min", description: "Back thickness" },
            { name: "Face Pulls", reps: "3x15", duration: "5 min", description: "Rear delts, posture" },
            { name: "Barbell Curls", reps: "3x10", duration: "5 min", description: "Biceps" },
            { name: "Hammer Curls", reps: "3x10", duration: "5 min", description: "Brachialis" },
        ],
    },
    {
        name: "Leg Day",
        type: "gym",
        duration: "50 min",
        exercises: [
            { name: "Barbell Squats", reps: "4x8", duration: "10 min", description: "King of leg exercises" },
            { name: "Romanian Deadlifts", reps: "3x10", duration: "7 min", description: "Hamstrings and glutes" },
            { name: "Leg Press", reps: "3x12", duration: "6 min", description: "Quad focus" },
            { name: "Walking Lunges", reps: "3x10 each", duration: "6 min", description: "Unilateral strength" },
            { name: "Leg Curls", reps: "3x12", duration: "5 min", description: "Hamstring isolation" },
            { name: "Calf Raises", reps: "4x15", duration: "5 min", description: "Calf development" },
        ],
    },
];
export function getWorkoutPlans(type) {
    return type === "home" ? homeWorkouts : gymWorkouts;
}
export const faceExercises = [
    { name: "Jawline Clenches", duration: "3x15 reps", description: "Clench jaw tightly, hold 5s, release. Defines jawline." },
    { name: "Cheek Puffs", duration: "3x10 reps", description: "Puff air into each cheek alternately. Tones cheek muscles." },
    { name: "Fish Face", duration: "3x15s hold", description: "Suck cheeks in, hold, then smile. Tones cheeks and lips." },
    { name: "Neck Tilts", duration: "3x10 each side", description: "Tilt head side to side slowly. Reduces neck tension." },
    { name: "Chin Lifts", duration: "3x15 reps", description: "Look up, push jaw forward, hold 3s. Reduces double chin." },
    { name: "Eye Squeeze", duration: "3x15 reps", description: "Squeeze eyes shut tightly, hold 3s, release. Reduces crow's feet." },
    { name: "Forehead Smoother", duration: "3x10 reps", description: "Place fingers on forehead, raise brows against resistance." },
    { name: "Neck Rotations", duration: "2x5 each direction", description: "Slowly rotate head in circles. Relieves tension." },
    { name: "Tongue Press", duration: "3x10s hold", description: "Press tongue to roof of mouth. Defines jawline underneath." },
    { name: "Smile & Hold", duration: "3x10s", description: "Wide smile, hold 10 seconds. Lifts cheeks naturally." },
];
export const skincareRoutine = [
    { step: 1, name: "Cleanser", description: "Gentle face wash to remove dirt and oil", when: "both", tip: "Use lukewarm water, not hot" },
    { step: 2, name: "Toner", description: "Balance skin pH and prep for products", when: "both", tip: "Pat gently, don't rub" },
    { step: 3, name: "Vitamin C Serum", description: "Brightens skin and fights free radicals", when: "morning", tip: "Apply before moisturizer" },
    { step: 4, name: "Retinol / Retinoid", description: "Anti-aging, reduces acne and dark spots", when: "evening", tip: "Start 2x/week, build tolerance" },
    { step: 5, name: "Moisturizer", description: "Hydrate and lock in previous products", when: "both", tip: "Apply while skin is still slightly damp" },
    { step: 6, name: "Sunscreen SPF 30+", description: "Protect from UV damage and aging", when: "morning", tip: "Reapply every 2 hours if outdoors" },
    { step: 7, name: "Eye Cream", description: "Hydrate under-eye area, reduce dark circles", when: "both", tip: "Use ring finger, lightest pressure" },
    { step: 8, name: "Lip Balm with SPF", description: "Protect and moisturize lips", when: "morning", tip: "Reapply throughout the day" },
];
