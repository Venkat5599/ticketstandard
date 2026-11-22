"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

export function LandingPhotoComparison() {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);

  const moveTo = (clientX: number, element: HTMLDivElement) => {
    const bounds = element.getBoundingClientRect();
    setPosition(Math.min(100, Math.max(0, ((clientX - bounds.left) / bounds.width) * 100)));
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragging.current = true;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    moveTo(event.clientX, event.currentTarget);
  };

  const continueDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) moveTo(event.clientX, event.currentTarget);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const delta = event.shiftKey ? 10 : 2;
    if (event.key === "ArrowLeft") setPosition((value) => Math.max(0, value - delta));
    else if (event.key === "ArrowRight") setPosition((value) => Math.min(100, value + delta));
    else if (event.key === "Home") setPosition(0);
    else if (event.key === "End") setPosition(100);
    else return;
    event.preventDefault();
  };

  return <section className="ticket-apple-compare" aria-labelledby="ticket-apple-compare-title">
    <div className="ticket-apple-compare-heading">
      <p>Original and prepared</p>
      <h2 id="ticket-apple-compare-title">A clear before<br />and after.</h2>
      <span>Slide to compare the untouched photo with its upright, fitted copy.</span>
    </div>

    <div
      className={`ticket-apple-compare-frame${isDragging ? " is-dragging" : ""}`}
      onPointerDown={startDrag}
      onPointerMove={continueDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <Image className="ticket-apple-compare-final-image" src="/images/support-ticket-example.webp" alt="Final output: the full customer photo, upright and fitted to the frame" fill sizes="(max-width: 700px) 100vw, 1240px" draggable={false} />
      <div className="ticket-apple-compare-original-layer" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image className="ticket-apple-compare-original-image" src="/images/support-ticket-example.webp" alt="Original customer photo shown rotated sideways" width={1448} height={1086} sizes="(max-width: 700px) 100vw, 1240px" draggable={false} />
      </div>

      <span className="ticket-apple-compare-label is-original">Original photo</span>
      <span className="ticket-apple-compare-label is-final">Final output</span>

      <div
        className="ticket-apple-compare-divider"
        style={{ left: `${position}%` }}
        role="slider"
        tabIndex={0}
        aria-label="Compare original photo with final output"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
      >
        <span className="ticket-apple-compare-handle"><ArrowLeft size={14} weight="bold" /><ArrowRight size={14} weight="bold" /></span>
      </div>
    </div>
  </section>;
}
