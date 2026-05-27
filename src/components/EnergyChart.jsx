import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ENERGY_VALUE = { low: 1, medium: 2, high: 3 };
const ENERGY_LABEL = { 1: "Low", 2: "Medium", 3: "High" };
const ENERGY_COLOR = {
  0: "bg-muted",
  1: "bg-green-400",
  2: "bg-yellow-400",
  3: "bg-red-400",
};
const ENERGY_TEXT = {
  0: "text-muted-foreground",
  1: "text-green-600",
  2: "text-yellow-600",
  3: "text-red-600",
};

function getWeekStart() {
  const now = new Date();
  const d = new Date(now);
  d.setDate(now.getDate() - now.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function EnergyChart() {
  const [dayData, setDayData] = useState(Array(7).fill(null).map(() => ({ high: 0, medium: 0, low: 0, total: 0 })));
  const [loading, setLoading] = useState(true);
  const today = new Date().getDay();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const weekStart = getWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const tasks = await base44.entities.Task.list("-updated_date", 200);

    const buckets = Array(7).fill(null).map(() => ({ high: 0, medium: 0, low: 0, total: 0 }));

    tasks.forEach(t => {
      if (!t.energy_required) return;
      // Use completed_at for done tasks, updated_date as fallback
      const ts = t.completed_at
        ? new Date(t.completed_at)
        : t.updated_date
        ? new Date(t.updated_date)
        : null;

      if (!ts || ts < weekStart || ts >= weekEnd) return;
      const dayIdx = ts.getDay();
      const en = t.energy_required;
      if (en === "high" || en === "medium" || en === "low") {
        buckets[dayIdx][en]++;
        buckets[dayIdx].total++;
      }
    });

    setDayData(buckets);
    setLoading(false);
  };

  const maxTotal = Math.max(...dayData.map(d => d.total), 1);
  const totalHigh = dayData.reduce((s, d) => s + d.high, 0);
  const totalMedium = dayData.reduce((s, d) => s + d.medium, 0);
  const totalLow = dayData.reduce((s, d) => s + d.low, 0);
  const bestDay = dayData.reduce((best, d, i) => d.high > dayData[best].high ? i : best, 0);

  if (loading) return null;

  const hasAnyData = dayData.some(d => d.total > 0);

  return (
    <div className="bg-card border border-border/60 rounded-2xl px-4 py-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">⚡ Energy this week</h2>
        {hasAnyData && (
          <span className="text-[10px] text-muted-foreground">
            {totalHigh > 0 && <span className="text-red-500 font-medium">{totalHigh} high</span>}
            {totalHigh > 0 && totalMedium > 0 && <span className="text-muted-foreground"> · </span>}
            {totalMedium > 0 && <span className="text-yellow-500 font-medium">{totalMedium} med</span>}
            {(totalHigh > 0 || totalMedium > 0) && totalLow > 0 && <span className="text-muted-foreground"> · </span>}
            {totalLow > 0 && <span className="text-green-500 font-medium">{totalLow} low</span>}
          </span>
        )}
      </div>

      {!hasAnyData ? (
        <p className="text-xs text-muted-foreground text-center py-3">
          Complete some tasks this week to see your energy patterns.
        </p>
      ) : (
        <>
          {/* Bar chart */}
          <div className="flex items-end gap-1.5 h-16 mb-2">
            {dayData.map((d, i) => {
              const barH = d.total === 0 ? 0 : Math.max(10, (d.total / maxTotal) * 100);
              // dominant energy
              const dom = d.high >= d.medium && d.high >= d.low ? 3
                : d.medium >= d.low ? 2 : d.total > 0 ? 1 : 0;
              const isToday = i === today;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end" style={{ height: 48 }}>
                    {d.total > 0 ? (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${barH}%` }}
                        transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
                        className={`w-full rounded-t-md ${ENERGY_COLOR[dom]} ${isToday ? "opacity-100" : "opacity-70"}`}
                        style={{ minHeight: 4 }}
                      />
                    ) : (
                      <div className="w-full rounded-t-md bg-muted/40" style={{ height: 3 }} />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {DAYS[i]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-1">
            {[
              { color: "bg-red-400", label: "High" },
              { color: "bg-yellow-400", label: "Medium" },
              { color: "bg-green-400", label: "Low" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
            ))}
            {totalHigh > 0 && (
              <span className="text-[10px] text-muted-foreground ml-auto">
                Most high-effort: <span className="text-foreground font-medium">{DAYS[bestDay]}</span>
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}