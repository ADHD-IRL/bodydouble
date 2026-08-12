import {
  Activity,
  ScanLine,
  Eye,
  Dna,
  Gauge,
  Cpu,
  Sparkles,
  Info,
  ExternalLink,
} from "lucide-react";

// Modality → icon.
const MODALITY_ICON = {
  "eeg-qeeg": Activity,
  "mri-fmri": ScanLine,
  "eye-tracking": Eye,
  "genetic-polygenic": Dna,
  "continuous-performance-test": Gauge,
  "digital-phenotyping-ml": Cpu,
};

// Research maturity → how many of 3 dots are filled + its accent.
const MATURITY_META = {
  "Research only": { level: 1, accent: "var(--rx-cyan)" },
  Emerging: { level: 2, accent: "var(--rx-blue)" },
  "Clinical adjunct": { level: 3, accent: "var(--rx-forest)" },
};

function MaturityMeter({ maturity }) {
  const { level, accent } = MATURITY_META[maturity] || MATURITY_META["Research only"];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.08em]"
      style={{
        color: `hsl(${accent})`,
        borderColor: `hsl(${accent} / 0.35)`,
        backgroundColor: `hsl(${accent} / 0.08)`,
      }}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: i <= level ? `hsl(${accent})` : `hsl(${accent} / 0.22)`,
            }}
          />
        ))}
      </span>
      {maturity}
    </span>
  );
}

export default function DiagnosticCard({ diagnostic }) {
  const Icon = MODALITY_ICON[diagnostic.id] || ScanLine;

  return (
    <article
      className="flex h-full flex-col rounded-xl border bg-[hsl(var(--rx-surface))] p-5"
      style={{ borderColor: "hsl(var(--rx-line))" }}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{
            backgroundColor: "hsl(var(--rx-forest) / 0.1)",
            color: "hsl(var(--rx-forest))",
          }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-serif text-lg leading-tight text-[hsl(var(--rx-ink))]">
            {diagnostic.modality}
          </h3>
          <p className="text-xs text-[hsl(var(--rx-ink-faint))]">{diagnostic.method}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <MaturityMeter maturity={diagnostic.maturity} />
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.08em] text-[hsl(var(--rx-ink-faint))]">
          {diagnostic.appliesTo}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--rx-ink-soft))]">
        {diagnostic.summary}
      </p>

      {/* Balanced promise / caveat */}
      <dl
        className="mt-4 grid gap-3 border-t pt-4"
        style={{ borderColor: "hsl(var(--rx-line))" }}
      >
        <div className="flex gap-2.5">
          <Sparkles
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: "hsl(var(--rx-cyan))" }}
          />
          <div>
            <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--rx-cyan))]">
              The promise
            </dt>
            <dd className="mt-0.5 text-[0.82rem] leading-relaxed text-[hsl(var(--rx-ink-soft))]">
              {diagnostic.promise}
            </dd>
          </div>
        </div>
        <div className="flex gap-2.5">
          <Info
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: "hsl(var(--rx-forest))" }}
          />
          <div>
            <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--rx-forest))]">
              Keep in mind
            </dt>
            <dd className="mt-0.5 text-[0.82rem] leading-relaxed text-[hsl(var(--rx-ink-soft))]">
              {diagnostic.caveat}
            </dd>
          </div>
        </div>
      </dl>

      {diagnostic.evidenceUrl && (
        <div
          className="mt-auto border-t pt-4"
          style={{ borderColor: "hsl(var(--rx-line))" }}
        >
          <p className="text-[0.72rem] leading-relaxed text-[hsl(var(--rx-ink-faint))]">
            {diagnostic.evidenceCitation}
          </p>
          <a
            href={diagnostic.evidenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium text-[hsl(var(--rx-cyan))] transition-colors hover:bg-[hsl(var(--rx-cyan-soft))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--rx-cyan))]"
            style={{ borderColor: "hsl(var(--rx-cyan) / 0.4)" }}
          >
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
            View the evidence
            <span className="sr-only">
              for {diagnostic.modality} (opens in a new tab)
            </span>
          </a>
        </div>
      )}
    </article>
  );
}
