"use client";

import { GlassIconReveal } from "@/components/ui/liquid-glass-logo-reveal";
import { VOYAGE_MARK_SVG } from "@/components/voyage-mark";

export type WorkspaceRole = "user" | "organizer";

export function workspaceLoadingLabel(role: WorkspaceRole) {
  return role === "user" ? "Loading user interface" : "Loading organizer workspace";
}

export function WorkspaceLoadingScreen({ role }: { role: WorkspaceRole }) {
  const label = workspaceLoadingLabel(role);

  return (
    <div className="voyage-transition-overlay" role="status" aria-label={label} aria-live="polite">
      <span className="visually-hidden">{label}</span>
      <GlassIconReveal
        className="voyage-reveal-canvas"
        logo={VOYAGE_MARK_SVG}
        label="Voyage"
        look="light"
        background="#f0eee7"
        logoColor="#22221e"
        originalColors
        tileSize={256}
        logoScale={0.66}
        finalScale={0.82}
        loop={false}
        speed={2.1}
        tuning={{ startZoom: 1.8, glide: 1.6, present: 1.7, dispersion: 1.1, colorBleed: 0.55, focus: 0.75, sheen: 0.8 }}
      />
      <span className="voyage-transition-caption" aria-hidden="true">{label}</span>
    </div>
  );
}
