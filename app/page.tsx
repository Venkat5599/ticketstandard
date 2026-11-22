import Image from "next/image";
import Link from "next/link";
import { Browser, FileImage, SlidersHorizontal } from "@phosphor-icons/react/dist/ssr";
import { LandingCanvasOptions } from "@/components/landing-canvas-options";
import { LandingPhotoCarousel } from "@/components/landing-photo-carousel";
import { LandingHalftoneFooter } from "@/components/landing-halftone-footer";
import { LandingHeroPreview, WatchDemoButton } from "@/components/landing-hero-preview";
import { PreparePhotoLink } from "@/components/prepare-photo-link";
import { TicketTitleIntro } from "@/components/ticket-title-intro";

export default function Home() {
  return (
    <main id="top" className="ticket-apple-page">
      <TicketTitleIntro waitForCamera label="Loading home…" />
      <div className="ticket-apple-first-view has-studio-preview">
        <header className="ticket-apple-nav">
          <Link href="/" className="ticket-apple-wordmark ticket-apple-brand-lockup" aria-label="TicketStandard home">
            <Image src="/images/ticketstandard-wordmark.png" alt="" width={2172} height={724} priority />
          </Link>
        </header>
        <section className="ticket-apple-hero ticket-comparison-hero" aria-labelledby="ticket-apple-title">
          <div className="ticket-apple-hero-copy">
            <h1 id="ticket-apple-title">Customer photos.<br /><span className="hero-ink-bleed">Ready for review.</span></h1>
            <p>Turn inconsistent customer photos into review-ready copies for support tickets.</p>
            <div className="hero-demo-actions">
            <PreparePhotoLink />
            <WatchDemoButton />
            </div>
          </div>
          <LandingHeroPreview />
        </section>
      </div>
      <div className="ticket-apple-feature-continuum">
        <LandingPhotoCarousel />
        <section className="landing-benefits" aria-label="Editing and export features">
          <ul>
            <li className="landing-info-card">
              <SlidersHorizontal size={20} aria-hidden="true" />
              <h3>Fine-tune the photo</h3><p>Adjust exposure, contrast, and color.</p>
            </li>
            <li className="landing-info-card">
              <FileImage size={20} aria-hidden="true" />
              <h3>Export a copy</h3><p>Save as PNG, JPEG, or WebP and keep your original.</p>
            </li>
            <li className="landing-info-card">
              <Browser size={20} aria-hidden="true" />
              <h3>Edit in your browser</h3><p>Standard adjustments run on your device.</p>
            </li>
          </ul>
        </section>
      </div>
      <LandingCanvasOptions />
      <LandingHalftoneFooter />
    </main>
  );
}
