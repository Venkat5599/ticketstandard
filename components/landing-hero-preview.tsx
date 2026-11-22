"use client";

import { Play } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

export function LandingHeroPreview() {


  const canvas = useRef<HTMLCanvasElement>(null);
  const [modelStatus, setModelStatus] = useState("loading");
  useEffect(() => {
    const element = canvas.current;
    const lost = () => setModelStatus("unavailable");
    const restored = () => setModelStatus("ready");
    element?.addEventListener("webglcontextlost", lost);
    element?.addEventListener("webglcontextrestored", restored);
    let active = true;
    let dispose: (() => void) | undefined;
    import("./hero-camera-model").then(({ mountCamera }) => {
      if (!active || !canvas.current) return;
      dispose = mountCamera(canvas.current, () => setModelStatus("ready"));
    }).catch(() => { if (active) setModelStatus("unavailable"); });
    return () => { active = false; element?.removeEventListener("webglcontextlost", lost); element?.removeEventListener("webglcontextrestored", restored); dispose?.(); };
  }, []);

  return (
    <figure className="hero-studio-preview optical-scene">
      <div className="optical-stage" data-camera-status={modelStatus} data-model-ready={modelStatus === "ready"}>
        <canvas ref={canvas} className="hero-camera-render" aria-hidden="true" />
        <b id="demo-camera-flash" className="optical-flash-pulse camera-model-flash" />
      </div>

    </figure>
  );
}



export function WatchDemoButton() {
  const isCapturing = useRef(false);
  async function runDemo() {
    if (isCapturing.current) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const flash = document.getElementById("demo-camera-flash");

    if (!reduced && flash?.animate) {
      isCapturing.current = true;
      try {
        await new Promise<void>(resolve => {
          const fallback = window.setTimeout(resolve, 900);
          window.dispatchEvent(new CustomEvent("ticketstandard:camera-capture", { detail: () => {
            window.clearTimeout(fallback);
            resolve();
          } }));
        });
        await flash.animate([
          { opacity: 0, transform: "scale(.36)" },
          { opacity: 1, transform: "scale(1)", offset: .12 },
          { opacity: 0, transform: "scale(1.7)" },
        ], { duration: 300, easing: "ease-out" }).finished;
      } catch {
        // Closing the page can cancel the flash.
      } finally {
        isCapturing.current = false;
      }
    }
    window.dispatchEvent(new Event("ticketstandard:camera-capture-complete"));
    document.getElementById("photo-demo-preview")?.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "center" });
    window.dispatchEvent(new Event("ticketstandard:play-demo"));
  }

  return <button type="button" className="hero-watch-demo" onClick={runDemo}><Play size={14} weight="fill" />Watch demo</button>;
}
