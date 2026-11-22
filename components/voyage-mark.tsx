export const VOYAGE_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#22221e" d="M5 10h10l7 12-8 11-7-4z"/><path fill="#383731" d="M15 10h10l7 11-8 10-8-7 5-5z"/><path fill="#bd3027" d="m27 19 16-7-4 19-13 6-7-7z"/><path fill="#f0eee7" d="m15 10 7 12-8 11 4-12z"/></svg>`;

export function VoyageMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" role="img" aria-label="Voyage mark" xmlns="http://www.w3.org/2000/svg">
      <path fill="#22221e" d="M5 10h10l7 12-8 11-7-4z" />
      <path fill="#383731" d="M15 10h10l7 11-8 10-8-7 5-5z" />
      <path fill="#bd3027" d="m27 19 16-7-4 19-13 6-7-7z" />
      <path fill="#f0eee7" d="m15 10 7 12-8 11 4-12z" />
    </svg>
  );
}
