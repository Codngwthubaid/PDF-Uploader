"use client";

import * as React from "react";
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
      <Switch checked={isDark} onCheckedChange={toggleTheme} className="cursor-pointer"/>
    </div>
  );
}
