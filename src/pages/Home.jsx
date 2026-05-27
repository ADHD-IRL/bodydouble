import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AvatarCompanion from "@/components/AvatarCompanion";
import { Plus, Zap, List, ParkingSquare, X } from "lucide-react";
import AddTaskForm from "@/components/AddTaskForm";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);

  const [loading, setLoading] = useState(true);
  const [nudge, setNudge] = useState(null);
  const [parkingReminder, setParkingReminder] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [me, profiles, taskList, nudges, reminders] = await Promise.all([
      base44.auth.me(),
      base44.entities.UserProfile.list(),
      base44.entities.Task.filter({ status: ["inbox", "today", "focus", "paused", "parked"] }),
      base44.entities.Notification.filter({ read: false, type: "nudge" }, "-created_date", 1),
      base44.entities.Notification.filter({ read: false, type: "reminder" }, "-created_date", 1),
    ]);
    setUser(me);
    setProfile(profiles[0] || null);
    setTasks(taskList);
    setNudge(nudges[0] || null);
    setParkingReminder(reminders[0] || null);
    setLoading(false);
  };

  const dismissNudge = async () => {
    if (nudge) {
      await base44.entities.Notification.update(nudge.id, { read: true });
      setNudge(null);
    }
  };

  const dismissParkingReminder = async () => {
    if (parkingReminder) {
      await base44.entities.Notification.update(parkingReminder.id, { read: true });
      setParkingReminder(null);
    }
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

  const handleStartTask = (task) => {
    navigate("/focus", { state: { task, profile } });
  };

  const handleTaskCompleted = () => {
    loadData();
  };

  const handleTaskCreated = (created) => {
    setTasks(prev => [...prev, created]);
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
          <div className="flex items-center gap-1">
            <Link to="/capture" className="p-2 rounded-full hover:bg-muted transition-colors" title="Quick Capture">
              <Zap className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link to="/tasks" className="p-2 rounded-full hover:bg-muted transition-colors" title="Task List">
              <List className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link to="/parking-lot" className="p-2 rounded-full hover:bg-muted transition-colors" title="Parking Lot">
              <ParkingSquare className="w-5 h-5 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Morning nudge banner */}
        <AnimatePresence>
          {nudge && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3"
            >
              <span className="text-lg shrink-0">☀️</span>
              <p className="text-sm text-amber-900 leading-relaxed flex-1">{nudge.message}</p>
              <button onClick={dismissNudge} className="text-amber-400 hover:text-amber-600 transition-colors shrink-0 mt-0.5">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Parking Lot reminder banner */}
        <AnimatePresence>
          {parkingReminder && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-start gap-3"
            >
              <span className="text-lg shrink-0">🅿️</span>
              <div className="flex-1">
                <p className="text-sm text-blue-900 leading-relaxed">{parkingReminder.message}</p>
                <Link to="/parking-lot" onClick={dismissParkingReminder} className="text-xs text-blue-600 font-medium hover:underline mt-1 inline-block">
                  Go to Parking Lot →
                </Link>
              </div>
              <button onClick={dismissParkingReminder} className="text-blue-300 hover:text-blue-500 transition-colors shrink-0 mt-0.5">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
            <AddTaskForm onCreated={handleTaskCreated} onClose={() => setShowAddTask(false)} />
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

const LOAD_COLORS = {
  low: "bg-sky-100 text-sky-700",
  medium: "bg-orange-100 text-orange-700",
  high: "bg-rose-100 text-rose-700",
};

function TaskCard({ task, onStart, onUpdate }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
        <div className="flex items-center flex-wrap gap-1.5 mt-1">
          <span className="text-xs text-muted-foreground">{STATUS_LABELS[task.status] || task.status}</span>
          {task.energy_required && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${ENERGY_COLORS[task.energy_required]}`}>
              ⚡ {task.energy_required}
            </span>
          )}
          {task.emotional_load && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${LOAD_COLORS[task.emotional_load]}`}>
              💭 {task.emotional_load}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onStart(task)}
          className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
        >
          {task.status === "focus" ? "Continue" : "Start"}
        </button>
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