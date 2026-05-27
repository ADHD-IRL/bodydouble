import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, Pencil, Sparkles, Loader2 } from "lucide-react";

export default function AddTaskForm({ onCreated, onClose }) {
  const [title, setTitle] = useState("");
  const [energy, setEnergy] = useState("");
  const [load, setLoad] = useState("");

  // Sub-step flow
  const [subSteps, setSubSteps] = useState(null); // null = not yet generated
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  const handleGenerateSteps = async () => {
    if (!title.trim()) return;
    setLoadingSteps(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a gentle ADHD coach helping someone break down a task into tiny, doable steps.

Task: "${title}"
Energy required: ${energy || "unknown"}
Emotional load: ${load || "unknown"}

Generate 3–5 small, concrete sub-steps that make this task feel less overwhelming. Each step should be a single physical action (verb + object), max 8 words. Keep them ultra-specific and sequential.

Respond ONLY as valid JSON: { "steps": ["step1", "step2", ...] }`,
        response_json_schema: {
          type: "object",
          properties: {
            steps: { type: "array", items: { type: "string" } }
          }
        }
      });
      const steps = (res?.steps || []).map((text, i) => ({ id: i, text, accepted: true }));
      setSubSteps(steps);
    } catch {
      setSubSteps([]);
    }
    setLoadingSteps(false);
  };

  const toggleAccepted = (id) => {
    setSubSteps(prev => prev.map(s => s.id === id ? { ...s, accepted: !s.accepted } : s));
  };

  const startEdit = (step) => {
    setEditingIndex(step.id);
    setEditText(step.text);
  };

  const saveEdit = (id) => {
    if (editText.trim()) {
      setSubSteps(prev => prev.map(s => s.id === id ? { ...s, text: editText.trim() } : s));
    }
    setEditingIndex(null);
    setEditText("");
  };

  const handleAddStep = () => {
    const newId = Date.now();
    setSubSteps(prev => [...prev, { id: newId, text: "", accepted: true }]);
    setEditingIndex(newId);
    setEditText("");
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const taskData = { title: title.trim(), status: "inbox" };
    if (energy) taskData.energy_required = energy;
    if (load) taskData.emotional_load = load;
    const created = await base44.entities.Task.create(taskData);

    const accepted = (subSteps || []).filter(s => s.accepted && s.text.trim());
    if (accepted.length > 0) {
      await base44.entities.SubTask.bulkCreate(
        accepted.map((s, i) => ({ task_id: created.id, title: s.text.trim(), order: i }))
      );
    }

    onCreated(created);
    setSaving(false);
  };

  const acceptedCount = (subSteps || []).filter(s => s.accepted).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mb-4 bg-card border border-border/60 rounded-2xl px-4 py-3 space-y-3"
    >
      {/* Title row */}
      <div className="flex gap-2">
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && title.trim() && !subSteps) handleGenerateSteps();
            if (e.key === "Escape") onClose();
          }}
          placeholder="What do you need to do?"
          className="flex-1 bg-background border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
        />
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Energy + Load */}
      <div className="space-y-2">
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1.5">⚡ Energy required</p>
          <div className="flex gap-1.5">
            {[{ v: "low", l: "🟢 Low" }, { v: "medium", l: "🟡 Medium" }, { v: "high", l: "🔴 High" }].map(o => (
              <button key={o.v} type="button" onClick={() => setEnergy(e => e === o.v ? "" : o.v)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${energy === o.v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                {o.l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1.5">💭 Emotional load</p>
          <div className="flex gap-1.5">
            {[{ v: "low", l: "😌 Calm" }, { v: "medium", l: "😬 Medium" }, { v: "high", l: "😰 Heavy" }].map(o => (
              <button key={o.v} type="button" onClick={() => setLoad(e => e === o.v ? "" : o.v)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${load === o.v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                {o.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-steps section */}
      <AnimatePresence mode="wait">
        {!subSteps && (
          <motion.button
            key="generate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleGenerateSteps}
            disabled={!title.trim() || loadingSteps}
            className="w-full py-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loadingSteps
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Breaking it down…</>
              : <><Sparkles className="w-3.5 h-3.5" /> Suggest sub-steps</>
            }
          </motion.button>
        )}

        {subSteps && (
          <motion.div
            key="steps"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">✨ Suggested sub-steps</p>
              <span className="text-xs text-muted-foreground">{acceptedCount} kept</span>
            </div>

            {subSteps.map((step) => (
              <div key={step.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${step.accepted ? "bg-background border-border/60" : "bg-muted/40 border-transparent opacity-50"}`}>
                {/* Accept/decline toggle */}
                <button onClick={() => toggleAccepted(step.id)}
                  className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${step.accepted ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}>
                  {step.accepted && <Check className="w-3 h-3" />}
                </button>

                {/* Text or edit input */}
                {editingIndex === step.id ? (
                  <input
                    autoFocus
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveEdit(step.id); if (e.key === "Escape") setEditingIndex(null); }}
                    onBlur={() => saveEdit(step.id)}
                    className="flex-1 bg-transparent text-sm text-foreground outline-none"
                  />
                ) : (
                  <span className={`flex-1 text-sm ${step.accepted ? "text-foreground" : "text-muted-foreground line-through"}`}>
                    {step.text}
                  </span>
                )}

                {/* Edit button */}
                {editingIndex !== step.id && step.accepted && (
                  <button onClick={() => startEdit(step)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            <button onClick={handleAddStep}
              className="w-full py-1.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all flex items-center justify-center gap-1.5">
              <Plus className="w-3 h-3" /> Add a step
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!title.trim() || saving}
        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {subSteps && acceptedCount > 0 ? `Save task + ${acceptedCount} step${acceptedCount > 1 ? "s" : ""}` : "Save task"}
      </button>
    </motion.div>
  );
}