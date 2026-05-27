import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Sparkles, Loader2, CheckCircle2, ParkingSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function getWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - day);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return { start: startOfWeek, end: endOfWeek };
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const STATUS_EMOJI = {
  completed: "✅",
  good_enough_done: "👍",
  abandoned: "🚫",
  delegated: "🤝",
};

export default function WeeklyRecap() {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [parkedThoughts, setParkedThoughts] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showThoughts, setShowThoughts] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);

  const { start, end } = getWeekRange();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [allTasks, thoughts] = await Promise.all([
      base44.entities.Task.list("-updated_date", 200),
      base44.entities.ParkedThought.filter({ reviewed: false }, "-created_date", 50),
    ]);

    const done = allTasks.filter(t => {
      const completedAt = t.completed_at ? new Date(t.completed_at) : null;
      const updatedAt = t.updated_date ? new Date(t.updated_date) : null;
      const isDone = ["completed", "good_enough_done", "abandoned", "delegated"].includes(t.status);
      const ts = completedAt || updatedAt;
      return isDone && ts && ts >= start && ts <= end;
    });

    const upcoming = allTasks.filter(t =>
      ["inbox", "today", "paused"].includes(t.status)
    ).slice(0, 8);

    setCompletedTasks(done);
    setParkedThoughts(thoughts);
    setUpcomingTasks(upcoming);
    setLoading(false);
  };

  const generateSummary = async () => {
    setAiLoading(true);
    const doneList = completedTasks.map(t => `- ${t.title} (${t.status})`).join("\n") || "Nothing completed this week.";
    const thoughtList = parkedThoughts.slice(0, 10).map(t => `- ${t.text} [${t.type}]`).join("\n") || "None.";
    const upcomingList = upcomingTasks.map(t => `- ${t.title} (${t.status}, energy: ${t.energy_required || "?"})`).join("\n") || "None.";

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a warm, supportive ADHD coach helping someone reflect on their week and prepare for the one ahead without feeling overwhelmed.

This week's completed tasks:
${doneList}

Unreviewed parked thoughts:
${thoughtList}

Tasks going into next week:
${upcomingList}

Write a gentle weekly recap in 3 short sections. Each section should be 1–3 sentences max. Tone: warm, honest, no toxic positivity. Acknowledge real effort.

Respond ONLY as valid JSON:
{
  "wins": "What they accomplished this week — name specific tasks if possible.",
  "patterns": "One gentle observation about what's sitting in their parking lot or what got parked mid-week.",
  "next_week": "One or two low-pressure suggestions for easing into next week, based on what's waiting."
}`,
        response_json_schema: {
          type: "object",
          properties: {
            wins: { type: "string" },
            patterns: { type: "string" },
            next_week: { type: "string" }
          }
        }
      });
      setAiSummary(res);
    } catch {
      setAiSummary({ wins: "You showed up this week — that matters.", patterns: "", next_week: "Take it one task at a time." });
    }
    setAiLoading(false);
  };

  const weekLabel = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6 pb-24">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Weekly Recap</h1>
            <p className="text-sm text-muted-foreground">{weekLabel}</p>
          </div>
        </div>

        {/* AI Summary */}
        {!aiSummary ? (
          <button
            onClick={generateSummary}
            disabled={aiLoading}
            className="w-full mb-6 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-60"
          >
            {aiLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Reflecting on your week…</>
              : <><Sparkles className="w-4 h-4" /> Generate my weekly recap</>
            }
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 space-y-3"
          >
            {[
              { key: "wins", label: "🏆 What you did", color: "bg-green-50 border-green-200 text-green-900" },
              { key: "patterns", label: "🔍 Something to notice", color: "bg-amber-50 border-amber-200 text-amber-900" },
              { key: "next_week", label: "🌱 Easing into next week", color: "bg-blue-50 border-blue-200 text-blue-900" },
            ].map(({ key, label, color }) =>
              aiSummary[key] ? (
                <div key={key} className={`border rounded-2xl px-4 py-3 ${color}`}>
                  <p className="text-xs font-semibold mb-1 opacity-70 uppercase tracking-wide">{label}</p>
                  <p className="text-sm leading-relaxed">{aiSummary[key]}</p>
                </div>
              ) : null
            )}
            <button
              onClick={generateSummary}
              disabled={aiLoading}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Regenerate
            </button>
          </motion.div>
        )}

        {/* Completed this week */}
        <div className="mb-5">
          <button
            onClick={() => setShowCompleted(v => !v)}
            className="w-full flex items-center justify-between mb-3"
          >
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Completed this week ({completedTasks.length})
            </h2>
            {showCompleted ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {showCompleted && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                {completedTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2 px-1">Nothing completed yet this week — and that's okay.</p>
                ) : (
                  <div className="space-y-2">
                    {completedTasks.map(task => (
                      <div key={task.id} className="bg-card border border-border/60 rounded-xl px-4 py-2.5 flex items-start gap-2">
                        <span className="text-base shrink-0">{STATUS_EMOJI[task.status] || "✅"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground font-medium truncate">{task.title}</p>
                          {(task.completed_at || task.updated_date) && (
                            <p className="text-xs text-muted-foreground">{formatDate(task.completed_at || task.updated_date)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Parked thoughts to review */}
        <div className="mb-5">
          <button
            onClick={() => setShowThoughts(v => !v)}
            className="w-full flex items-center justify-between mb-3"
          >
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <ParkingSquare className="w-3.5 h-3.5 text-blue-500" />
              Parked thoughts to review ({parkedThoughts.length})
            </h2>
            {showThoughts ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {showThoughts && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                {parkedThoughts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2 px-1">Parking lot is clear. Nice.</p>
                ) : (
                  <div className="space-y-2">
                    {parkedThoughts.map(thought => (
                      <div key={thought.id} className="bg-card border border-border/60 rounded-xl px-4 py-2.5">
                        <p className="text-sm text-foreground">{thought.text}</p>
                        {thought.type && thought.type !== "other" && (
                          <span className="text-xs text-muted-foreground capitalize">{thought.type.replace("_", " ")}</span>
                        )}
                      </div>
                    ))}
                    <Link to="/parking-lot" className="block text-xs text-primary hover:underline mt-1 px-1">
                      Review in Parking Lot →
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Going into next week */}
        {upcomingTasks.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Going into next week</h2>
            <div className="space-y-2">
              {upcomingTasks.map(task => (
                <div key={task.id} className="bg-card border border-border/60 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2">
                  <p className="text-sm text-foreground font-medium truncate flex-1">{task.title}</p>
                  {task.energy_required && (
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      task.energy_required === "low" ? "bg-green-100 text-green-700" :
                      task.energy_required === "medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>⚡ {task.energy_required}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}