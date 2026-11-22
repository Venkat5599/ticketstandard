"use client";

import Image from "next/image";
import { useState } from "react";

const frames = [
  { id: "original", name: "Original", width: 390, height: 500, description: "Keep the photo’s original proportions." },
  { id: "square", name: "Square", width: 1024, height: 1024, description: "Equal margins on the left and right." },
  { id: "portrait", name: "Portrait", width: 1024, height: 1280, description: "A narrow margin on each side." },
  { id: "landscape", name: "Landscape", width: 1280, height: 1024, description: "Wider margins keep the whole sneaker visible." },
] as const;

export function LandingCanvasOptions() {
  const [active, setActive] = useState(0);
  const frame = frames[active];

  return (
    <section className="canvas-picker" aria-labelledby="canvas-title">
      <header>
        <h2 id="canvas-title">Choose a frame.</h2>
        <p>See how the same photo fits each canvas.</p>
      </header>
      <div className="canvas-picker-panel">
        <div className="canvas-picker-stage">
          <div className="canvas-picker-sheet" style={{ width: `calc(var(--photo-height) * ${frame.width / frame.height})` }}>
            <Image src="/images/canvas-square-sneaker.jpg" alt="Black-and-white halftone close-up of a sneaker"
              width={390} height={500} sizes="235px" />
          </div>
        </div>
        <div className="proof-edit-tools canvas-picker-tools" role="group" aria-label="Canvas shape">
          {frames.map((option, index) => (
            <button key={option.id} type="button" aria-pressed={active === index} onClick={() => setActive(index)}>
              <i aria-hidden="true" style={{ aspectRatio: option.width / option.height }} />
              {option.name}
            </button>
          ))}
        </div>
        <p className="canvas-picker-caption" aria-live="polite" aria-atomic="true">
          <strong>{frame.name} · {frame.width} × {frame.height} px</strong>
          <span>{frame.description}</span>
        </p>
      </div>
    </section>
  );
}
