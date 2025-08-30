"use client";

import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { LucideComputer, LucideMoon, LucideSun } from "lucide-react";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="rounded-full border p-1 inline-flex items-center space-x-1 bg-background">
      <Button
        variant={theme === "light" ? "default" : "ghost"}
        className="rounded-full size-6"
        size="icon"
        onClick={() => setTheme("light")}
      >
        <LucideSun />
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "ghost"}
        className="rounded-full size-6"
        size="icon"
        onClick={() => setTheme("dark")}
      >
        <LucideMoon />
      </Button>
      <Button
        variant={theme === "system" ? "default" : "ghost"}
        className="rounded-full size-6"
        size="icon"
        onClick={() => setTheme("system")}
      >
        <LucideComputer />
      </Button>
    </div>
  );
}
