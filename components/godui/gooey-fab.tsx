"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export type GooeyFabAction = {
  label: string;
  icon: ReactNode;
  onSelect?: () => void;
};

type GooeyFabProps = {
  actions: GooeyFabAction[];
  label?: string;
  icon?: ReactNode;
  className?: string;
};

export function GooeyFab({ actions, label = "Profile", icon, className = "" }: GooeyFabProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    window.addEventListener("keydown", close);
    window.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("keydown", close);
      window.removeEventListener("pointerdown", outside);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`gooey-fab ${className}`}>
      <div className={`gooey-fab-actions${open ? " is-open" : ""}`} aria-hidden={!open}>
        {actions.map((action, index) => (
          <button
            key={action.label}
            type="button"
            className="gooey-fab-action"
            tabIndex={open ? 0 : -1}
            aria-label={action.label}
            title={action.label}
            style={{ "--gooey-index": index } as React.CSSProperties}
            onClick={() => { action.onSelect?.(); setOpen(false); }}
          >
            <span className="gooey-fab-action-icon" aria-hidden="true">{action.icon}</span>
            <span className="gooey-fab-action-label">{action.label}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className={`gooey-fab-trigger${open ? " is-open" : ""}`}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(value => !value)}
      >
        {icon}
      </button>
    </div>
  );
}
