"use client";

import { useEffect } from "react";

export function LandingScrollMotion() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(
      ".ticket-photo-slider"
    );
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {

          continue;
        }
        if (entry.target.getAttribute("data-reveal") === "pending") {
          entry.target.setAttribute("data-reveal", "entered");
          observer.unobserve(entry.target);
        }
      }
    });
    const finish = (event: AnimationEvent) => {
      if (event.animationName === "ticket-section-reveal" && event.target === event.currentTarget) {
        (event.currentTarget as HTMLElement).dataset.reveal = "done";
      }
    };
    for (const item of items) {
      if (item.getBoundingClientRect().top >= window.innerHeight) item.dataset.reveal = "pending";
      observer.observe(item);
      item.addEventListener("animationend", finish);
    }
    return () => {
      observer.disconnect();
      for (const item of items) {
        item.removeEventListener("animationend", finish);
        delete item.dataset.reveal;
      }
    };
  }, []);

  return null;
}


