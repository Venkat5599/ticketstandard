"use client";

import { useRef, useState } from "react";
import type { ButtonHTMLAttributes, CSSProperties, FocusEvent, PointerEvent, ReactNode } from "react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

type DockProps = {
  children: ReactNode;
  className?: string;
  label?: string;
};

type DockItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode;
  label: string;
  active?: boolean;
};

export function Dock({ children, className = "", label = "Workspace navigation" }: DockProps) {
  return <nav className={`voyage-dock ${className}`} aria-label={label}>{children}</nav>;
}

export function DockItem({ children, label, active = false, className = "", ...props }: DockItemProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ left: number; top: number } | null>(null);

  const showTooltip = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Keep the label centered over the rail so it never masks the page column.
    setTooltipPosition({ left: Math.max(48, rect.left + rect.width / 2), top: rect.top + rect.height / 2 });
  };

  const hideTooltip = () => setTooltipPosition(null);

  return (
    <>
      <LiquidButton
        ref={buttonRef}
        type="button"
        variant="ghost"
        size="icon"
        title={label}
        className={`voyage-dock-item${active ? " is-active" : ""} ${className}`}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        {...props}
        onPointerEnter={(event: PointerEvent<HTMLButtonElement>) => { props.onPointerEnter?.(event); showTooltip(); }}
        onPointerLeave={(event: PointerEvent<HTMLButtonElement>) => { props.onPointerLeave?.(event); hideTooltip(); }}
        onFocus={(event: FocusEvent<HTMLButtonElement>) => { props.onFocus?.(event); showTooltip(); }}
        onBlur={(event: FocusEvent<HTMLButtonElement>) => { props.onBlur?.(event); hideTooltip(); }}
      >
        {children}
        {tooltipPosition && <span
          className="voyage-dock-tooltip voyage-dock-tooltip-floating"
          aria-hidden="true"
          style={{ "--dock-tooltip-left": `${tooltipPosition.left}px`, "--dock-tooltip-top": `${tooltipPosition.top}px` } as CSSProperties}
        >
          {label}
        </span>}
      </LiquidButton>
    </>
  );
}
