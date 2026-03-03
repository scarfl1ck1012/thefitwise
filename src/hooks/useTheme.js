import { useEffect, useState } from "react";
export function useTheme() {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("fitwise-theme") === "dark";
        }
        return false;
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
