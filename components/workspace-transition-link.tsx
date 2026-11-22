"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { GlassIconReveal } from "@/components/ui/liquid-glass-logo-reveal";
import { VOYAGE_MARK_SVG } from "@/components/voyage-mark";

const TRANSITION_MS = 1550;

export function WorkspaceTransitionLink({
  href = "/workspace",
  className,
  children,
}: {
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (!transitioning) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href);
      return;
    }

    const timer = window.setTimeout(() => router.push(href), TRANSITION_MS);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTransitioning(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [href, router, transitioning]);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (!transitioning) setTransitioning(true);
  }

  return (
    <>
      <a className={className} href={href} onClick={handleClick} aria-busy={transitioning}>
        {children}
      </a>
      {transitioning && (
        <div className="voyage-transition-overlay" role="status" aria-label="Opening the Voyage workspace">
          <span className="visually-hidden">Opening workspace</span>
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
            tuning={{
              startZoom: 1.8,
              glide: 1.6,
              present: 1.7,
              dispersion: 1.1,
              colorBleed: 0.55,
              focus: 0.75,
              sheen: 0.8,
            }}
          />
          <span className="voyage-transition-caption" aria-hidden="true">Opening workspace</span>
        </div>
      )}
    </>
  );
}
