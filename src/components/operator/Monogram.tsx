type Props = { size?: number; className?: string };

/**
 * Geometric "IW" monogram — built from clean lines, no decoration.
 * Reads as a system icon, not a personal logo.
 */
export function Monogram({ size = 28, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="square"
      aria-hidden="true"
      className={className}
    >
      {/* I */}
      <path d="M5 6 L5 26" />
      <path d="M3 6 L7 6" />
      <path d="M3 26 L7 26" />
      {/* W */}
      <path d="M12 6 L15 26 L19 14 L23 26 L26 6" />
    </svg>
  );
}
