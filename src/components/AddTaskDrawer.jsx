import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { X, ChevronDown, ChevronUp } from "lucide-react";

const CATEGORIES = ["work", "home", "admin", "study", "health", "errands", "creative", "other"];
const ENERGY = [{ v: "low", l: "🌿 Low" }, { v: "medium", l: "🌤 Medium" }, { v: "high", l: "🔥 High" }];
const TIMES = [5, 10, 15, 20, 30, 45, 60];

export default function AddTaskDrawer({ onCreated, onClose, initialTitle = "" }) {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState("other");
  const [energy, setEnergy] = useState("medium");
  const [timeEst, setTimeEst] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const data = {
      title: title.trim(),
      category,
      energy_required: energy,
      status: "not_started",
    };
    if (timeEst) data.time_estimate_minutes = Number(timeEst);
    if (dueDate) data.due_date = dueDate;
    const created = await base44.entities.Task.create(data);
    onCreated(created);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-bark/30 backdrop-blur-sm flex items-end justify-center"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-card rounded-t-3xl w-full max-w-md shadow-xl px-5 pt-5 pb-10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-foreground">Add a task</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSave()}
            placeholder="What's the task?"
            className="w-full bg-muted/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/40"
          />

          <div>
            <p className="text-xs text-muted-foreground font-medium mb-2">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`text-xs px-3 py-1.5 rounded-full capitalize transition-colors ${category === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground font-medium mb-2">Energy needed</p>
            <div className="flex gap-2">
              {ENERGY.map(e => (
                <button key={e.v} onClick={() => setEnergy(e.v)}
                  className={`flex-1 text-xs py-2 rounded-xl transition-colors ${energy === e.v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                  {e.l}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowMore(v => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showMore ? "Less options" : "More options"}
          </button>

          <AnimatePresence>
            {showMore && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">Time estimate</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TIMES.map(t => (
                      <button key={t} onClick={() => setTimeEst(String(t))}
                        className={`text-xs px-3 py-1.5 rounded-full transition-colors ${timeEst === String(t) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                        {t}m
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">Due date (optional)</p>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="bg-muted/60 rounded-xl px-4 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/40 w-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Add task"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}