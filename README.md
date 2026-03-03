<div align="center">

# FitWise

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animations-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**A full-stack health and wellness tracker with AI-powered nutrition analysis, gamified habit building, and interactive data visualization.**

Track meals, log workouts, chart your weight, build streaks, unlock badges, and follow skincare routines -- all from a single, polished dashboard.

</div>

---

## What It Does

| Module              | Description                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| **Dashboard**       | Personalized daily overview with calorie progress, streak counter, XP bar, and daily challenges        |
| **Meals**           | Log food manually or describe it in plain text -- AI breaks it into calories, protein, carbs, and fat  |
| **Workouts**        | Pre-built workout templates (Push/Pull/Legs/Core), quick check-ins, and a mini-calendar of active days |
| **Weight**          | Log daily weight with interactive trend charts and a 7-day rolling average line                        |
| **Habits & XP**     | Earn XP for every action, level up, maintain streaks, and unlock badges like _Consistency King_        |
| **Face & Skincare** | Morning and evening skincare checklists, plus targeted face exercises with duration tracking           |
| **Settings**        | Profile setup with auto-calculated daily calorie goals using the Mifflin-St Jeor formula               |

---

## How the AI Meal Analysis Works

1. You type something like: _"I had 2 boiled eggs, a toast with butter, and black coffee"_
2. The description is sent to a Supabase Edge Function
3. The Edge Function calls OpenAI (`gpt-4o-mini`) with a nutritionist prompt
4. You get back a per-item breakdown: calories, protein, carbs, fat, sodium, potassium
5. Items are auto-logged to your daily tracker

No food database lookups. No scrolling through lists. Just describe what you ate.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- A [Supabase](https://supabase.com/) project (free tier works)
- An [OpenAI API key](https://platform.openai.com/) (for meal analysis)

### 1. Clone the Repository

```sh
git clone https://github.com/scarfl1ck1012/thefitwise.git
cd thefitwise
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

Then set your OpenAI key in **Supabase Dashboard > Project Settings > Edge Functions > Secrets**:

```
OPENAI_API_KEY=sk-your-openai-key
```

### 4. Run the Database Migrations

Apply the SQL migrations in `supabase/migrations/` to your Supabase project through the Supabase Dashboard SQL editor or the Supabase CLI.

### 5. Start the Dev Server

```sh
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser. Create an account and start tracking.

---

## Deploying to Vercel

| Step | Action                                                                               |
| ---: | ------------------------------------------------------------------------------------ |
|    1 | Push this repo to your GitHub account                                                |
|    2 | Go to [vercel.com](https://vercel.com) and import the repository                     |
|    3 | Vercel auto-detects Vite -- no build config needed                                   |
|    4 | Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Environment Variables |
|    5 | Click **Deploy**                                                                     |

Your app will be live in under a minute.

---

## Project Structure

```
src/
  components/
    ui/             shadcn/ui primitives (button, card, dialog, tabs, etc.)
    AppLayout.jsx   Main dashboard shell with sidebar and bottom nav
    FitwiseChat.jsx AI chat widget
    NavLink.jsx     Navigation link component
  hooks/
    useAuth.js      Authentication state
    useMeals.js     Meal CRUD and calorie calculations
    useWorkouts.js  Workout check-ins and templates
    useUserStats.js XP, leveling, streaks, and badges
    useWeightLogs.js Weight logging and trend data
    useWaterLogs.js  Water intake tracking
    useCaffeineLogs.js Caffeine intake tracking
    useProfile.js   User profile and calorie goal logic
  integrations/
    supabase/       Supabase client singleton and type constants
  lib/
    challenges.js   Daily challenge generator
    foodDatabase.js Static food reference data
    workoutData.js  Exercise templates and skincare routines
    utils.js        Tailwind class merge utility
  pages/
    AuthPage.jsx      Login / Signup
    DashboardPage.jsx Daily overview
    MealsPage.jsx     Meal logging + AI analysis
    WorkoutsPage.jsx  Workout tracking
    WeightPage.jsx    Weight charting
    HabitsPage.jsx    XP, badges, streaks
    FaceCarePage.jsx  Skincare + face exercises
    SettingsPage.jsx  Profile setup
    NotFound.jsx      404 page

supabase/
  functions/
    analyze-meal/   Edge function: AI-powered meal analysis via OpenAI
  migrations/       SQL schema for all database tables
```

---

## Feature Checklist

- [x] Email/password authentication via Supabase Auth
- [x] AI meal analysis with natural language input
- [x] Manual meal logging with macro tracking
- [x] Workout templates and quick check-ins
- [x] Weight tracking with trend visualization
- [x] Water and caffeine intake logging
- [x] XP and leveling system
- [x] Streak tracking with longest streak records
- [x] Unlockable achievement badges
- [x] Daily challenges with XP rewards
- [x] Auto-calculated calorie goals (Mifflin-St Jeor)
- [x] Morning and evening skincare routines
- [x] Face exercise library with duration tracking
- [x] Responsive design (mobile bottom nav, desktop sidebar)
- [x] Smooth page transitions and micro-animations via Framer Motion

---

## Available Scripts

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start dev server on port 8080    |
| `npm run build`   | Production build to `dist/`      |
| `npm run preview` | Preview production build locally |
| `npm run lint`    | Run ESLint                       |
| `npm run test`    | Run tests via Vitest             |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT
