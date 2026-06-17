export function TechPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-op-accent/50 bg-transparent px-2 py-0.5 font-op-mono text-[12px] font-medium text-op-accent">
      {children}
    </span>
  );
}

export function TechPillRow({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
      {items.map((t) => (
        <li key={t}>
          <TechPill>{t}</TechPill>
        </li>
      ))}
    </ul>
  );
}
