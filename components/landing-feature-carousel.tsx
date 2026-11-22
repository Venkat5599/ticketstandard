"use client";

import {


  ArrowLeft,
  ArrowRight,
  ArrowsClockwise,
  Check,
  FileImage,
  FlipHorizontal,
  LockKey,
  Palette,
  SquaresFour,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const features = [
  {
    title: "Starts upright.",
    shortTitle: "Orientation",
    description: "Read the photo’s saved orientation on import, then fine-tune it with 90° turns if needed.",
    Icon: ArrowsClockwise,
  },
  {
    title: "Fix a mirror flip.",
    shortTitle: "Flip",
    description: "Mirror a photo horizontally, rotate it left or right, and reset when you want to start fresh.",
    Icon: FlipHorizontal,
  },
  {
    title: "Keep every edge.",
    shortTitle: "Full frame",
    description: "Fit the whole photo inside the frame. The image keeps its proportions and nothing gets cut off.",
    Icon: Check,
  },
  {
    title: "Choose the frame.",
    shortTitle: "Canvas sizes",
    description: "Pick square, portrait, landscape, or keep the photo’s original dimensions.",
    Icon: SquaresFour,
  },
  {
    title: "Keep transparency.",
    shortTitle: "Backgrounds",
    description: "PNG keeps transparent areas. When saving as JPEG, choose the background color to fill them.",
    Icon: Palette,
  },
  {
    title: "Choose your format.",
    shortTitle: "Export formats",
    description: "Save the prepared copy as PNG, JPEG, or WebP, then download it when it’s ready.",
    Icon: FileImage,
  },
  {
    title: "Your original stays yours.",
    shortTitle: "Private by default",
    description: "The photo is prepared in your browser. Your source file stays untouched while you download a separate copy.",
    Icon: LockKey,
  },
];

function getOffset(index: number, active: number, count: number) {
  const half = Math.floor(count / 2);
  const rawOffset = index - active;
  if (rawOffset > half) return rawOffset - count;
  if (rawOffset < -half) return rawOffset + count;
  return rawOffset;
}

const photoSteps = [
  { title: "Original picture", description: "The photo as submitted, with its original tilt.", image: "/images/lego-kit-original-tilted.png" },
  { title: "Rotated and properly fit", description: "Straightened with the full photo in view.", image: "/images/lego-kit-rotated-fit.jpg" },
  { title: "Upscaled and refined", description: "The final copy, ready to review.", image: "/images/lego-kit-widescreen-photo.png" },
].map((step) => ({ ...step, shortTitle: step.title, Icon: FileImage }));

export function LandingFeatureCarousel({ photos = false }: { photos?: boolean }) {
  const cards: (typeof features[number] & { image?: string })[] = photos ? photoSteps : features;
  const count = cards.length;
  const headingId = photos ? "the-whole-photo" : "ticket-apple-highlights-title";
  const [active, setActive] = useState(0);
  const activeFeature = cards[active];

  const stage = useRef<HTMLDivElement>(null);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    if (!stage.current) return;
    const target = stage.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let timer: number | undefined;
    const sync = () => {
      window.clearInterval(timer);
      if (visible && !stopped && !motion.matches && !document.hidden) {
        timer = window.setInterval(() => setActive((index) => (index + 1) % count), 3600);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible && !target.parentElement?.querySelector(":focus-visible")) setStopped(false);
      sync();
    }, { threshold: 0 });
    observer.observe(target);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [stopped, count]);
  return <section className={photos ? "ticket-apple-highlights ticket-photo-deck" : "ticket-apple-highlights"} aria-labelledby={headingId}>

    <div className="ticket-apple-highlights-content">
    <div className="ticket-apple-highlights-heading">
      <h2 id={headingId}>{photos ? "From submitted to ready." : "Everything in the right place."}</h2>
    </div>

    <div className="ticket-apple-highlights-scene">
      <div ref={stage} onFocus={(event) => { if (event.target.matches(":focus-visible")) setStopped(true); }} className="ticket-apple-feature-stage" role="group" aria-label={photos ? "Photo preparation steps" : "Photo preparation features"} aria-roledescription="carousel">
        {cards.map((feature, index) => {
          const offset = getOffset(index, active, count);
          const distance = Math.abs(offset);
          const Icon = feature.Icon;
          return <button
            className={`ticket-apple-feature-card${offset === 0 ? " is-active" : ""}`}
            key={feature.shortTitle}
            data-offset={offset}
            type="button"
            aria-pressed={offset === 0}
            aria-label={`${index + 1} of ${count}: ${feature.shortTitle}`}
            aria-hidden={distance > 2}
            tabIndex={distance > 2 ? -1 : 0}
            onClick={() => { setStopped(true); setActive(index); }}
            style={{
              "--feature-offset": offset,
              "--feature-x": `${offset * 72}%`,
              "--feature-y": `${distance * 13}px`,
              "--feature-rotation": `${offset * -17}deg`,
              "--feature-scale": 1 - distance * 0.1,
              transform: "translate(-50%,-50%) translateX(var(--feature-x)) translateY(var(--feature-y)) rotateY(var(--feature-rotation)) scale(var(--feature-scale))",
              opacity: distance === 0 ? 1 : distance === 1 ? 0.72 : distance === 2 ? 0.34 : 0,
              zIndex: 10 - distance,
              pointerEvents: distance > 2 ? "none" : "auto",
            } as CSSProperties}
          >
            {feature.image ? <span className="ticket-photo-deck-image"><Image src={feature.image} fill sizes="(max-width: 680px) 78vw, 540px" alt="" /></span> : <span className="ticket-apple-feature-card-top"><Icon size={27} weight="bold" /></span>}
            <span className="ticket-apple-feature-card-copy">
              <strong>{feature.title}</strong>
              <span className="ticket-apple-feature-description">{feature.description}</span>

            </span>
          </button>;
        })}
      </div>

      <div className="ticket-apple-feature-navigation ticket-feature-arrows" onFocus={() => setStopped(true)}>
        <button className="ticket-apple-feature-step" type="button" aria-label={photos ? "Previous photo" : "Previous feature"} onClick={() => { setStopped(true); setActive((index) => (index + count - 1) % count); }}>
          <ArrowLeft size={17} weight="bold" />
        </button>
        <button className="ticket-apple-feature-step" type="button" aria-label={photos ? "Next photo" : "Next feature"} onClick={() => { setStopped(true); setActive((index) => (index + 1) % count); }}>
          <ArrowRight size={17} weight="bold" />
        </button>
      </div>
      <p className="ticket-apple-feature-live" aria-live={stopped ? "polite" : "off"}>{activeFeature.shortTitle}: {activeFeature.description}</p>
    </div>
    </div>
  </section>;
}








