# TicketStandard AI

TicketStandard prepares customer-submitted photos for consistent review. It corrects the displayed orientation, fits the full image to a standard canvas without cropping, converts the output format, and shows a before-and-after comparison. The original stays available and is never overwritten.

## Start the app

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Current workflow

- Select a JPEG, PNG, or WebP image up to 40 MB.
- Choose a square, portrait, landscape, or original-size canvas.
- Preserve the whole photo with proportional fitting and padding when its shape differs from the canvas.
- Export as PNG, JPEG, or WebP. JPEG transparency uses the selected solid background.
- Compare the original and prepared copy, review the changes, and download a separate file.

Standardization runs in the browser. The prototype does not upload images to application storage, retain user files, authenticate accounts, or keep a persistent change history. Local blur repair uses the open-source [NAFNet GoPro model](https://github.com/megvii-research/NAFNet) on this PC. Install Python 3.11, then run `npm run ai:setup` once to install the CPU runtime and download the model (about 270 MB); start the app with `npm run dev`. Blur repair needs no provider account or per-image API charge; the first repair can take a while on CPU. Image expansion is separate and still needs a configured provider; the original photo is sent to that provider when expansion runs.

Local model files are stored in `local_ai/models/` and ignored by Git. The app runs the local inference service on `127.0.0.1` only.

## Project notes

- Main routes: `/` product overview and `/workspace` image workflow.
- The former event-management workspace remains in the source tree as an archive while this project is repurposed.
- See [`docs/superpowers/plans/2026-11-15-ticketstandard-workflow.md`](./docs/superpowers/plans/2026-11-15-ticketstandard-workflow.md) for the implementation sequence.
- See [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) for reused open-source package notices.
