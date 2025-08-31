"use client";

import { LucideComputer, LucideMoon, LucideSun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme || resolvedTheme;

  return (
    <div className="rounded-md border p-0.5 inline-flex items-center gap-1 bg-background flex-wrap">
      <Button
        variant={currentTheme === "light" ? "default" : "ghost"}
        className="rounded-md size-6"
        size="icon"
        onClick={() => setTheme("light")}
      >
        <LucideSun />
      </Button>
      <Button
        variant={currentTheme === "dark" ? "default" : "ghost"}
        className="rounded-md size-6"
        size="icon"
        onClick={() => setTheme("dark")}
      >
        <LucideMoon />
      </Button>
      <Button
        variant={currentTheme === "system" ? "default" : "ghost"}
        className="rounded-md size-6"
        size="icon"
        onClick={() => setTheme("system")}
      >
        <LucideComputer />
      </Button>
    </div>
  );
}
