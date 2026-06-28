type Props = { size?: number; className?: string };

/**
 * Geometric "IW" monogram — built from clean lines, no decoration.
 * Reads as a system icon, not a personal logo.
 */
export function Monogram({ size = 28, className }: Props) {
  return (
    <img src="/favicon.svg" width={size} height={size} alt="Operator Logo" className={className} />
  );
}
