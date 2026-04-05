import { useEffect, useState } from "react";
export function useTheme() {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("fitwise-theme");
            // Default to dark if nothing stored
            return stored ? stored === "dark" : true;
        }
        return true;
    });
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
        }
        else {
            root.classList.remove("dark");
        }
        localStorage.setItem("fitwise-theme", isDark ? "dark" : "light");
    }, [isDark]);
    return { isDark, toggleTheme: () => setIsDark(!isDark) };
}
