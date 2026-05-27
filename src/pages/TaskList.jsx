import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plus, CheckCircle2, Circle, ArrowUpCircle, Clock, ParkingSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_OPTIONS = ["inbox", "today", "focus", "paused", "parked", "completed"];
const STATUS_LABELS = {
  inbox: "Inbox", today: "Today", focus: "Focus",
  paused: "Paused", parked: "Parked", completed: "Done",
};
const STATUS_COLORS = {
  inbox: "bg-slate-100 text-slate-600",
  today: "bg-blue-100 text-blue-700",
  focus: "bg-purple-100 text-purple-700",
  paused: "bg-yellow-100 text-yellow-700",
  parked: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
};
const ENERGY_COLORS = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newEnergy, setNewEnergy] = useState("");
  const [newLoad, setNewLoad] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const all = await base44.entities.Task.list("-updated_date", 100);
    setTasks(all);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const taskData = { title: newTitle.trim(), status: "inbox" };
    if (newEnergy) taskData.energy_required = newEnergy;
    if (newLoad) taskData.emotional_load = newLoad;
    const created = await base44.entities.Task.create(taskData);
    setTasks(prev => [created, ...prev]);
    setNewTitle("");
    setNewEnergy("");
    setNewLoad("");
    setShowAdd(false);
  };

  const handleStatusChange = async (task, newStatus) => {
    const data = { status: newStatus };
    if (newStatus === "completed") data.completed_at = new Date().toISOString();
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...data } : t));
    await base44.entities.Task.update(task.id, data);
  };

  const activeStatuses = ["inbox", "today", "focus", "paused"];
  const filteredTasks = filter === "active"
    ? tasks.filter(t => activeStatuses.includes(t.status))
    : filter === "completed"
    ? tasks.filter(t => ["completed", "good_enough_done"].includes(t.status))
    : tasks.filter(t => t.status !== "parked");

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
              <h1 className="text-xl font-semibold text-foreground">Tasks</h1>
              <p className="text-sm text-muted-foreground">{filteredTasks.length} item{filteredTasks.length !== 1 ? "s" : ""}</p>
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
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {["active", "completed", "all"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {f === "active" ? "Active" : f === "completed" ? "Done" : "All"}
            </button>
          ))}
        </div>

        {/* Add task */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 bg-card border border-border/60 rounded-2xl px-4 py-3 space-y-3"
            >
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowAdd(false); }}
                  placeholder="Add a task..."
                  className="flex-1 bg-background border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                />
                <button onClick={handleCreate} disabled={!newTitle.trim()} className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50 shrink-0">
                  Add
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1.5">⚡ Energy required</p>
                  <div className="flex gap-1.5">
                    {[{v:"low",l:"🟢 Low"},{v:"medium",l:"🟡 Medium"},{v:"high",l:"🔴 High"}].map(o => (
                      <button key={o.v} type="button" onClick={() => setNewEnergy(e => e === o.v ? "" : o.v)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${newEnergy === o.v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1.5">💭 Emotional load</p>
                  <div className="flex gap-1.5">
                    {[{v:"low",l:"😌 Calm"},{v:"medium",l:"😬 Medium"},{v:"high",l:"😰 Heavy"}].map(o => (
                      <button key={o.v} type="button" onClick={() => setNewLoad(e => e === o.v ? "" : o.v)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${newLoad === o.v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task list */}
        <div className="space-y-2">
          <AnimatePresence>
            {filteredTasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card border border-border/60 rounded-2xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${["completed", "good_enough_done"].includes(task.status) ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </p>
                  </div>
                  {!["completed", "good_enough_done"].includes(task.status) && (
                    <button
                      onClick={() => handleStatusChange(task, "parked")}
                      title="Move to Parking Lot"
                      className="shrink-0 p-1.5 rounded-full text-muted-foreground hover:text-orange-500 hover:bg-orange-50 transition-all"
                    >
                      <ParkingSquare className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusChange(task, ["completed", "good_enough_done"].includes(task.status) ? "inbox" : "completed")}
                    className="shrink-0 p-1.5 rounded-full transition-all hover:bg-green-50"
                    title="Mark complete"
                  >
                    {["completed", "good_enough_done"].includes(task.status)
                      ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                      : <Circle className="w-5 h-5 text-muted-foreground hover:text-green-500" />
                    }
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No tasks here.</p>
            <button onClick={() => setShowAdd(true)} className="mt-3 text-sm text-primary hover:underline">
              + Add one
            </button>
          </div>
        )}
      </div>
    </div>
  );
}