// ─── FitWise i18n Translation System ───
import { useState, useEffect, createContext, useContext } from "react";

const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    meals: "Meals",
    weight: "Weight",
    workouts: "Workouts",
    gym: "Gym",
    habits: "Habits",
    faceCare: "Face Care",
    community: "Community",
    settings: "Settings",

    // Settings Page
    settingsTitle: "Settings & Profile",
    account: "Account",
    personalInfo: "Personal Information",
    personalInfoDesc: "Update your details & biometric data",
    security: "Security",
    securityDesc: "Password, 2FA, and login history",
    preferences: "Preferences",
    darkMode: "Dark Mode",
    language: "Language",
    notifications: "Notifications",
    notificationSettings: "Notification Settings",
    notificationSettingsDesc: "Manage email and push alerts",
    workoutReminders: "Workout Reminders",
    workoutRemindersDesc: "Push notifications for daily check-ins",
    marketing: "Marketing & Newsletter",
    marketingDesc: "Weekly fit tips via Email",
    logOut: "Log Out",
    appVersion: "App Version 4.2.0 (Build 991)",
    proMember: "Pro Member",
    fullName: "Full Name",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    age: "Age",
    height: "Height",
    currentWeight: "Weight",
    activityLevel: "Activity Level",
    goal: "Goal",
    saveProfile: "Save Profile",
    saved: "Saved!",
    goalWeight: "Goal Weight",
    achieveBy: "Achieve By",
    recommendedCalories: "Recommended Daily Calories",
    oldPassword: "Current Password",
    newPassword: "New Password",
    updatePassword: "Update Password",
    loginHistory: "Recent Logins",
    noLoginHistory: "No login history available",

    // Activity Levels
    sedentary: "Sedentary",
    sedentaryDesc: "Desk job, little movement",
    light: "Light",
    lightDesc: "Walk 1-2x/week",
    moderate: "Moderate",
    moderateDesc: "Exercise 3-5x/week",
    veryActive: "Very Active",
    veryActiveDesc: "Hard exercise 6-7x/week",
    extraActive: "Extra Active",
    extraActiveDesc: "Athletic / physical job",

    // Goals
    lose: "Lose",
    loseDesc: "Cut 500 cal/day",
    maintain: "Maintain",
    maintainDesc: "Keep weight stable",
    leanGain: "Lean Gain",
    leanGainDesc: "Surplus 300 cal/day",
    bulk: "Bulk",
    bulkDesc: "Surplus 500 cal/day",

    // Weight/Progress Page
    weightTracking: "Weight Tracking",
    logWeight: "Log Weight",
    current: "Current",
    change: "Change",
    entries: "Entries",
    goalKg: "Goal",
    weightTrend: "Weight Trend",
    recentEntries: "Recent Entries",
    noEntries: "No entries yet. Log your first weight above!",
    bodyMetrics: "Body Metrics",
    bodyFat: "Body Fat",
    muscleMass: "Muscle Mass",
    hydration: "Hydration",
    progressCalendar: "Progress Calendar",

    // Gym Page
    hypertrophyProgram: "Hypertrophy Program",
    volumeAccumulation: "Phase 2: Volume Accumulation",
    workoutBuilder: "Workout Builder",
    startSession: "Start Session",
    sessionCompleted: "Session Completed",
    restDay: "Rest Day",
    restDayScheduled: "Rest Day Scheduled",
    restDayDesc: "Focus on recovery and mobility.",
    addExercise: "Add Exercise",
    searchExercise: "Search exercise...",
    recovery: "Recovery",
    restDayFocus: "Rest Day Focus",
    restDayExplore: "Active recovery and mobility routine.",
    explore: "Explore",
    cardioConditioning: "Cardiovascular Conditioning",
    weeklyTargets: "Weekly targets",
    zone2: "Zone 2",
    hiit: "HIIT",
    configureRoutine: "Configure your weekly routine",
    restDayConfig: "Rest Day Configuration",
    restDayConfigDesc: "Select days to mark as rest days. Rest days focus on active recovery instead of hypertrophy.",
    home: "Home",

    // Community Page
    communityHub: "Community Hub",
    communityDesc: "Connect, compete, and conquer your goals together.",
    leaderboard: "Leaderboard",
    friends: "Friends",
    level: "Level",
    totalXP: "Total XP",
    global: "Global",

    // Face Care Page
    dailyRituals: "Daily Rituals",
    dailyRitualsDesc: "Clear skin starts from within",
    morningRoutine: "Morning Routine",
    nightRoutine: "Night Routine",
    faceYoga: "Face Yoga",
    steps: "Steps",

    // Common
    min: "Min",
    kg: "kg",
    yrs: "yrs",
    cm: "cm",
    sets: "Sets",
    reps: "Reps",
    select: "Select",
  },
  es: {
    // Navigation
    dashboard: "Tablero",
    meals: "Comidas",
    weight: "Peso",
    workouts: "Entrenamientos",
    gym: "Gimnasio",
    habits: "Hábitos",
    faceCare: "Cuidado Facial",
    community: "Comunidad",
    settings: "Ajustes",

    // Settings Page
    settingsTitle: "Ajustes y Perfil",
    account: "Cuenta",
    personalInfo: "Información Personal",
    personalInfoDesc: "Actualiza tus datos y biometría",
    security: "Seguridad",
    securityDesc: "Contraseña, 2FA e historial de inicio",
    preferences: "Preferencias",
    darkMode: "Modo Oscuro",
    language: "Idioma",
    notifications: "Notificaciones",
    notificationSettings: "Configuración de Notificaciones",
    notificationSettingsDesc: "Gestiona alertas de email y push",
    workoutReminders: "Recordatorios de Ejercicio",
    workoutRemindersDesc: "Notificaciones push diarias",
    marketing: "Marketing y Boletín",
    marketingDesc: "Tips semanales por email",
    logOut: "Cerrar Sesión",
    appVersion: "Versión 4.2.0 (Build 991)",
    proMember: "Miembro Pro",
    fullName: "Nombre Completo",
    gender: "Género",
    male: "Masculino",
    female: "Femenino",
    other: "Otro",
    age: "Edad",
    height: "Altura",
    currentWeight: "Peso",
    activityLevel: "Nivel de Actividad",
    goal: "Objetivo",
    saveProfile: "Guardar Perfil",
    saved: "¡Guardado!",
    goalWeight: "Peso Objetivo",
    achieveBy: "Lograr Para",
    recommendedCalories: "Calorías Diarias Recomendadas",
    oldPassword: "Contraseña Actual",
    newPassword: "Nueva Contraseña",
    updatePassword: "Actualizar Contraseña",
    loginHistory: "Inicios Recientes",
    noLoginHistory: "Sin historial de inicio de sesión",

    // Activity Levels
    sedentary: "Sedentario",
    sedentaryDesc: "Trabajo de escritorio",
    light: "Ligero",
    lightDesc: "Caminar 1-2x/semana",
    moderate: "Moderado",
    moderateDesc: "Ejercicio 3-5x/semana",
    veryActive: "Muy Activo",
    veryActiveDesc: "Ejercicio intenso 6-7x/semana",
    extraActive: "Extra Activo",
    extraActiveDesc: "Atlético / trabajo físico",

    // Goals
    lose: "Perder",
    loseDesc: "Deficit 500 cal/día",
    maintain: "Mantener",
    maintainDesc: "Peso estable",
    leanGain: "Ganancia Limpia",
    leanGainDesc: "Superávit 300 cal/día",
    bulk: "Volumen",
    bulkDesc: "Superávit 500 cal/día",

    // Weight/Progress Page
    weightTracking: "Seguimiento de Peso",
    logWeight: "Registrar Peso",
    current: "Actual",
    change: "Cambio",
    entries: "Entradas",
    goalKg: "Objetivo",
    weightTrend: "Tendencia de Peso",
    recentEntries: "Entradas Recientes",
    noEntries: "Sin entradas. ¡Registra tu primer peso!",
    bodyMetrics: "Métricas Corporales",
    bodyFat: "Grasa Corporal",
    muscleMass: "Masa Muscular",
    hydration: "Hidratación",
    progressCalendar: "Calendario de Progreso",

    // Gym Page
    hypertrophyProgram: "Programa de Hipertrofia",
    volumeAccumulation: "Fase 2: Acumulación de Volumen",
    workoutBuilder: "Constructor de Rutina",
    startSession: "Iniciar Sesión",
    sessionCompleted: "Sesión Completada",
    restDay: "Día de Descanso",
    restDayScheduled: "Día de Descanso Programado",
    restDayDesc: "Enfócate en recuperación y movilidad.",
    addExercise: "Agregar Ejercicio",
    searchExercise: "Buscar ejercicio...",
    recovery: "Recuperación",
    restDayFocus: "Enfoque Día de Descanso",
    restDayExplore: "Rutina de recuperación activa.",
    explore: "Explorar",
    cardioConditioning: "Acondicionamiento Cardiovascular",
    weeklyTargets: "Objetivos semanales",
    zone2: "Zona 2",
    hiit: "HIIT",
    configureRoutine: "Configura tu rutina semanal",
    restDayConfig: "Configuración de Descanso",
    restDayConfigDesc: "Selecciona días de descanso.",
    home: "Casa",

    // Community Page
    communityHub: "Centro Comunitario",
    communityDesc: "Conecta, compite y conquista tus metas juntos.",
    leaderboard: "Clasificación",
    friends: "Amigos",
    level: "Nivel",
    totalXP: "XP Total",
    global: "Global",

    // Face Care Page
    dailyRituals: "Rituales Diarios",
    dailyRitualsDesc: "La piel clara comienza desde dentro",
    morningRoutine: "Rutina Matutina",
    nightRoutine: "Rutina Nocturna",
    faceYoga: "Yoga Facial",
    steps: "Pasos",

    // Common
    min: "Min",
    kg: "kg",
    yrs: "años",
    cm: "cm",
    sets: "Series",
    reps: "Reps",
    select: "Seleccionar",
  },
  fr: {
    // Navigation
    dashboard: "Tableau de Bord",
    meals: "Repas",
    weight: "Poids",
    workouts: "Entraînements",
    gym: "Salle",
    habits: "Habitudes",
    faceCare: "Soins du Visage",
    community: "Communauté",
    settings: "Paramètres",

    // Settings Page
    settingsTitle: "Paramètres & Profil",
    account: "Compte",
    personalInfo: "Informations Personnelles",
    personalInfoDesc: "Mettez à jour vos détails et biométrie",
    security: "Sécurité",
    securityDesc: "Mot de passe, 2FA et historique",
    preferences: "Préférences",
    darkMode: "Mode Sombre",
    language: "Langue",
    notifications: "Notifications",
    notificationSettings: "Paramètres de Notifications",
    notificationSettingsDesc: "Gérer les alertes email et push",
    workoutReminders: "Rappels d'Entraînement",
    workoutRemindersDesc: "Notifications push quotidiennes",
    marketing: "Marketing & Newsletter",
    marketingDesc: "Conseils hebdomadaires par email",
    logOut: "Se Déconnecter",
    appVersion: "Version 4.2.0 (Build 991)",
    proMember: "Membre Pro",
    fullName: "Nom Complet",
    gender: "Genre",
    male: "Homme",
    female: "Femme",
    other: "Autre",
    age: "Âge",
    height: "Taille",
    currentWeight: "Poids",
    activityLevel: "Niveau d'Activité",
    goal: "Objectif",
    saveProfile: "Enregistrer le Profil",
    saved: "Enregistré !",
    goalWeight: "Poids Objectif",
    achieveBy: "Atteindre D'ici",
    recommendedCalories: "Calories Quotidiennes Recommandées",
    oldPassword: "Mot de Passe Actuel",
    newPassword: "Nouveau Mot de Passe",
    updatePassword: "Mettre à Jour",
    loginHistory: "Connexions Récentes",
    noLoginHistory: "Aucun historique de connexion",

    // Activity Levels
    sedentary: "Sédentaire",
    sedentaryDesc: "Travail de bureau",
    light: "Léger",
    lightDesc: "Marche 1-2x/semaine",
    moderate: "Modéré",
    moderateDesc: "Exercice 3-5x/semaine",
    veryActive: "Très Actif",
    veryActiveDesc: "Exercice intense 6-7x/semaine",
    extraActive: "Extra Actif",
    extraActiveDesc: "Athlétique / travail physique",

    // Goals
    lose: "Perdre",
    loseDesc: "Déficit 500 cal/jour",
    maintain: "Maintenir",
    maintainDesc: "Poids stable",
    leanGain: "Gain Propre",
    leanGainDesc: "Surplus 300 cal/jour",
    bulk: "Prise de Masse",
    bulkDesc: "Surplus 500 cal/jour",

    // Weight/Progress Page
    weightTracking: "Suivi du Poids",
    logWeight: "Enregistrer Poids",
    current: "Actuel",
    change: "Variation",
    entries: "Entrées",
    goalKg: "Objectif",
    weightTrend: "Tendance du Poids",
    recentEntries: "Entrées Récentes",
    noEntries: "Aucune entrée. Enregistrez votre premier poids !",
    bodyMetrics: "Métriques Corporelles",
    bodyFat: "Masse Grasse",
    muscleMass: "Masse Musculaire",
    hydration: "Hydratation",
    progressCalendar: "Calendrier de Progrès",

    // Gym Page
    hypertrophyProgram: "Programme d'Hypertrophie",
    volumeAccumulation: "Phase 2: Accumulation de Volume",
    workoutBuilder: "Constructeur d'Entraînement",
    startSession: "Commencer la Séance",
    sessionCompleted: "Séance Terminée",
    restDay: "Jour de Repos",
    restDayScheduled: "Jour de Repos Programmé",
    restDayDesc: "Récupération et mobilité.",
    addExercise: "Ajouter un Exercice",
    searchExercise: "Rechercher un exercice...",
    recovery: "Récupération",
    restDayFocus: "Focus Jour de Repos",
    restDayExplore: "Routine de récupération active.",
    explore: "Explorer",
    cardioConditioning: "Conditionnement Cardiovasculaire",
    weeklyTargets: "Objectifs hebdomadaires",
    zone2: "Zone 2",
    hiit: "HIIT",
    configureRoutine: "Configurez votre routine",
    restDayConfig: "Configuration du Repos",
    restDayConfigDesc: "Sélectionnez vos jours de repos.",
    home: "Maison",

    // Community Page
    communityHub: "Centre Communautaire",
    communityDesc: "Connectez-vous, compétez et atteignez vos objectifs ensemble.",
    leaderboard: "Classement",
    friends: "Amis",
    level: "Niveau",
    totalXP: "XP Total",
    global: "Global",

    // Face Care Page
    dailyRituals: "Rituels Quotidiens",
    dailyRitualsDesc: "Une belle peau commence de l'intérieur",
    morningRoutine: "Routine du Matin",
    nightRoutine: "Routine du Soir",
    faceYoga: "Yoga du Visage",
    steps: "Étapes",

    // Common
    min: "Min",
    kg: "kg",
    yrs: "ans",
    cm: "cm",
    sets: "Séries",
    reps: "Reps",
    select: "Sélectionner",
  },
};

const LANG_KEY = "fitwise-lang";

export function getStoredLanguage() {
  if (typeof window !== "undefined") {
    return localStorage.getItem(LANG_KEY) || "en";
  }
  return "en";
}

export function setStoredLanguage(lang) {
  localStorage.setItem(LANG_KEY, lang);
}

export function t(key, lang) {
  const language = lang || getStoredLanguage();
  return translations[language]?.[key] || translations.en[key] || key;
}

// React hook
export function useTranslation() {
  const [lang, setLangState] = useState(getStoredLanguage);

  useEffect(() => {
    const handleStorage = () => setLangState(getStoredLanguage());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setLang = (newLang) => {
    setStoredLanguage(newLang);
    setLangState(newLang);
    // Dispatch event so other components re-render
    window.dispatchEvent(new Event("storage"));
  };

  const translate = (key) => t(key, lang);

  return { lang, setLang, t: translate };
}

export const LANGUAGES = [
  { value: "en", label: "English (US)" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
];
