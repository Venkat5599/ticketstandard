# TicketStandard Workflow Implementation Plan

**Goal:** Convert the existing Voyage landing page and workspace into TicketStandard’s safe, local image-standardization MVP. AI image expansion is deferred to a later phase.

**Architecture:** Keep the existing Next.js/React app and its landing/workspace structure. Add a browser-side image-processing module for upload validation, orientation-aware decoding, contain/pad sizing, previews, and download. No image is sent to a server in this phase.

**Tech Stack:** Next.js 15, React 19, TypeScript, CSS, Framer Motion scroll values, browser Canvas/ImageBitmap, `image-resize-compress`, and `liquid-glass-react` for the landing page.

**Current visual scope:** The landing page now uses an Apple-inspired product story with scroll-linked photo motion and a restrained use of `liquid-glass-react`. Keep the workspace UI as it is until the user supplies its design.

**Spec:** `C:\Users\yeshw\Downloads\TicketStandard_AI_Redesign_Plan.md`

## Global Constraints

- Reuse the existing Voyage landing and workspace structure; do not scaffold a separate frontend.
- Preserve the original upload; standardize with contain/padding by default and never crop silently.
- Keep normal image processing in the browser; never log image contents.
- Do not implement or expose AI expansion in this phase.
- Keep the workspace solid, minimal, readable, responsive, and respectful of reduced motion.
- Keep the landing page image-led, with no section navigation; make scroll motion smooth and reduced-motion aware.
- Do not add or run automated tests unless requested; use a production build as a compile check.

## Review Focus

- Corrupt, unsupported, oversized, or extremely large images should fail with a useful message before expensive processing.
- EXIF-rotated images should appear upright and export with the same visible orientation.
- Portrait/landscape fit must preserve all pixels without distortion or crop.
- Transparent images exported as JPEG need a deliberate background color.
- AI output must not replace source pixels, even if the model alters the center of its returned canvas.

---

### Task 1: Replace event landing and role workspace with TicketStandard surfaces

**Files:** `app/page.tsx`, `app/layout.tsx`, `components/workspace-shell.tsx`, `components/landing-role-buttons.tsx`, `components/ticketstandard-workspace.tsx` (new), `app/globals.css`.

**Interfaces:** Landing CTA links to `/workspace`. Workspace shell renders one TicketStandard image workspace; no role selection.

- [x] Replace the landing page with a photo-led TicketStandard story, responsive comparison visuals, and a direct workspace CTA; remove section navigation.
- [x] Add a scroll-linked orientation and fit story, plus restrained Liquid Glass surfaces for landing actions and status.
- [x] Create a single workspace with upload, settings, comparison canvas, change summary, and download regions.
- [x] Remove the artificial role-switch delay and use direct, truthful processing state.
- [x] Update app metadata and global styling to TicketStandard's solid, minimal visual direction; avoid accumulating event CSS overrides.

### Task 2: Implement local standardization

**Files:** `lib/ticketstandard/image-processing.ts` (new), `components/ticketstandard-workspace.tsx`, `app/globals.css`.

**Interfaces:**

```ts
type ImagePreset = "square" | "portrait" | "landscape" | "original";
type OutputFormat = "image/png" | "image/jpeg" | "image/webp";
type ProcessedImage = { blob: Blob; width: number; height: number; format: OutputFormat; changes: string[] };
async function standardizeImage(file: File, preset: ImagePreset, format: OutputFormat, background: string): Promise<ProcessedImage>;
```

- [x] Validate MIME, byte size (40 MB max), decoded pixels, and safe decoding.
- [x] Decode with browser orientation handling, then fit proportionally and pad to square 1024×1024, portrait 1024×1280, landscape 1280×1024, or original dimensions.
- [x] Encode PNG/JPEG/WebP; use the selected neutral background for JPEG transparency; return truthful change notes.
- [x] Wire picker, drag/drop, replace, preset changes, preview URL cleanup, output details, and separate download filename.

### Later phase: AI expansion (deferred)

Do not include AI controls, provider route, API-key fields, or image transfer in the current MVP. Revisit only after the standardization flow is stable and its privacy and evidence implications are reviewed.

Potential future research: compare open-source outpainting projects, provider choices, privacy disclosures, and image-evidence safeguards before adding AI.

### Task 3: Finish responsive states and production compile check

**Files:** `components/ticketstandard-workspace.tsx`, `app/globals.css`, `README.md`.

- [ ] Confirm keyboard-accessible controls, readable mobile stacking, reduced-motion behavior, empty/processing/ready/error states.
- [x] Update README from Voyage event platform to TicketStandard AI, documenting local standardization.
- [ ] Finish `npm run build` and resolve any remaining compilation issues.
