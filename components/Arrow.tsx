// Dibujada en SVG: los caracteres ↗ ← → ↑ se pintan como emoji en iPhone.
const paths = {
  "up-right": "M3.5 12.5l9-9M5.5 3.5h7v7",
  right: "M2 8h12M9 3l5 5-5 5",
  left: "M14 8H2M7 3L2 8l5 5",
  up: "M8 14V2M3 7l5-5 5 5",
} as const;

export function Arrow({ direction = "up-right", className = "" }: { direction?: keyof typeof paths; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={`inline-block size-[0.75em] shrink-0 ${className}`}
    >
      <path d={paths[direction]} />
    </svg>
  );
}
