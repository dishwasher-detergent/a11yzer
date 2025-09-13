import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-1 border-[color-mix(in_srgb,var(--color-primary)_80%,black)] dark:border-[color-mix(in_srgb,var(--color-primary)_80%,white)]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-1 border-[color-mix(in_srgb,var(--color-secondary)_80%,black)] dark:border-[color-mix(in_srgb,var(--color-secondary)_80%,white)]",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 border-1 border-[color-mix(in_srgb,var(--color-destructive)_80%,black)] dark:border-[color-mix(in_srgb,var(--color-destructive)_80%,white)]",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        critical: "bg-rose-600/80 text-white border-1 border-rose-600",
        high: "bg-rose-600/80 text-white border-1 border-rose-600",
        medium: "bg-amber-600/80 text-white border-1 border-amber-600",
        low: "bg-emerald-600/80 text-white border-1 border-emerald-600",
        accessibility: "bg-violet-600/80 text-white border-1 border-violet-600",
        ui: "bg-pink-600/80 text-white border-1 border-pink-600",
        ux: "bg-cyan-600/80 text-white border-1 border-cyan-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
