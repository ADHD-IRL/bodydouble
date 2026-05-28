import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";

const OUTCOMES = [
  { id: "finished", label: "I finished it", emoji: "✅" },
  { id: "made_progress", label: "I made progress", emoji: "📈" },
  { id: "started_counts", label: "I started — and that counts", emoji: "🌱" },
  { id: "learned_next_step", label: "I learned the next step", emoji: "💡" },
  { id: "carry_forward", label: "I need to carry it forward", emoji: "↩️" },
  { id: "not_today", label: "Not today", emoji: "🌙" },
];

const STATUS_MAP = {
  finished: "done",
  made_progress: "partly_done",
  started_counts: "started",
  learned_next_step: "in_progress",
  carry_forward: "carried_forward",
  not_today: "carried_forward",
};

export default function SessionClose({ task, session, elapsedMinutes, currentTinyAction, onDone }) {
  const [outcome, setOutcome] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleOutcome = async (o) => {
    setOutcome(o);
    setLoading(true);

    const [closeRes] = await Promise.all([
      base44.functions.invoke("closeSession", {
        session_outcome: o,
        task_title: task.title,
        session_minutes: elapsedMinutes,
        tiny_action: currentTinyAction,
      }),
      session && base44.entities.FocusSession.update(session.id, {
        session_outcome: o,
        end_time: new Date().toISOString(),
        session_status: "ended",
      }),
      base44.entities.Task.update(task.id, {
        status: STATUS_MAP[o] || "in_progress",
        current_focus_session_id: null,
      }),
    ]);

    setResult(closeRes.data);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-5"
    >
      <div className="w-full max-w-sm">
        {!outcome ? (
          <>
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl text-foreground mb-2">What happened?</h1>
              <p className="text-sm text-muted-foreground">No wrong answer here.</p>
            </div>
            <div className="space-y-2">
              {OUTCOMES.map(o => (
                <button
                  key={o.id}
                  onClick={() => handleOutcome(o.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card border border-border text-sm text-foreground hover:border-primary/40 hover:bg-oat/40 transition-all text-left"
                >
                  <span className="text-xl">{o.emoji}</span>
                  {o.label}
                </button>
              ))}
            </div>
          </>
        ) : loading ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Logging your session…</p>
          </div>
        ) : result ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="font-serif text-2xl text-foreground leading-snug mb-3">{result.message}</p>
            </div>

            <div className="bg-card border border-border rounded-2xl px-4 py-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Session length</span>
                <span className="text-foreground font-medium">{elapsedMinutes} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Task</span>
                <span className="text-foreground font-medium truncate max-w-40 text-right">{task.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-foreground font-medium capitalize">{OUTCOMES.find(o => o.id === outcome)?.label}</span>
              </div>
            </div>

            {result.next_step && (
              <div className="bg-oat/60 rounded-2xl px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Next tiny step</p>
                <p className="text-sm text-foreground">{result.next_step}</p>
              </div>
            )}

            <button
              onClick={onDone}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Back to today <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}