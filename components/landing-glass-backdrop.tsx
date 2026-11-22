type LandingGlassBackdropProps = {
  className?: string;
  cornerRadius?: number;
  treatment?: "control" | "card";
};

/**
 * A stable CSS liquid-glass surface for the landing page. The SVG displacement
 * effect from liquid-glass-react creates harsh dot artifacts over the supplied
 * high-contrast halftone, so this uses real backdrop blur and specular layers.
 */
export function LandingGlassBackdrop({ className = "", cornerRadius, treatment = "control" }: LandingGlassBackdropProps) {
  return <span
    className={`ticket-apple-glass-effect ${className}`}
    data-treatment={treatment}
    aria-hidden="true"
    style={{ borderRadius: cornerRadius ? `${cornerRadius}px` : "inherit" }}
  />;
}
