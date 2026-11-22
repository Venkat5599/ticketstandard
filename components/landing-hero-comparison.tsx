"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { ArrowsLeftRight } from "@phosphor-icons/react";
import { LandingGlassBackdrop } from "@/components/landing-glass-backdrop";

export function LandingHeroComparison() {
  const [reveal, setReveal] = useState(50);

  return (
    <figure className="hero-edit-demo">
      <div className="hero-edit-labels" aria-hidden="true"><span>As submitted</span><span>Ready for review</span></div>
      <div className="hero-edit-stage" style={{ "--reveal": `${reveal}%` } as CSSProperties}>
        <Image src="/images/camera-demo-square.webp" alt="Camera photo rotated upright and fitted to a square" fill sizes="(max-width: 720px) 90vw, 530px" priority />
        <div className="hero-edit-before">
          <Image src="/images/camera-demo-submitted.webp" alt="The same camera photo submitted sideways" fill sizes="(max-width: 720px) 90vw, 530px" priority />
        </div>
        <div className="hero-edit-divider" aria-hidden="true">
          <span><LandingGlassBackdrop /><ArrowsLeftRight size={19} weight="bold" /></span>
        </div>
        <input type="range" min={0} max={100} value={reveal} onChange={(event) => setReveal(Number(event.target.value))}
          aria-label="Compare before and after" aria-valuetext={`${100 - reveal}% edited photo visible`} />
      </div>
      <figcaption>Drag to compare a sample before and after editing.</figcaption>
    </figure>
  );
}
