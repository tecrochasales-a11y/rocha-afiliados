import { useState, useEffect } from "react";
import { Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type ThemeIdentity = "default" | "rocha";

const THEME_KEY = "rocha-site-theme";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<ThemeIdentity>(() => {
    return (localStorage.getItem(THEME_KEY) as ThemeIdentity) || "default";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "rocha") {
      root.classList.add("theme-rocha");
    } else {
      root.classList.remove("theme-rocha");
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-[60] rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-card shadow-soft"
          aria-label="Alterar identidade visual"
        >
          <Palette className="h-5 w-5 text-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => setTheme("default")}
          className={theme === "default" ? "bg-primary/10 font-semibold" : ""}
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded-full" style={{ background: "hsl(210 60% 25%)" }} />
              <div className="w-4 h-4 rounded-full" style={{ background: "hsl(145 65% 42%)" }} />
              <div className="w-4 h-4 rounded-full" style={{ background: "hsl(38 92% 50%)" }} />
            </div>
            <span>Tema Padrão</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("rocha")}
          className={theme === "rocha" ? "bg-primary/10 font-semibold" : ""}
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded-full" style={{ background: "hsl(30 10% 8%)" }} />
              <div className="w-4 h-4 rounded-full" style={{ background: "hsl(38 55% 55%)" }} />
              <div className="w-4 h-4 rounded-full" style={{ background: "hsl(30 10% 14%)" }} />
            </div>
            <span>Rocha Sales Premium</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
