import { motion } from "framer-motion";
import { Scissors, Play, CheckCircle2, ArrowRight, Clock, Leaf } from "lucide-react";

const CATEGORY_COLORS = {
  work: "bg-blue-100 text-blue-700",
  home: "bg-amber-100 text-amber-700",
  admin: "bg-purple-100 text-purple-700",
  study: "bg-indigo-100 text-indigo-700",
  health: "bg-green-100 text-green-700",
  errands: "bg-orange-100 text-orange-700",
  creative: "bg-pink-100 text-pink-700",
  other: "bg-stone-100 text-stone-600",
};

const ENERGY_LABELS = { low: "🌿 low", medium: "🌤 medium", high: "🔥 high" };

const STATUS_LABELS = {
  not_started: "Not started",
  started: "Started",
  in_progress: "In progress",
  partly_done: "Partly done",
  done: "Done",
  carried_forward: "Carried forward",
};

export default function TaskCard({ task, onStart, onShrink, onDone }) {
  const hasTinyActions = task.tiny_actions && task.tiny_actions.length > 0;
  const nextAction = hasTinyActions ? task.tiny_actions[task.current_tiny_action_index || 0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl px-4 py-3.5 space-y-2.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug">{task.title}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {task.category && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[task.category] || CATEGORY_COLORS.other}`}>
                {task.category}
              </span>
            )}
            {task.energy_required && (
              <span className="text-xs text-muted-foreground">{ENERGY_LABELS[task.energy_required]}</span>
            )}
            {task.time_estimate_minutes && (
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                <Clock className="w-3 h-3" />{task.time_estimate_minutes}m
              </span>
            )}
            {task.status === "carried_forward" && (
              <span className="text-xs text-clay font-medium">↩ carried forward</span>
            )}
          </div>
        </div>
        <button
          onClick={() => onDone(task)}
          className="shrink-0 p-1.5 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-moss"
          title="Mark done"
        >
          <CheckCircle2 className="w-4.5 h-4.5" />
        </button>
      </div>

      {nextAction && (
        <div className="bg-oat/60 rounded-xl px-3 py-2 flex items-center gap-2">
          <Leaf className="w-3.5 h-3.5 text-moss shrink-0" />
          <p className="text-xs text-foreground leading-snug flex-1">{nextAction}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onStart(task)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-xl py-2 text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          <Play className="w-3.5 h-3.5" /> Begin session
        </button>
        {!hasTinyActions && (
          <button
            onClick={() => onShrink(task)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-muted text-muted-foreground text-xs hover:bg-accent transition-colors"
            title="Make it smaller"
          >
            <Scissors className="w-3.5 h-3.5" /> Shrink
          </button>
        )}
        {hasTinyActions && (
          <button
            onClick={() => onShrink(task)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-muted text-muted-foreground text-xs hover:bg-accent transition-colors"
            title="View tiny actions"
          >
            <ArrowRight className="w-3.5 h-3.5" /> Steps
          </button>
        )}
      </div>
    </motion.div>
  );
}