export function ArchDiagram({ children, label }: { children: string; label?: string }) {
  return (
    <figure
      className="rounded-md border border-op-line bg-op-surface-2/60 p-4 sm:p-5"
      aria-label={label ?? "Architecture diagram"}
    >
      <pre className="overflow-x-auto font-op-mono text-[12.5px] leading-[1.7] text-op-text-2">
        <code>{children}</code>
      </pre>
    </figure>
  );
}
