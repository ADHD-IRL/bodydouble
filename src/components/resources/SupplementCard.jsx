import { Pill, ShieldCheck, Download } from "lucide-react";

// Evidence strength → calm green/blue accent (never a "warning" red/amber).
const EVIDENCE_META = {
  "Well-studied": "var(--rx-forest)",
  "Moderate evidence": "var(--rx-blue)",
  Emerging: "var(--rx-cyan)",
};

function EvidenceBadge({ level }) {
  const accent = EVIDENCE_META[level] || EVIDENCE_META.Emerging;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.08em]"
      style={{
        color: `hsl(${accent})`,
        backgroundColor: `hsl(${accent} / 0.08)`,
        borderColor: `hsl(${accent} / 0.35)`,
        borderWidth: "1px",
      }}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: `hsl(${accent})` }}
      />
      {level}
    </span>
  );
}

export default function SupplementCard({ supplement }) {
  return (
    <article
      className="flex h-full flex-col rounded-xl border bg-[hsl(var(--rx-surface))] p-5"
      style={{ borderColor: "hsl(var(--rx-line))" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundColor: "hsl(var(--rx-cyan) / 0.1)",
              color: "hsl(var(--rx-cyan))",
            }}
          >
            <Pill className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-serif text-lg leading-tight text-[hsl(var(--rx-ink))]">
              {supplement.name}
            </h3>
            <p className="text-xs text-[hsl(var(--rx-ink-faint))]">{supplement.supports}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <EvidenceBadge level={supplement.evidenceLevel} />
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.08em] text-[hsl(var(--rx-ink-faint))]">
          {supplement.relatedArea}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--rx-ink-soft))]">
        {supplement.summary}
      </p>

      {/* Safety-first considerations callout */}
      <div
        className="mt-4 flex gap-2.5 rounded-lg px-3.5 py-3"
        style={{ backgroundColor: "hsl(var(--rx-surface-2))" }}
      >
        <ShieldCheck
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 shrink-0"
          style={{ color: "hsl(var(--rx-forest))" }}
        />
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--rx-forest))]">
            Good to know
          </p>
          <p className="mt-1 text-[0.82rem] leading-relaxed text-[hsl(var(--rx-ink-soft))]">
            {supplement.considerations}
          </p>
        </div>
      </div>

      {supplement.downloadUrl && (
        <div className="mt-auto pt-4">
          <a
            href={supplement.downloadUrl}
            download
            className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium text-[hsl(var(--rx-cyan))] transition-colors hover:bg-[hsl(var(--rx-cyan-soft))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--rx-cyan))]"
            style={{ borderColor: "hsl(var(--rx-cyan) / 0.4)" }}
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            Download guide
            <span className="sr-only">: {supplement.name}</span>
          </a>
        </div>
      )}
    </article>
  );
}
