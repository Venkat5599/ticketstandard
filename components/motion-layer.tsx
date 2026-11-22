"use client";

import { useEffect } from "react";

export function MotionLayer() {
  useEffect(() => {
    document.documentElement.classList.add("js");
    const revealTargets = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealTargets.forEach((target) => revealObserver.observe(target));

    const drawTargets = document.querySelectorAll<HTMLElement>("[data-draw]");
    const drawObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          drawObserver.unobserve(entry.target);
        }
      }
    }, { threshold: 0.4 });
    drawTargets.forEach((target) => drawObserver.observe(target));

    return () => {
      revealObserver.disconnect();
      drawObserver.disconnect();
    };
  }, []);

  return null;
}
