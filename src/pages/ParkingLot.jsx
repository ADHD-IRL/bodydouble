import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plus, Trash2, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_LABELS = {
  task: "Task", worry: "Worry", intrusive_thought: "Intrusive thought",
  tangent: "Tangent", reminder: "Reminder", idea: "Idea", other: "Other",
};
const TYPE_COLORS = {
  task: "bg-blue-100 text-blue-700",
  worry: "bg-red-100 text-red-700",
  intrusive_thought: "bg-purple-100 text-purple-700",
  tangent: "bg-yellow-100 text-yellow-700",
  reminder: "bg-orange-100 text-orange-700",
  idea: "bg-green-100 text-green-700",
  other: "bg-muted text-muted-foreground",
};

export default function ParkingLot() {
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState("");
  const [newType, setNewType] = useState("other");
  const [filter, setFilter] = useState("unreviewed");

  useEffect(() => {
    loadThoughts();
  }, []);

  const loadThoughts = async () => {
    const all = await base44.entities.ParkedThought.list("-created_date", 100);
    setThoughts(all);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newText.trim()) return;
    const created = await base44.entities.ParkedThought.create({
      text: newText.trim(),
      type: newType,
      reviewed: false,
    });
    setThoughts(prev => [created, ...prev]);
    setNewText("");
    setNewType("other");
    setShowAdd(false);
  };

  const handlePromoteToTask = async (thought) => {
    await base44.entities.Task.create({ title: thought.text, status: "inbox" });
    await base44.entities.ParkedThought.update(thought.id, { reviewed: true });
    setThoughts(prev => prev.map(t => t.id === thought.id ? { ...t, reviewed: true } : t));
  };

  const handleMarkReviewed = async (thought) => {
    await base44.entities.ParkedThought.update(thought.id, { reviewed: true });
    setThoughts(prev => prev.map(t => t.id === thought.id ? { ...t, reviewed: true } : t));
  };

  const handleDelete = async (thought) => {
    await base44.entities.ParkedThought.delete(thought.id);
    setThoughts(prev => prev.filter(t => t.id !== thought.id));
  };

  const filtered = filter === "unreviewed"
    ? thoughts.filter(t => !t.reviewed)
    : filter === "reviewed"
    ? thoughts.filter(t => t.reviewed)
    : thoughts;

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Parking Lot</h1>
              <p className="text-sm text-muted-foreground">Thoughts you set aside</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(v => !v)}
            className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {["unreviewed", "reviewed", "all"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {f === "unreviewed" ? "To Review" : f === "reviewed" ? "Reviewed" : "All"}
            </button>
          ))}
        </div>

        {/* Add thought */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 bg-card border border-border/60 rounded-2xl p-4 space-y-3"
            >
              <textarea
                autoFocus
                value={newText}
                onChange={e => setNewText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); } }}
                placeholder="Park a thought..."
                rows={2}
                className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  className="flex-1 bg-muted text-muted-foreground text-sm rounded-xl px-3 py-2 outline-none border-0"
                >
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                <button
                  onClick={handleAdd}
                  disabled={!newText.trim()}
                  className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-all"
                >
                  Park it
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thoughts list */}
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map(thought => (
              <motion.div
                key={thought.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`bg-card border rounded-2xl px-4 py-3 ${thought.reviewed ? "border-border/30 opacity-60" : "border-border/60"}`}
              >
                <p className="text-sm text-foreground mb-2">{thought.text}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[thought.type] || TYPE_COLORS.other}`}>
                    {TYPE_LABELS[thought.type] || "Other"}
                  </span>
                  {!thought.reviewed && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePromoteToTask(thought)}
                        className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium flex items-center gap-1"
                      >
                        <ArrowUpRight className="w-3 h-3" /> Task
                      </button>
                      <button
                        onClick={() => handleMarkReviewed(thought)}
                        className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-accent transition-colors"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => handleDelete(thought)}
                        className="text-xs px-2 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">
              {filter === "unreviewed" ? "Nothing to review — nice." : "Nothing here yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}