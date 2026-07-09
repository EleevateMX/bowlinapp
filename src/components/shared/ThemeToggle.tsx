import { Moon, Sun } from "lucide-react";

import { useTheme, type Theme } from "@/store/useTheme";
import { cn } from "@/lib/utils";

const options: { id: Theme; label: string; icon: typeof Moon }[] = [
  { id: "dark", label: "Oscuro", icon: Moon },
  { id: "light", label: "Claro", icon: Sun },
];

/** Selector segmentado Oscuro / Claro */
export function ThemeToggle() {
  const theme = useTheme((s) => s.theme);
  const setTheme = useTheme((s) => s.setTheme);

  return (
    <div className="flex rounded-full border border-border bg-secondary/50 p-1">
      {options.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setTheme(id)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition-colors",
            theme === id
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground",
          )}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
