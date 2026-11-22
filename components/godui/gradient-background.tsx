import type { CSSProperties } from "react";

type GradientBackgroundProps = {
  className?: string;
  style?: CSSProperties;
};

export function GradientBackground({ className = "", style }: GradientBackgroundProps) {
  return <div aria-hidden="true" className={`voyage-gradient-background ${className}`} style={style} />;
}
