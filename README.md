# FitWise

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animations-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)

A personal health and wellness tracking app with AI-powered meal analysis, workout logging, weight tracking, habit gamification, and skincare routines.

## Features

- **AI Meal Analysis** -- describe what you ate in plain text, get precise calorie and macro breakdowns via OpenAI
- **Workout Tracking** -- pre-built templates (Push, Pull, Legs, Core), quick check-ins, and a mini-calendar showing active days
- **Weight Charting** -- interactive line graphs with 7-day rolling averages to filter out daily noise
- **Gamification** -- XP, leveling, streaks, daily challenges, and unlockable badges to keep you consistent
- **Skincare Routines** -- morning and evening checklists with face exercises and skincare steps
- **Calorie Goals** -- auto-calculated using the Mifflin-St Jeor formula based on your profile

## Setup

```sh
git clone https://github.com/scarfl1ck1012/thefitwise.git
cd thefitwise
npm install
npm run dev
```

Create a `.env.local` with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

Set `OPENAI_API_KEY` in your Supabase project secrets for the meal analysis edge function.

## Deploy

Import the repo on [Vercel](https://vercel.com). It auto-detects Vite. Add the env vars above in the dashboard and deploy.

## Project Structure

```
src/
  components/   UI components (shadcn/ui + custom)
  hooks/        Business logic (auth, meals, workouts, stats)
  integrations/ Supabase client
  lib/          Utilities and static data
  pages/        Route views
supabase/
  functions/    Edge functions (AI meal analysis)
  migrations/   Database schema
```

## Contributing

Fork, branch, commit, push, open a PR.

## License

MIT
