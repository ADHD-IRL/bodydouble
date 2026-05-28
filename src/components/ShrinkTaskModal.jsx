import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Scissors, X, Check, Loader2, Plus, Trash2 } from "lucide-react";

export default function ShrinkTaskModal({ task, onSave, onClose }) {
  const [steps, setSteps] = useState(task.tiny_actions || []);
  const [loading, setLoading] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editText, setEditText] = useState("");
  const [newStep, setNewStep] = useState("");

  const generate = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("shrinkTask", {
      task_title: task.title,
      category: task.category,
    });
    if (res.data?.tiny_actions) setSteps(res.data.tiny_actions);
    setLoading(false);
  };

  const removeStep = (i) => setSteps(prev => prev.filter((_, idx) => idx !== i));
  const startEdit = (i) => { setEditingIdx(i); setEditText(steps[i]); };
  const saveEdit = () => {
    if (editText.trim()) setSteps(prev => prev.map((s, i) => i === editingIdx ? editText.trim() : s));
    setEditingIdx(null);
  };
  const addStep = () => {
    if (newStep.trim()) { setSteps(prev => [...prev, newStep.trim()]); setNewStep(""); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-bark/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="bg-card rounded-3xl w-full max-w-md shadow-xl overflow-hidden"
      >
        <div className="px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-clay" />
              <h2 className="font-serif text-lg text-foreground">Make it smaller</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">"{task.title}"</p>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-96 overflow-y-auto">
          {steps.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No steps yet. Let the AI suggest some, or add your own.
            </p>
          )}
          {loading && (
            <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking of tiny steps…</span>
            </div>
          )}
          <AnimatePresence>
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2.5"
              >
                <span className="text-xs text-muted-foreground w-5 shrink-0 text-center font-medium">{i + 1}</span>
                {editingIdx === i ? (
                  <input
                    autoFocus
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingIdx(null); }}
                    className="flex-1 bg-card rounded-lg px-2 py-1 text-sm text-foreground outline-none border border-primary/40"
                  />
                ) : (
                  <span
                    onClick={() => startEdit(i)}
                    className="flex-1 text-sm text-foreground cursor-pointer hover:text-clay transition-colors"
                  >{step}</span>
                )}
                <button onClick={() => removeStep(i)} className="shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex gap-2 mt-2">
            <input
              value={newStep}
              onChange={e => setNewStep(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addStep()}
              placeholder="Add a step…"
              className="flex-1 bg-muted/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30"
            />
            <button onClick={addStep} disabled={!newStep.trim()} className="p-2.5 rounded-xl bg-muted text-muted-foreground hover:bg-accent disabled:opacity-40 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-5 pb-5 pt-2 flex gap-2 border-t border-border">
          <button
            onClick={generate}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 border border-border rounded-xl py-2.5 text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Scissors className="w-3.5 h-3.5" />
            {steps.length > 0 ? "Regenerate" : "Suggest steps"}
          </button>
          <button
            onClick={() => onSave(steps)}
            disabled={steps.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5" /> Save steps
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}