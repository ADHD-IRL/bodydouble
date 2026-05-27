import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AvatarCompanion from "@/components/AvatarCompanion";
import { Plus, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_LABELS = {
  inbox: "Inbox",
  today: "Today",
  focus: "Focus",
  paused: "Paused",
  parked: "Parked",
};

const ENERGY_COLORS = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [me, profiles, taskList] = await Promise.all([
      base44.auth.me(),
      base44.entities.UserProfile.list(),
      base44.entities.Task.filter({ status: ["inbox", "today", "focus", "paused", "parked"] }),
    ]);
    setUser(me);
    setProfile(profiles[0] || null);
    setTasks(taskList);
    setLoading(false);
  };

  const handleUpdateProfile = async (updates) => {
    if (profile) {
      const updated = await base44.entities.UserProfile.update(profile.id, updates);
      setProfile(updated);
    } else {
      const created = await base44.entities.UserProfile.create(updates);
      setProfile(created);
    }
  };

  const handleStartTask = async (task) => {
    const updated = await base44.entities.Task.update(task.id, { status: "focus", last_opened_at: new Date().toISOString() });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...updated } : t));
  };

  const handleTaskCompleted = () => {
    loadData();
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    const created = await base44.entities.Task.create({ title: newTaskTitle.trim(), status: "inbox" });
    setTasks(prev => [...prev, created]);
    setNewTaskTitle("");
    setShowAddTask(false);
  };

  const activeTasks = tasks.filter(t => ["today", "focus", "paused"].includes(t.status));
  const inboxTasks = tasks.filter(t => t.status === "inbox");

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">NextStep</h1>
            {profile?.display_name && (
              <p className="text-sm text-muted-foreground">Hi, {profile.display_name.split(" ")[0]}</p>
            )}
          </div>
          <Link to="/settings" className="p-2 rounded-full hover:bg-muted transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Link>
        </div>

        {/* Avatar Companion */}
        <div className="mb-8">
          <AvatarCompanion
            tasks={tasks}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onStartTask={handleStartTask}
            onCapture={() => setShowAddTask(true)}
            onTaskCompleted={handleTaskCompleted}
            onCreateTask={() => setShowAddTask(true)}
          />
        </div>

        {/* Add Task inline */}
        <AnimatePresence>
          {showAddTask && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 flex gap-2"
            >
              <input
                autoFocus
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleCreateTask(); if (e.key === "Escape") setShowAddTask(false); }}
                placeholder="What do you need to do?"
                className="flex-1 bg-card border border-border/60 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
              />
              <button onClick={handleCreateTask} disabled={!newTaskTitle.trim()} className="bg-primary text-primary-foreground rounded-2xl px-4 py-3 text-sm font-medium disabled:opacity-50">
                Add
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Active</h2>
            <div className="space-y-2">
              {activeTasks.map(task => (
                <TaskCard key={task.id} task={task} onStart={handleStartTask} onUpdate={(id, data) => {
                  base44.entities.Task.update(id, data).then(() => loadData());
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Inbox Tasks */}
        {inboxTasks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Inbox ({inboxTasks.length})</h2>
            <div className="space-y-2">
              {inboxTasks.map(task => (
                <TaskCard key={task.id} task={task} onStart={handleStartTask} onUpdate={(id, data) => {
                  base44.entities.Task.update(id, data).then(() => loadData());
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {tasks.length === 0 && !showAddTask && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm mb-4">No tasks yet. Let's add something.</p>
            <button
              onClick={() => setShowAddTask(true)}
              className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
            >
              + Add your first task
            </button>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      {!showAddTask && (
        <button
          onClick={() => setShowAddTask(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

function TaskCard({ task, onStart, onUpdate }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">{STATUS_LABELS[task.status] || task.status}</span>
          {task.energy_required && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${ENERGY_COLORS[task.energy_required]}`}>
              {task.energy_required}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {task.status !== "focus" && (
          <button
            onClick={() => onStart(task)}
            className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
          >
            Start
          </button>
        )}
        <button
          onClick={() => onUpdate(task.id, { status: "completed", completed_at: new Date().toISOString() })}
          className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-accent transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}