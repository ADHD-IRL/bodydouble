import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Library, Sparkles, ArrowLeft, Leaf, SearchX, Pill, Info, ScanLine } from "lucide-react";
import {
  resources,
  categories,
  featuredResources,
  supplements,
  diagnostics,
  formatPublishDate,
} from "@/lib/resources-data";
import ResourceCard from "@/components/resources/ResourceCard";
import ResearchCard from "@/components/resources/ResearchCard";
import CategoryFilter from "@/components/resources/CategoryFilter";
import SupplementCard from "@/components/resources/SupplementCard";
import DiagnosticCard from "@/components/resources/DiagnosticCard";

const SENSORY_KEY = "rx-sensory-mode";

// True in the public GitHub Pages build (see vite.config.js).
const isStandalone = import.meta.env.VITE_STANDALONE === "true";

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sensory, setSensory] = useState(false);

  // Restore the reader's Sensory-Friendly preference.
  useEffect(() => {
    try {
      setSensory(localStorage.getItem(SENSORY_KEY) === "true");
    } catch {
      /* localStorage unavailable — default to standard view */
    }
  }, []);

  const toggleSensory = () => {
    setSensory((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SENSORY_KEY, String(next));
      } catch {
        /* ignore persistence failure */
      }
      return next;
    });
  };

  const counts = useMemo(() => {
    const byCategory = {};
    for (const r of resources) {
      byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    }
    return { all: resources.length, byCategory };
  }, []);

  const visibleResources = useMemo(() => {
    if (activeCategory === "All") return resources;
    return resources.filter((r) => r.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className={`rx-theme min-h-screen font-sans ${sensory ? "rx-sensory" : ""}`}>
      {/* ── Masthead ─────────────────────────────────────────────── */}
      <header className="border-b" style={{ borderColor: "hsl(var(--rx-line))" }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {/* Utility bar */}
          <div
            className="flex items-center justify-between gap-4 border-b py-3 text-sm"
            style={{ borderColor: "hsl(var(--rx-line))" }}
          >
            {/* The public static build has no app to return to. */}
            {isStandalone ? (
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[hsl(var(--rx-ink-faint))]">
                Open resource library
              </span>
            ) : (
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-[hsl(var(--rx-ink-soft))] transition-colors hover:text-[hsl(var(--rx-forest))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--rx-cyan))] rounded"
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                Back to app
              </Link>
            )}

            <ReadingModeToggle sensory={sensory} onToggle={toggleSensory} />
          </div>

          {/* Title block */}
          <div className="py-10 sm:py-14">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--rx-cyan))]">
              <Library aria-hidden="true" className="h-4 w-4" />
              The Neurodivergence Library
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.08] text-[hsl(var(--rx-ink))] sm:text-5xl">
              Clear, credible research &amp; resources on neurodivergence.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[hsl(var(--rx-ink-soft))] sm:text-lg">
              A calm, uncluttered collection of whitepapers, clinical studies,
              worksheets and toolkits — curated to be neuro-affirming, evidence-led
              and easy to read. Filter by area, or read the emerging research below.
            </p>
            <p className="mt-6 text-sm text-[hsl(var(--rx-ink-faint))]">
              {counts.all} resources · {categories.length} focus areas
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        {/* ── Cutting-Edge Research ─────────────────────────────── */}
        {featuredResources.length > 0 && (
          <section aria-labelledby="research-heading" className="pt-12 sm:pt-16">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--rx-forest))]">
                  <Sparkles aria-hidden="true" className="h-4 w-4" />
                  Cutting-Edge Research
                </p>
                <h2
                  id="research-heading"
                  className="mt-2 font-serif text-3xl leading-tight text-[hsl(var(--rx-ink))]"
                >
                  Emerging studies &amp; neuro-affirming paradigms
                </h2>
              </div>
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[hsl(var(--rx-ink-soft))]">
              Transdiagnostic approaches and clinical work at the frontier of how we
              understand neurodivergent minds.
            </p>

            <div className="mt-8 grid gap-5">
              {featuredResources.map((resource) => (
                <ResearchCard key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        )}

        {/* ── Emerging Diagnostics ──────────────────────────────── */}
        {diagnostics.length > 0 && (
          <>
            <div
              className="my-14 h-px w-full sm:my-16"
              style={{ backgroundColor: "hsl(var(--rx-line))" }}
              role="presentation"
            />

            <section aria-labelledby="diagnostics-heading">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--rx-forest))]">
                <ScanLine aria-hidden="true" className="h-4 w-4" />
                Emerging Diagnostics
              </p>
              <h2
                id="diagnostics-heading"
                className="mt-2 font-serif text-3xl leading-tight text-[hsl(var(--rx-ink))]"
              >
                Objective methods for sharper identification
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[hsl(var(--rx-ink-soft))]">
                Brain scans, EEG, eye-tracking and other measurable signals are being
                studied as ways to identify neurodivergence earlier and more objectively.
                Each is shown with both its promise and its limits.
              </p>

              {/* Framing note */}
              <div
                className="mt-6 flex gap-3 rounded-xl border px-4 py-3.5"
                style={{
                  borderColor: "hsl(var(--rx-line-strong))",
                  backgroundColor: "hsl(var(--rx-surface))",
                }}
              >
                <Info
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0"
                  style={{ color: "hsl(var(--rx-forest))" }}
                />
                <p className="text-sm leading-relaxed text-[hsl(var(--rx-ink-soft))]">
                  <span className="font-medium text-[hsl(var(--rx-ink))]">
                    None of these replaces a comprehensive clinical assessment.
                  </span>{" "}
                  Today they support, contextualise or speed up identification — a
                  qualified professional, drawing on history and observation, remains the
                  standard for diagnosis.
                </p>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {diagnostics.map((diagnostic) => (
                  <DiagnosticCard key={diagnostic.id} diagnostic={diagnostic} />
                ))}
              </div>
            </section>
          </>
        )}

        {/* Hairline divider */}
        <div
          className="my-14 h-px w-full sm:my-16"
          style={{ backgroundColor: "hsl(var(--rx-line))" }}
          role="presentation"
        />

        {/* ── Full library ──────────────────────────────────────── */}
        <section aria-labelledby="library-heading">
          <div className="flex flex-col gap-6">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--rx-cyan))]">
                <Leaf aria-hidden="true" className="h-4 w-4" />
                Browse the collection
              </p>
              <h2
                id="library-heading"
                className="mt-2 font-serif text-3xl leading-tight text-[hsl(var(--rx-ink))]"
              >
                All resources
              </h2>
            </div>

            <CategoryFilter
              categories={categories}
              active={activeCategory}
              onChange={setActiveCategory}
              counts={counts}
            />
          </div>

          {visibleResources.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div
              className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center"
              style={{ borderColor: "hsl(var(--rx-line-strong))" }}
            >
              <SearchX aria-hidden="true" className="h-8 w-8 text-[hsl(var(--rx-ink-faint))]" />
              <p className="text-[hsl(var(--rx-ink-soft))]">
                No resources in this area yet — new ones are added regularly.
              </p>
            </div>
          )}
        </section>

        {/* ── Supplement Support ────────────────────────────────── */}
        {supplements.length > 0 && (
          <>
            <div
              className="my-14 h-px w-full sm:my-16"
              style={{ backgroundColor: "hsl(var(--rx-line))" }}
              role="presentation"
            />

            <section aria-labelledby="supplements-heading">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--rx-cyan))]">
                <Pill aria-hidden="true" className="h-4 w-4" />
                Supplement Support
              </p>
              <h2
                id="supplements-heading"
                className="mt-2 font-serif text-3xl leading-tight text-[hsl(var(--rx-ink))]"
              >
                Nutritional support, explained calmly
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[hsl(var(--rx-ink-soft))]">
                A plain-language look at supplements sometimes explored alongside
                neurodivergence — what the evidence suggests, and what to be careful about.
              </p>

              {/* Safety note */}
              <div
                className="mt-6 flex gap-3 rounded-xl border px-4 py-3.5"
                style={{
                  borderColor: "hsl(var(--rx-line-strong))",
                  backgroundColor: "hsl(var(--rx-surface))",
                }}
              >
                <Info
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0"
                  style={{ color: "hsl(var(--rx-forest))" }}
                />
                <p className="text-sm leading-relaxed text-[hsl(var(--rx-ink-soft))]">
                  <span className="font-medium text-[hsl(var(--rx-ink))]">
                    Supplements are not a treatment for neurodivergence
                  </span>{" "}
                  and can interact with medication. Several — iron, zinc, vitamin D —
                  should only be taken once testing confirms a need. This is general
                  information, not medical advice: please talk with a qualified clinician,
                  and take extra care with children.
                </p>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {supplements.map((supplement) => (
                  <SupplementCard key={supplement.id} supplement={supplement} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t" style={{ borderColor: "hsl(var(--rx-line))" }}>
        <div className="mx-auto max-w-6xl px-5 py-10 text-sm text-[hsl(var(--rx-ink-faint))] sm:px-8">
          <p className="max-w-2xl leading-relaxed">
            This library is for information and education. It is not a substitute
            for individualised clinical, medical or therapeutic advice.
          </p>
          <p className="mt-2">
            Last updated {formatPublishDate("2026-02-01")}.
          </p>
        </div>
      </footer>
    </div>
  );
}

function ReadingModeToggle({ sensory, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={sensory}
      onClick={onToggle}
      className="inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--rx-cyan))] focus-visible:ring-offset-2"
      style={{
        borderColor: sensory ? "hsl(var(--rx-cyan))" : "hsl(var(--rx-line))",
        backgroundColor: sensory ? "hsl(var(--rx-cyan-soft))" : "hsl(var(--rx-surface))",
        "--tw-ring-offset-color": "hsl(var(--rx-bg))",
      }}
    >
      <Leaf
        aria-hidden="true"
        className="h-4 w-4"
        style={{ color: sensory ? "hsl(var(--rx-cyan))" : "hsl(var(--rx-ink-faint))" }}
      />
      <span
        className="text-xs font-medium"
        style={{ color: sensory ? "hsl(var(--rx-forest))" : "hsl(var(--rx-ink-soft))" }}
      >
        Sensory-Friendly
      </span>
      {/* Track */}
      <span
        aria-hidden="true"
        className="relative h-4 w-7 rounded-full transition-colors"
        style={{ backgroundColor: sensory ? "hsl(var(--rx-cyan))" : "hsl(var(--rx-line-strong))" }}
      >
        <span
          className="absolute top-0.5 h-3 w-3 rounded-full transition-all"
          style={{
            left: sensory ? "0.875rem" : "0.125rem",
            backgroundColor: "hsl(var(--rx-surface))",
          }}
        />
      </span>
    </button>
  );
}
