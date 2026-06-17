import { type ImgHTMLAttributes } from "react";

type Ratio = "portrait" | "square" | "wide" | "video";

const ratioClass: Record<Ratio, string> = {
  portrait: "aspect-[4/5]",
  square: "aspect-square",
  wide: "aspect-[16/9]",
  video: "aspect-video",
};

type ImageSlotProps = {
  label: string;
  caption?: string;
  ratio?: Ratio;
  src?: string;
  alt?: string;
  className?: string;
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
};

/**
 * Operator-styled image placeholder.
 * Replace `src` later with the real asset; the surrounding frame stays.
 */
export function ImageSlot({
  label,
  caption,
  ratio = "wide",
  src,
  alt,
  className = "",
  imgProps,
}: ImageSlotProps) {
  return (
    <figure
      data-image-slot={label}
      className={`group relative overflow-hidden border border-op-line bg-op-surface ${className}`}
    >
      <div className={`relative ${ratioClass[ratio]} w-full`}>
        {src ? (
          <img
            src={src}
            alt={alt ?? label}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            {...imgProps}
          />
        ) : (
          <>
            <div aria-hidden="true" className="absolute inset-0 op-grid-backdrop opacity-50" />
            <div aria-hidden="true" className="absolute inset-0">
              <svg
                className="h-full w-full text-op-line"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.4" />
                <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.4" />
              </svg>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
              <span className="font-op-mono text-[11px] uppercase tracking-[0.22em] text-op-text-3">
                // image slot
              </span>
              <span className="font-op-mono text-[13px] text-op-text-2">{label}</span>
              {caption ? (
                <span className="max-w-[34ch] px-4 font-op-mono text-[11px] text-op-text-3">
                  {caption}
                </span>
              ) : null}
            </div>
          </>
        )}
      </div>
      <figcaption className="flex items-center justify-between border-t border-op-line px-3 py-2 font-op-mono text-[11px] text-op-text-3">
        <span className="truncate">// {label}</span>
        <span aria-hidden="true">{src ? "▣" : "□"}</span>
      </figcaption>
    </figure>
  );
}
