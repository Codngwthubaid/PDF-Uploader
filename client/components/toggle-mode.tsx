"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = React.useState(theme === "dark");

  React.useEffect(() => {
    setIsDark(theme === "dark");
  }, [theme]);

  const toggleTheme = (checked: boolean) => {
    setIsDark(checked);
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="flex items-center space-x-2">
      <Sun className="w-4 h-4 text-yellow-500" />
      <Switch checked={isDark} onCheckedChange={toggleTheme} />
      <Moon className="w-4 h-4 text-gray-800 dark:text-white" />
    </div>
  );
}
