"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const liquidbuttonVariants = cva(
  "relative inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium outline-none transition-[color,box-shadow,transform] duration-300 focus-visible:ring-2 focus-visible:ring-[#77746b] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent text-current hover:scale-[1.03] active:scale-[0.98]",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 gap-1.5 px-3 text-xs",
        lg: "h-10 rounded-full px-6",
        xl: "h-12 rounded-full px-8",
        xxl: "h-14 rounded-full px-10",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "xxl" },
  },
);

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidbuttonVariants> {}

export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-slot="liquid-glass-button"
        className={cn("isolate overflow-hidden", liquidbuttonVariants({ variant, size, className }))}
        {...props}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit]"
          style={{
            backdropFilter: "blur(7px) saturate(135%)",
            background: "linear-gradient(155deg, rgba(255,255,255,.055), transparent 52%, rgba(0,0,0,.055))",
          }}
        />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,.28),inset_0_-1px_0_rgba(0,0,0,.22),0_1px_3px_rgba(0,0,0,.12)]" />
        <span className="relative z-10 inline-flex items-center justify-center gap-[inherit]">{children}</span>
      </button>
    );
  },
);
LiquidButton.displayName = "LiquidButton";
