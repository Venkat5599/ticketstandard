"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export function TextAnimate({
  children,
  animation = "blurInUp",
  by = "word",
  className = "",
}: {
  children: string;
  animation?: "blurInUp";
  by?: "word";
  className?: string;
}) {
  const targetRef = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const words = children.trim().split(/\s+/);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    setReady(true);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={targetRef}
      className={`voyage-text-animate ${className}`.trim()}
      data-animation={animation}
      data-by={by}
      data-ready={ready}
      data-visible={visible}
    >
      {words.map((word, index) => (
        <span className="voyage-text-word" key={`${word}-${index}`} style={{ animationDelay: `${index * 42}ms` } as CSSProperties}>{word}</span>
      )).reduce<ReactNode[]>((parts, word, index) => index ? [...parts, " ", word] : [word], [])}
    </span>
  );
}
