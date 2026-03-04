// Gym exercise database for search + workout builder

export const gymExercises = [
  // Chest
  {
    id: 1,
    name: "Bench Press",
    muscle: "Chest",
    equipment: "Barbell",
    type: "gym",
  },
  {
    id: 2,
    name: "Incline Dumbbell Press",
    muscle: "Chest",
    equipment: "Dumbbell",
    type: "gym",
  },
  {
    id: 3,
    name: "Cable Flyes",
    muscle: "Chest",
    equipment: "Cable",
    type: "gym",
  },
  {
    id: 4,
    name: "Push-Ups",
    muscle: "Chest",
    equipment: "Bodyweight",
    type: "home",
  },
  {
    id: 5,
    name: "Dumbbell Flyes",
    muscle: "Chest",
    equipment: "Dumbbell",
    type: "gym",
  },
  {
    id: 6,
    name: "Decline Press",
    muscle: "Chest",
    equipment: "Barbell",
    type: "gym",
  },
  // Back
  {
    id: 7,
    name: "Pull-Ups",
    muscle: "Back",
    equipment: "Bodyweight",
    type: "home",
  },
  {
    id: 8,
    name: "Barbell Rows",
    muscle: "Back",
    equipment: "Barbell",
    type: "gym",
  },
  {
    id: 9,
    name: "Lat Pulldowns",
    muscle: "Back",
    equipment: "Cable",
    type: "gym",
  },
  {
    id: 10,
    name: "Seated Cable Row",
    muscle: "Back",
    equipment: "Cable",
    type: "gym",
  },
  {
    id: 11,
    name: "Dumbbell Rows",
    muscle: "Back",
    equipment: "Dumbbell",
    type: "gym",
  },
  {
    id: 12,
    name: "Inverted Rows",
    muscle: "Back",
    equipment: "Bodyweight",
    type: "home",
  },
  // Shoulders
  {
    id: 13,
    name: "Overhead Press",
    muscle: "Shoulders",
    equipment: "Barbell",
    type: "gym",
  },
  {
    id: 14,
    name: "Lateral Raises",
    muscle: "Shoulders",
    equipment: "Dumbbell",
    type: "gym",
  },
  {
    id: 15,
    name: "Face Pulls",
    muscle: "Shoulders",
    equipment: "Cable",
    type: "gym",
  },
  {
    id: 16,
    name: "Pike Push-Ups",
    muscle: "Shoulders",
    equipment: "Bodyweight",
    type: "home",
  },
  {
    id: 17,
    name: "Arnold Press",
    muscle: "Shoulders",
    equipment: "Dumbbell",
    type: "gym",
  },
  // Legs
  {
    id: 18,
    name: "Barbell Squats",
    muscle: "Legs",
    equipment: "Barbell",
    type: "gym",
  },
  {
    id: 19,
    name: "Romanian Deadlift",
    muscle: "Legs",
    equipment: "Barbell",
    type: "gym",
  },
  {
    id: 20,
    name: "Leg Press",
    muscle: "Legs",
    equipment: "Machine",
    type: "gym",
  },
  {
    id: 21,
    name: "Lunges",
    muscle: "Legs",
    equipment: "Bodyweight",
    type: "home",
  },
  {
    id: 22,
    name: "Leg Curls",
    muscle: "Legs",
    equipment: "Machine",
    type: "gym",
  },
  {
    id: 23,
    name: "Calf Raises",
    muscle: "Legs",
    equipment: "Machine",
    type: "gym",
  },
  {
    id: 24,
    name: "Bodyweight Squats",
    muscle: "Legs",
    equipment: "Bodyweight",
    type: "home",
  },
  {
    id: 25,
    name: "Bulgarian Split Squats",
    muscle: "Legs",
    equipment: "Dumbbell",
    type: "home",
  },
  // Arms
  {
    id: 26,
    name: "Barbell Curls",
    muscle: "Arms",
    equipment: "Barbell",
    type: "gym",
  },
  {
    id: 27,
    name: "Tricep Pushdowns",
    muscle: "Arms",
    equipment: "Cable",
    type: "gym",
  },
  {
    id: 28,
    name: "Hammer Curls",
    muscle: "Arms",
    equipment: "Dumbbell",
    type: "gym",
  },
  {
    id: 29,
    name: "Diamond Push-Ups",
    muscle: "Arms",
    equipment: "Bodyweight",
    type: "home",
  },
  {
    id: 30,
    name: "Skull Crushers",
    muscle: "Arms",
    equipment: "Barbell",
    type: "gym",
  },
  {
    id: 31,
    name: "Chin-Ups",
    muscle: "Arms",
    equipment: "Bodyweight",
    type: "home",
  },
  // Core
  {
    id: 32,
    name: "Plank",
    muscle: "Core",
    equipment: "Bodyweight",
    type: "home",
  },
  {
    id: 33,
    name: "Cable Crunches",
    muscle: "Core",
    equipment: "Cable",
    type: "gym",
  },
  {
    id: 34,
    name: "Hanging Leg Raises",
    muscle: "Core",
    equipment: "Bodyweight",
    type: "gym",
  },
  {
    id: 35,
    name: "Mountain Climbers",
    muscle: "Core",
    equipment: "Bodyweight",
    type: "home",
  },
  {
    id: 36,
    name: "Russian Twists",
    muscle: "Core",
    equipment: "Bodyweight",
    type: "home",
  },
  {
    id: 37,
    name: "Dead Bugs",
    muscle: "Core",
    equipment: "Bodyweight",
    type: "home",
  },
  // Full Body
  {
    id: 38,
    name: "Deadlift",
    muscle: "Full Body",
    equipment: "Barbell",
    type: "gym",
  },
  {
    id: 39,
    name: "Burpees",
    muscle: "Full Body",
    equipment: "Bodyweight",
    type: "home",
  },
  {
    id: 40,
    name: "Clean & Press",
    muscle: "Full Body",
    equipment: "Barbell",
    type: "gym",
  },
  {
    id: 41,
    name: "Kettlebell Swings",
    muscle: "Full Body",
    equipment: "Kettlebell",
    type: "home",
  },
];

