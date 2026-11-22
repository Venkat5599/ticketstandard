"use client";

import Image from "next/image";
import { useState } from "react";

export function LandingHeroDemo() {
  const [play, setPlay] = useState(0);

  return (
    <figure className="ticket-hero-demo">
      <div className="ticket-hero-demo-frame">
        <div key={play} className="ticket-hero-demo-photo">
          <Image
            src="/images/support-ticket-example.webp"
            alt="Customer photo of a chipped mug in its shipping box, straightened and fitted to a frame"
            fill
            priority
            sizes="(max-width: 720px) 90vw, 620px"
          />
        </div>
      </div>
      <figcaption>
        <span>From submitted to review-ready</span>
        <button type="button" onClick={() => setPlay((count) => count + 1)}>Replay demo</button>
      </figcaption>
    </figure>
  );
}
