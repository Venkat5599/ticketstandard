# TicketStandard landing page and glass surface design

## Intent

Expand the TicketStandard landing page with a clearer feature sequence inspired by MacBook Neo, while matching the supplied warm liquid-glass card reference. The landing page should explain the existing photo workflow and its real output sizes and formats. The workspace remains unchanged.

## Goals

- Keep the current landing hero and scroll-based photo transformation story.
- Give informational cards a warm amber-to-smoky translucent surface, visible background blur, a fine pale rim, and legible white content.
- Leave dark action buttons unchanged.
- Add a concise showcase of the app's real canvas presets and export formats.
- Keep the page responsive, keyboard-accessible, and readable with reduced motion or without the liquid-glass enhancement loading.

## Non-goals

- Do not redesign the workspace.
- Do not claim AI expansion, background removal, or other unimplemented behavior.
- Do not add new libraries.

## Approaches

- Apply the warm card treatment to the existing three-feature row and add one grounded canvas-and-format story. This preserves the current page and adds depth without rebuilding its structure.
- Rebuild the landing page as a cinematic product microsite with multiple new animations. This carries more risk and adds complexity beyond the current workflow.

The first approach is selected. The user's reference image and follow-up explicitly approve the warm card surface and specify that the current button treatment stays as-is.

## Design calls

- Use the existing teapot photo as the real background behind the liquid-glass cards, with blur and warm tint so the translucent surface is visible.
- Apply the shared treatment to information cards and status callouts only; preserve dark CTA buttons.
- Show Square (1024 × 1024), Portrait (1024 × 1280), Landscape (1280 × 1024), Original dimensions, and PNG/JPEG/WebP.
- Keep white foreground text and add a dark warm gradient at the lower edge of the card for consistent contrast.

## Constraints

- Keep Next.js, React, existing Phosphor icons, and `liquid-glass-react`.
- Follow reduced-motion preferences and keep a CSS fallback visible before the client-only effect mounts.
- Scope changes to landing page components and styles; do not modify `/workspace`.
