import { Download, Clock, Building2, Calendar, Sparkles } from "lucide-react";
import TypeBadge from "./TypeBadge";
import { formatPublishDate } from "@/lib/resources-data";

// Distinct, editorial layout for the "Cutting-Edge Research" section:
// a wider two-column card with a deep-forest accent rail and the abstract
// surfaced by default, to highlight emerging studies.
export default function ResearchCard({ resource }) {
  return (
    <article
      className="relative grid gap-6 overflow-hidden rounded-2xl border bg-[hsl(var(--rx-surface))] p-6 sm:grid-cols-[1fr_auto] sm:p-7"
      style={{ borderColor: "hsl(var(--rx-line))" }}
    >
      {/* Deep-forest accent rail */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: "hsl(var(--rx-forest))" }}
      />

      <div className="min-w-0 pl-2">
        <div className="mb-3 flex flex-wrap items-center gap-2.5">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--rx-surface))]"
            style={{ backgroundColor: "hsl(var(--rx-forest))" }}
          >
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            Featured Research
          </span>
          <TypeBadge type={resource.type} />
        </div>

        <p className="mb-1 text-[0.7rem] font-medium uppercase tracking-[0.09em] text-[hsl(var(--rx-cyan))]">
          {resource.category}
        </p>

        <h3 className="font-serif text-2xl leading-tight text-[hsl(var(--rx-ink))] sm:text-[1.7rem]">
          {resource.title}
        </h3>

        <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-[hsl(var(--rx-ink-soft))]">
          {resource.abstract || resource.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[hsl(var(--rx-ink-faint))]">
          <span className="flex items-center gap-1.5">
            <Building2 aria-hidden="true" className="h-3.5 w-3.5" />
            {resource.authorOrInstitution}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar aria-hidden="true" className="h-3.5 w-3.5" />
            {formatPublishDate(resource.publishDate)}
          </span>
          {resource.readingMinutes ? (
            <span className="flex items-center gap-1.5">
              <Clock aria-hidden="true" className="h-3.5 w-3.5" />
              {resource.readingMinutes} min read
            </span>
          ) : null}
        </div>
      </div>

      {/* Action column */}
      <div className="flex items-end sm:flex-col sm:items-stretch sm:justify-center">
        <a
          href={resource.downloadUrl}
          download
          className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-[hsl(var(--rx-surface))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            backgroundColor: "hsl(var(--rx-cyan))",
            "--tw-ring-color": "hsl(var(--rx-forest))",
            "--tw-ring-offset-color": "hsl(var(--rx-surface))",
          }}
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          Download Study
          <span className="sr-only">: {resource.title}</span>
        </a>
      </div>
    </article>
  );
}
