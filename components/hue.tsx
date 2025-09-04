"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface HueProps {
  className?: string;
}

export function Hue({ className }: HueProps) {
  const from = 0;
  const to = 360;
  const interval = 100;

  const [value, setValue] = useState(from);

  useEffect(() => {
    const timer = setInterval(() => {
      setValue((prevValue) => (prevValue < to ? prevValue + 1 : from));
    }, interval);

    return () => clearInterval(timer);
  }, [from, to, interval]);

  return (
    <div
      className={cn(
        className,
        "absolute z-0 origin-center overflow-hidden rounded-full blur-3xl"
      )}
      style={{
        transition: "filter 200ms linear",
      }}
    >
      <div
        className="gap-15 pointer-events-none flex w-[640px] origin-center -rotate-45 scale-[200%] justify-center"
        style={{
          filter: `hue-rotate(${value}deg) saturate(8) blur(30px)`,
        }}
      >
        <div className="h-48 w-8 bg-pink-400" />
        <div className="h-56 w-8 bg-red-400" />
        <div className="h-64 w-8 bg-yellow-400" />
        <div className="h-72 w-8 bg-green-400" />
        <div className="h-80 w-8 bg-blue-400" />
      </div>
    </div>
  );
}
