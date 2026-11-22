"use client";

import Image from "next/image";
import { ImageSquare, Ruler, SlidersHorizontal } from "@phosphor-icons/react";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const slides = [
  { icon: ImageSquare, title: "Original", state: "original", alt: "Tilted overview of a model kit and its numbered parts bags on a table" },
  { icon: Ruler, title: "Straighten", state: "upright", alt: "Level view of the model kit spread across the table" },
  { icon: SlidersHorizontal, title: "Refine", state: "refined", alt: "Side-by-side close-ups of parts bag number two, before and after sharpening" },
];
const reelImages = [
  { name: "sports-car", file: "film-reel-sports-car.webp" },
  { name: "chanel-bag", file: "film-reel-quilted-bag.webp" },
  { name: "speaker", file: "film-reel-speaker.webp" },
  { name: "rayban", file: "film-reel-sunglasses.webp" },
  { name: "louis-bag", file: "film-reel-camera.webp" },
  { name: "headphones", file: "film-reel-headphones.webp" },
  { name: "macbook", file: "film-reel-laptop.webp" },
];
const reelFrames = Array.from({ length: 2 }, (_, copy) =>
  reelImages.map(image => ({ ...image, key: `${copy}-${image.name}` }))
).flat().reverse();

export function LandingPhotoCarousel() {
  const [active, setActive] = useState(0);
  const sequence = useRef<HTMLDivElement>(null);
  const start = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [selection, setSelection] = useState(0);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [tabVisible, setTabVisible] = useState(false);
  const move = (offset: number) => {
    setSelection(value => value + 1);
    setActive(index => (index + offset + slides.length) % slides.length);
  };

  useEffect(() => {
    const stage = sequence.current?.querySelector(".proof-stage");
    if (!stage) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setMotionAllowed(!motion.matches);
    const syncTab = () => setTabVisible(!document.hidden);
    const play = () => { setSelection(0); setActive(0); };
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.intersectionRatio >= .6);
      if (!entry.isIntersecting) setSelection(0);
    }, { threshold: [0, .6] });
    observer.observe(stage);
    syncMotion();
    syncTab();
    motion.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncTab);
    window.addEventListener("ticketstandard:play-demo", play);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncTab);
      window.removeEventListener("ticketstandard:play-demo", play);
    };
  }, []);

  useEffect(() => {
    if (!visible || !tabVisible || !motionAllowed) return;
    const timer = window.setTimeout(() => {
      setSelection(0);
      setActive(index => (index + 1) % slides.length);
    }, selection ? 4200 : 2800);
    return () => window.clearTimeout(timer);
  }, [visible, tabVisible, selection, motionAllowed, active]);

  return (
    <div className="landing-demo-sequence" ref={sequence}>
            <div className="landing-film-scene" aria-hidden="true">
              <div className="landing-film-viewport">
                <div className="landing-film-strip" style={{ "--reel-frames": reelImages.length, "--reel-track-frames": reelFrames.length } as CSSProperties}>
                  {reelFrames.map((image, index) => (
                    <span key={image.key} data-reel-image={image.name} className="landing-film-cell" style={{ "--frame-index": index } as CSSProperties}>
                      <span className="landing-film-aperture"><Image loading="eager" decoding="async" src={`/images/${image.file}`} alt="" fill sizes="(max-width: 760px) 38vw, (max-width: 1600px) 25vw, 400px" /></span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
    <section className="proof-demo" aria-labelledby="the-whole-photo">
      <header>
        <h2 id="the-whole-photo">From submitted to ready.</h2>
        <p>Straighten the tabletop photo, then sharpen the bag numbers and small parts for review.</p>
      </header>
      <div className="proof-player" id="photo-demo-preview"
        onKeyDown={event => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            move(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}>
        <div className="proof-stage" data-step={active}
          onPointerDown={event => {
            start.current = event.clientX;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerCancel={() => { start.current = null; }}
          onPointerUp={event => {
            const delta = event.clientX - (start.current ?? event.clientX);
            start.current = null;
            if (Math.abs(delta) >= 50) move(delta < 0 ? 1 : -1);
          }}>
          <div className="proof-mat" role="img" aria-label={slides[active].alt}>
            <Image src="/images/lego-kit-rotated-fit.jpg" width={1795} height={876} alt=""
              sizes="(max-width: 650px) 100vw, 850px" draggable={false} />
            {active === 2 && <div className="bag-comparison">
              {(["before","refined"] as const).map(version => <figure key={version}>
                <Image src={`/images/bag-detail-${version}.webp`} width={258} height={232} alt="" draggable={false} />
                <figcaption>{version === "before" ? "Before" : "Refined"}</figcaption>
              </figure>)}
            </div>}
          </div>
        </div>
        <div className="proof-edit-tools" role="group" aria-label="Photo preparation steps">
          {slides.map((slide,index) => (
            <button key={slide.state} type="button" aria-current={active === index ? "step" : undefined}
              onClick={() => { setSelection(value => value + 1); setActive(index); }}>
              <slide.icon aria-hidden="true" size={18} weight={active === index ? "bold" : "regular"} />
              {slide.title}
            </button>
          ))}

        </div>
        <p className="sr-only" aria-live={selection ? "polite" : "off"}>{slides[active].title}</p>
      </div>
    </section>
    </div>
  );
}
