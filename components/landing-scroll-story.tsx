import { ScrollGallery } from "@/components/sora-ui/blocks/scroll-gallery";

const legoPhoto = "/images/lego-kit-widescreen-photo.png";
const legoRotatedFitPhoto = "/images/lego-kit-rotated-fit.jpg";
const tiltedOriginalPhoto = "/images/lego-kit-original-tilted.png";

const slides = [
  {
    title: "Original picture",
    image: tiltedOriginalPhoto,
    url: "/workspace",
    linkLabel: "Try it with a photo",
    // The supplied original already has the intended slight tilt and soft focus.
    // Keep its transparent edges so the preceding section's scene can show through.
    rotation: 0,
    mediaScale: 1,
    backgroundColor: "transparent",
  },
  {
    title: "Rotated and properly fit",
    image: legoRotatedFitPhoto,
    url: "/workspace",
    linkLabel: "Try it with a photo",
    // This supplied frame is already level; keep the whole image uncropped.
    rotation: 0,
    mediaScale: 1,
    backgroundColor: "transparent",
  },
  {
    title: "Upscaled and refined",
    image: legoPhoto,
    url: "/workspace",
    linkLabel: "Try it with a photo",
    rotation: 0,
    mediaScale: 1,
    backgroundColor: "transparent",
  },
];

export function LandingScrollStory() {
  return <ScrollGallery
    ariaLabel="How TicketStandard prepares a customer photo"
    className="ticket-apple-story"
    id="the-whole-photo"
    slides={slides}
    variant="studio"
    showInfoBand
    prefixLabel="Photo preparation"
    showLink
    stripsCount={8}
    scrollPerTransition={215}
    scrub={1.1}
    timing={{ initialDelay: 55, finalDelay: 65, slideHold: 95, stripRevealSpeed: 1.8, titleChangeThreshold: 0.46, titleDuration: 0.32, titleOffset: "100%", scaleFrom: 1, scaleTo: 1 }}
    classNames={{
      images: "ticket-apple-scroll-images",
      imageFrame: "ticket-apple-scroll-layer",
      image: "ticket-apple-scroll-image",
      info: "ticket-gallery-caption",
    }}
  />;
}


