const ALL = "All";

export default function CategoryFilter({ categories, active, onChange, counts }) {
  const options = [ALL, ...categories];

  return (
    <div
      role="group"
      aria-label="Filter resources by category"
      className="flex flex-wrap gap-2"
    >
      {options.map((cat) => {
        const isActive = active === cat;
        const count = cat === ALL ? counts.all : counts.byCategory[cat] || 0;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            aria-pressed={isActive}
            className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--rx-cyan))] focus-visible:ring-offset-2"
            style={
              isActive
                ? {
                    backgroundColor: "hsl(var(--rx-forest))",
                    borderColor: "hsl(var(--rx-forest))",
                    color: "hsl(var(--rx-surface))",
                    "--tw-ring-offset-color": "hsl(var(--rx-bg))",
                  }
                : {
                    backgroundColor: "hsl(var(--rx-surface))",
                    borderColor: "hsl(var(--rx-line))",
                    color: "hsl(var(--rx-ink-soft))",
                    "--tw-ring-offset-color": "hsl(var(--rx-bg))",
                  }
            }
          >
            {cat}
            <span
              className="rounded-full px-1.5 text-xs tabular-nums"
              style={{
                backgroundColor: isActive
                  ? "hsl(var(--rx-surface) / 0.2)"
                  : "hsl(var(--rx-ink) / 0.06)",
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
