export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <span
        aria-hidden="true"
        className="mt-2 block h-7 w-[2px] shrink-0 bg-op-accent"
      />
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 font-op-mono text-[12px] uppercase tracking-[0.18em] text-op-text-3">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-[28px] leading-[1.2] font-semibold text-op-text">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-[60ch] text-[16px] leading-[1.6] text-op-text-2">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
