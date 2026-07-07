export function SectionTitle({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ember">{eyebrow}</p>
      <h2 className="text-3xl font-black text-ink sm:text-4xl">{title}</h2>
      {description ? <p className="max-w-3xl text-base text-ink/65">{description}</p> : null}
    </div>
  );
}
