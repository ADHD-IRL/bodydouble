import { useId, useState } from "react";
import { Download, BookOpen, ChevronDown, Calendar, Building2 } from "lucide-react";
import TypeBadge from "./TypeBadge";
import { formatPublishDate, assetUrl } from "@/lib/resources-data";

export default function ResourceCard({ resource }) {
  const [open, setOpen] = useState(false);
  const abstractId = useId();
  const hasAbstract = Boolean(resource.abstract);

  return (
    <article
      className="group flex h-full flex-col rounded-xl border bg-[hsl(var(--rx-surface))] p-5 transition-colors duration-200 hover:border-[hsl(var(--rx-line-strong))] focus-within:border-[hsl(var(--rx-line-strong))]"
      style={{ borderColor: "hsl(var(--rx-line))" }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <TypeBadge type={resource.type} />
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.08em] text-[hsl(var(--rx-ink-faint))]">
          {resource.category}
        </span>
      </div>

      <h3 className="font-serif text-xl leading-snug text-[hsl(var(--rx-ink))]">
        {resource.title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--rx-ink-soft))]">
        {resource.description}
      </p>

      <dl className="mt-4 space-y-1.5 text-xs text-[hsl(var(--rx-ink-faint))]">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Author or institution</dt>
          <Building2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          <dd>{resource.authorOrInstitution}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Published</dt>
          <Calendar aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          <dd>{formatPublishDate(resource.publishDate)}</dd>
        </div>
      </dl>

      {hasAbstract && open && (
        <div
          id={abstractId}
          className="mt-4 rounded-lg border-l-2 bg-[hsl(var(--rx-surface-2))] px-4 py-3 text-sm leading-relaxed text-[hsl(var(--rx-ink-soft))]"
          style={{ borderColor: "hsl(var(--rx-cyan))" }}
        >
          {resource.abstract}
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4" style={{ borderColor: "hsl(var(--rx-line))" }}>
        <a
          href={assetUrl(resource.downloadUrl)}
          download
          className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-[hsl(var(--rx-surface))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ backgroundColor: "hsl(var(--rx-forest))", "--tw-ring-color": "hsl(var(--rx-cyan))", "--tw-ring-offset-color": "hsl(var(--rx-surface))" }}
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          Download PDF
          <span className="sr-only">: {resource.title}</span>
        </a>

        {hasAbstract && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={abstractId}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium text-[hsl(var(--rx-cyan))] transition-colors hover:bg-[hsl(var(--rx-cyan-soft))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--rx-cyan))]"
            style={{ borderColor: "hsl(var(--rx-cyan) / 0.4)" }}
          >
            <BookOpen aria-hidden="true" className="h-4 w-4" />
            {open ? "Hide Abstract" : "Read Abstract"}
            <ChevronDown
              aria-hidden="true"
              className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
    </article>
  );
}
