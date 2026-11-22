# TicketStandard landing glass implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the TicketStandard landing page with warm readable glass information cards and a truthful canvas/format showcase.

**Architecture:** Keep the current server-rendered landing and scroll story. Refine the shared client-only glass backdrop to size correctly for pill and rounded card surfaces; use CSS fallback layers for stable rendering and semantic markup for new canvas details. No workspace changes.

**Tech Stack:** Next.js 15, React 19, TypeScript, CSS, Phosphor icons, `liquid-glass-react`.

**Spec:** `docs/superpowers/specs/2026-11-15-ticketstandard-landing-glass-design.md`

## Global Constraints

- Keep dark action buttons unchanged.
- Use warm translucent amber-to-smoky glass for information cards only.
- Keep copy readable and white on glass; maintain a CSS fallback if the glass effect is unavailable.
- Do not claim functionality beyond the existing image presets and export formats.
- Do not modify the workspace route or its components.

## Review Focus

- Glass overlay must align with the surface bounds and rounded corners at desktop and mobile widths.
- Text must stay on top of the glass effect and remain readable against photo backgrounds.
- Reduced-motion mode must preserve the glass fallback and hide only decorative motion.
- The canvas dimensions and output formats must match the workspace presets.
- New sections must not introduce horizontal overflow or duplicate button styles.

---

### Task 1: Make the glass backdrop support rounded information cards

**Files:**
- Modify: `components/landing-glass-backdrop.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Add a numeric corner radius prop while preserving existing pill defaults.
- Keep client-only rendering and the CSS glass fallback.

- [ ] Set the liquid glass bounds to the complete wrapper and pass the requested corner radius.
- [ ] Add warm tinted fallback styles for rounded cards without changing the dark CTA treatment.
- [ ] Keep foreground card content above the glass effect.

### Task 2: Add canvas and output-format story to the landing page

**Files:**
- Create: `components/landing-canvas-options.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Render four non-interactive canvas options matching the existing presets.
- Render PNG, JPEG, and WebP as supported output formats.
- Link the section's action to `/workspace`.

- [ ] Add an editorial section with a photo-backed warm glass panel and four preset cards.
- [ ] Add a concise output-format line with the supported types.
- [ ] Add responsive and reduced-motion behavior for the new section.

### Task 3: Apply the supplied glass treatment to existing informational panels

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/landing-scroll-story.tsx`
- Modify: `app/globals.css`

- [ ] Restyle the feature panel, original-untouched note, story status label, and privacy close card with the same warm glass material.
- [ ] Preserve existing dark buttons exactly.
- [ ] Confirm the visual hierarchy and text contrast at desktop and mobile sizes.

### Task 4: Verify the page and refreshed preview

**Files:**
- No additional files.

- [ ] Run `npx tsc --noEmit` and `npm run build`.
- [ ] Inspect the rendered landing page at desktop and mobile sizes.
- [ ] Confirm `/workspace` still builds and remains untouched.
