import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("haq-theme", next ? "dark" : "light"); } catch { /* ignore */ }
    setDark(next);
  };
  return (
    <button onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} className="grid size-9 place-items-center rounded-full border border-border text-foreground hover:bg-secondary">
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
