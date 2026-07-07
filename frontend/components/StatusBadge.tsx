import clsx from "clsx";

export function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "APPROVED" || status === "PUBLISHED" || status === "PAID" || status === "DELIVERED"
      ? "bg-pine/10 text-pine"
      : status === "PENDING" || status === "DRAFT" || status === "SHIPPED"
        ? "bg-gold/20 text-ink"
        : "bg-ember/10 text-ember";

  return (
    <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]", styles)}>
      {status}
    </span>
  );
}
