"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const IMAGE_URLS = [
  "/images/camera-demo-upright.webp",
  "/images/canvas-landscape-fashion-extended.png",
  "/images/canvas-square-sneaker.jpg",
  "/images/canvas-original-bag.jpg",
];

const TOTAL = IMAGE_URLS.length;
const Z_FAR = -2400;
const Z_NEAR = 620;
const RANGE = Z_NEAR - Z_FAR;
const DURATION = 16;
const FADE_IN = 0.06;
const FADE_OUT = 0.04;

function opacityForProgress(progress: number) {
  if (progress < FADE_IN) return Math.max(0, progress / FADE_IN);
  if (progress > 1 - FADE_OUT) return Math.max(0, (1 - progress) / FADE_OUT);
  return 1;
}

function getLayout() {
  const width = window.innerWidth;
  const planeW = width < 768 ? Math.min(width * 0.26, 200) : Math.min(width * 0.26, 440);
  return {
    planeW,
    planeH: planeW * (4 / 3),
    offsetX: width * 0.33,
    angle: 24,
  };
}

export function Endless() {
  const worldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;

    const planes = Array.from(world.querySelectorAll<HTMLElement>(".endless-plane"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tweens: gsap.core.Tween[] = [];

    gsap.set(world, { force3D: true });

    const applyLayout = () => {
      const { planeW, planeH, offsetX, angle } = getLayout();
      planes.forEach((plane, index) => {
        const isLeft = index % 2 === 0;
        plane.style.width = `${planeW}px`;
        plane.style.height = `${planeH}px`;
        gsap.set(plane, {
          xPercent: -50,
          yPercent: -50,
          x: isLeft ? -offsetX : offsetX,
          y: 0,
          rotationY: isLeft ? angle : -angle,
          force3D: true,
        });
      });
    };

    applyLayout();

    planes.forEach((plane, index) => {
      const img = plane.querySelector("img") as HTMLImageElement;
      const startProgress = index / TOTAL;

      gsap.set(plane, { z: Z_FAR + startProgress * RANGE });
      img.style.opacity = String(opacityForProgress(startProgress));
      plane.style.zIndex = String(Math.round(startProgress * 1000));

      if (reduceMotion) return;

      const tween = gsap.fromTo(
        plane,
        { z: Z_FAR },
        {
          z: Z_NEAR,
          duration: DURATION,
          ease: "none",
          repeat: -1,
          immediateRender: false,
          onUpdate() {
            const progress = this.progress();
            img.style.opacity = String(opacityForProgress(progress));
            plane.style.zIndex = String(Math.round(progress * 1000));
          },
        },
      );

      tween.progress(startProgress);
      tweens.push(tween);
    });

    window.addEventListener("resize", applyLayout);

  
    return () => {
      window.removeEventListener("resize", applyLayout);
      tweens.forEach((tween) => tween.kill());
    };
  }, []);

  return (
    <div className="ticket-endless-corridor" aria-hidden="true">
      <div className="endless-scene">
        <div className="endless-world" ref={worldRef}>
          {IMAGE_URLS.map((url) => (
            <div className="endless-plane" key={url}>
              <img src={url} alt="" decoding="async" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
