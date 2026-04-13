import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const storedTheme = localStorage.getItem("fitwise-theme");
if (!storedTheme) {
  localStorage.setItem("fitwise-theme", "dark");
}
if ((storedTheme || "dark") === "dark") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

createRoot(document.getElementById("root")).render(<App />);
