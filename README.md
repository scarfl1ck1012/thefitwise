<div align="center">

# FitWise

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animations-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)

**A full-stack health and wellness tracker with AI-powered nutrition analysis, gamified habit building, and interactive data visualization.**

### [Try it live -- thefitwise.vercel.app](https://thefitwise.vercel.app/)

</div>

---

## Overview

FitWise is a personal health companion that brings together meal tracking, workout logging, weight charting, skincare routines, and a gamified habit system into one unified dashboard. It uses a Supabase backend for auth and data, and an OpenAI-powered edge function for real-time meal analysis from natural language.

---

## Features

| Module                    | What it does                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **AI Meal Analysis**      | Describe what you ate in plain text -- AI returns a per-item breakdown of calories, protein, carbs, fat, sodium, and potassium |
| **Dashboard**             | Personalized daily overview with calorie progress bar, workout count, streak counter, XP bar, and daily challenges             |
| **Workouts**              | Pre-built templates (Push, Pull, Legs, Core), quick check-ins, and a mini-calendar highlighting active days                    |
| **Weight Tracking**       | Interactive line chart with 7-day rolling average to visualize real trends beyond daily fluctuations                           |
| **Habits & Gamification** | XP system, leveling, streak tracking, and unlockable badges like _Consistency King_ and _Century Club_                         |
| **Face & Skincare**       | Morning and evening skincare checklists, plus targeted face exercises with duration tracking                                   |
| **Settings**              | Profile setup that auto-calculates your daily calorie goal using the Mifflin-St Jeor formula                                   |

---

## How the AI Meal Analysis Works

1. You type something like: _"2 boiled eggs, toast with butter, and black coffee"_
2. The text hits a Supabase Edge Function
3. The function sends it to OpenAI (`gpt-4o-mini`) with a clinical nutritionist prompt
4. You get back individual items with precise macros
5. Everything is auto-logged to your daily tracker

---

## Feature Checklist

- [x] Email/password authentication
- [x] AI-powered meal analysis from natural language
- [x] Manual meal logging with full macro tracking
- [x] Pre-built workout templates and quick check-ins
- [x] Weight tracking with trend charts and rolling averages
- [x] Water and caffeine intake logging
- [x] XP, leveling, and streak system
- [x] Unlockable achievement badges
- [x] Daily challenges with XP rewards
- [x] Auto-calculated calorie goals
- [x] Morning and evening skincare routines
- [x] Face exercise library with duration tracking
- [x] Responsive layout (mobile bottom nav, desktop sidebar)
- [x] Smooth animations and page transitions via Framer Motion

---

## Tech Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Frontend   | React 18, Vite, JavaScript (ES2020)         |
| Styling    | Tailwind CSS, shadcn/ui                     |
| Animations | Framer Motion                               |
| Charts     | Recharts                                    |
| Backend    | Supabase (Auth, PostgreSQL, Edge Functions) |
| AI         | OpenAI API (gpt-4o-mini)                    |

---

## Project Structure

```
src/
  components/     UI components (shadcn/ui primitives + app layout + chat widget)
  hooks/          Business logic (auth, meals, workouts, stats, weight, water, caffeine)
  integrations/   Supabase client configuration
  lib/            Utilities, food database, workout templates, daily challenges
  pages/          All route views (Dashboard, Meals, Workouts, Weight, Habits, Skincare, Settings, Auth)
supabase/
  functions/      Edge function for AI meal analysis
  migrations/     Database schema definitions
```

---

## License

MIT