// Cardio types with MET values
export const cardioTypes = [
  { id: "treadmill", label: "Treadmill", icon: "\ud83c\udfc3", met: 8.0 },
  { id: "cycling", label: "Cycling", icon: "\ud83d\udeb4", met: 7.5 },
  { id: "stairmaster", label: "Stairmaster", icon: "\ud83e\uddd7", met: 9.0 },
  { id: "rowing", label: "Rowing", icon: "\ud83d\udea3", met: 7.0 },
  { id: "elliptical", label: "Elliptical", icon: "\ud83d\udeb6", met: 5.0 },
  { id: "swimming", label: "Swimming", icon: "\ud83c\udfca", met: 8.0 },
  { id: "jogging", label: "Jogging", icon: "\ud83e\uddcd", met: 7.0 },
  { id: "walking", label: "Walking", icon: "\ud83d\udeb6", met: 3.5 },
];

// Estimate calories: MET * weight_kg * duration_hours
export function estimateCalories(met, weightKg, durationMinutes) {
  const weight = weightKg || 70;
  return Math.round(met * weight * (durationMinutes / 60));
}

// AI workout plan templates
export const aiWorkoutTemplates = {
  strength: {
    monday: [
      { name: "Bench Press", sets: 4, reps: 8 },
      { name: "Incline Dumbbell Press", sets: 3, reps: 10 },
      { name: "Cable Flyes", sets: 3, reps: 12 },
      { name: "Tricep Pushdowns", sets: 3, reps: 12 },
    ],
    tuesday: [
      { name: "Barbell Squats", sets: 4, reps: 8 },
      { name: "Romanian Deadlift", sets: 3, reps: 10 },
      { name: "Leg Press", sets: 3, reps: 12 },
      { name: "Calf Raises", sets: 4, reps: 15 },
    ],
    wednesday: [],
    thursday: [
      { name: "Pull-Ups", sets: 4, reps: 8 },
      { name: "Barbell Rows", sets: 4, reps: 8 },
      { name: "Face Pulls", sets: 3, reps: 15 },
      { name: "Barbell Curls", sets: 3, reps: 12 },
    ],
    friday: [
      { name: "Overhead Press", sets: 4, reps: 8 },
      { name: "Lateral Raises", sets: 3, reps: 12 },
      { name: "Arnold Press", sets: 3, reps: 10 },
      { name: "Plank", sets: 3, reps: 60 },
    ],
    saturday: [
      { name: "Deadlift", sets: 4, reps: 5 },
      { name: "Bulgarian Split Squats", sets: 3, reps: 10 },
      { name: "Hanging Leg Raises", sets: 3, reps: 12 },
      { name: "Russian Twists", sets: 3, reps: 20 },
    ],
    sunday: [],
  },
  lose: {
    monday: [
      { name: "Burpees", sets: 4, reps: 15 },
      { name: "Mountain Climbers", sets: 3, reps: 30 },
      { name: "Bodyweight Squats", sets: 3, reps: 20 },
      { name: "Push-Ups", sets: 3, reps: 15 },
    ],
    tuesday: [],
    wednesday: [
      { name: "Lunges", sets: 3, reps: 12 },
      { name: "Plank", sets: 3, reps: 45 },
      { name: "Diamond Push-Ups", sets: 3, reps: 12 },
      { name: "Kettlebell Swings", sets: 4, reps: 15 },
    ],
    thursday: [],
    friday: [
      { name: "Pull-Ups", sets: 3, reps: 8 },
      { name: "Barbell Squats", sets: 4, reps: 10 },
      { name: "Dead Bugs", sets: 3, reps: 12 },
      { name: "Russian Twists", sets: 3, reps: 20 },
    ],
    saturday: [
      { name: "Burpees", sets: 3, reps: 12 },
      { name: "Mountain Climbers", sets: 3, reps: 30 },
      { name: "Bodyweight Squats", sets: 4, reps: 20 },
    ],
    sunday: [],
  },
};

export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const DAY_LABELS = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};
