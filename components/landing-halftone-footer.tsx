"use client";

import { PreparePhotoLink } from "@/components/prepare-photo-link";
import { useEffect, useRef } from "react";

export function LandingHalftoneFooter() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (matchMedia("(max-width: 640px)").matches) return;
    const canvas = ref.current;
    const surface = canvas?.closest<HTMLElement>(".landing-halftone-lockup");
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !surface) return;
    const activeCanvas = canvas;
    const context = ctx;
    const stamp = document.createElement("canvas");
    const ink = stamp.getContext("2d");
    if (!ink) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const wordmark = new Image();
    let dots: { x: number; y: number; radius: number; dx: number; dy: number; vx: number; vy: number }[] = [];
    let pointer: { x: number; y: number } | null = null;
    let wave: { x: number; y: number; start: number } | null = null;
    let frame = 0;

    function draw(now: number) {
      frame = 0;
      const width = activeCanvas.clientWidth, height = activeCanvas.clientHeight;
      context.clearRect(0, 0, width, height);
      const radius = wave ? (now - wave.start) * .65 : 0;
      if (radius > Math.hypot(width, height) + 40) wave = null;
      let moving = Boolean(wave);
      for (const dot of dots) {
        let ax = 0, ay = 0;
        if (!motion.matches && pointer) {
          const x = dot.x - pointer.x, y = dot.y - pointer.y;
          const distance = Math.hypot(x, y);
          const push = 58 * Math.max(0, 1 - distance / 155) / Math.max(1, distance);
          ax += x * push; ay += y * push;
        }
        if (!motion.matches && wave) {
          const x = dot.x - wave.x, y = dot.y - wave.y;
          const distance = Math.hypot(x, y);
          const push = 53 * Math.max(0, 1 - Math.abs(distance - radius) / 52) / Math.max(1, distance);
          ax += x * push; ay += y * push;
        }
        dot.vx = (dot.vx + (ax - dot.dx) * .16) * .76;
        dot.vy = (dot.vy + (ay - dot.dy) * .16) * .76;
        dot.dx += dot.vx; dot.dy += dot.vy;
        const displacement = Math.hypot(dot.dx, dot.dy);
        moving ||= displacement + Math.abs(dot.vx) + Math.abs(dot.vy) > .12;
        context.fillStyle = displacement > 2 ? "#e5ba80" : "#ded9d0";
        context.beginPath();
        context.arc(dot.x + dot.dx, dot.y + dot.dy, dot.radius, 0, Math.PI * 2);
        context.fill();
      }
      if (dots.length) activeCanvas.dataset.inkReady = "true";
      if (moving) frame = requestAnimationFrame(draw);
    }
    const wake = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const resize = () => {
      const width = activeCanvas.clientWidth, height = activeCanvas.clientHeight;
      if (!width || !height || !wordmark.naturalWidth) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      activeCanvas.width = Math.round(width * dpr); activeCanvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      stamp.width = width; stamp.height = height;
      ink.clearRect(0, 0, width, height);
      const scale = Math.min(width * .9 / wordmark.naturalWidth, height / wordmark.naturalHeight);
      const markWidth = wordmark.naturalWidth * scale, markHeight = wordmark.naturalHeight * scale;
      ink.drawImage(wordmark, (width - markWidth) / 2, (height - markHeight) / 2, markWidth, markHeight);
      const pixels = ink.getImageData(0, 0, width, height).data;
      dots = [];
      const pitch = 3;
      for (let y = pitch / 2; y < height; y += pitch) for (let x = pitch / 2; x < width; x += pitch) {
        let alpha = 0, samples = 0;
        for (let sampleY = Math.max(0, Math.floor(y - 1)); sampleY <= Math.min(height - 1, Math.ceil(y + 1)); sampleY++) {
          for (let sampleX = Math.max(0, Math.floor(x - 1)); sampleX <= Math.min(width - 1, Math.ceil(x + 1)); sampleX++) {
            alpha += pixels[(sampleY * width + sampleX) * 4 + 3];
            samples++;
          }
        }
        const coverage = alpha / (samples * 255);
        if (coverage > .1) dots.push({ x, y, radius: .72 + coverage * .36, dx: 0, dy: 0, vx: 0, vy: 0 });
      }
      wake();
    };
    const position = (event: MouseEvent) => {
      const box = activeCanvas.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top };
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "touch" && !motion.matches) { pointer = position(event); wake(); }
    };
    const leave = () => { pointer = null; wake(); };
    const click = (event: MouseEvent) => {
      if (!motion.matches) { wave = { ...position(event), start: performance.now() }; wake(); }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(activeCanvas);
    wordmark.addEventListener("load", resize);
    wordmark.src = "/images/ticketstandard-wordmark.png";
    surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerleave", leave);
    surface.addEventListener("click", click);
    return () => {
      observer.disconnect(); wordmark.removeEventListener("load", resize); cancelAnimationFrame(frame);
      surface.removeEventListener("pointermove", move); surface.removeEventListener("pointerleave", leave);
      surface.removeEventListener("click", click);
    };
  }, []);

  return (
    <footer className="landing-halftone-footer">
      <div className="landing-halftone-footer-bar">
        <h2>Your turn.</h2>
        <PreparePhotoLink />
      </div>
      <div className="landing-halftone-lockup">
        <div className="footer-ink-wrap">
          <canvas ref={ref} className="landing-halftone-ink" role="img" aria-label="TicketStandard wordmark">TicketStandard</canvas>
          <img className="footer-ink-fallback" src="/images/ticketstandard-wordmark.png" alt="TicketStandard" />
        </div>
      </div>
    </footer>
  );
}


