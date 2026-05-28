import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ListTodo, Archive, BarChart2, Settings, Crosshair, Clock } from "lucide-react";
import DailyAnchors from "@/components/DailyAnchors";
import AvatarCompanion from "@/components/AvatarCompanion";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTaskTime, setNewTaskTime] = useState("");
  const [showInput, setShowInput] = useState(false);
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [allTasks, profiles] = await Promise.all([
      base44.entities.Task.list("-updated_date", 50),
      base44.entities.UserProfile.list(),
    ]);
    setTasks(allTasks);
    setProfile(profiles[0] || null);
    setLoading(false);
  };

  const allActiveTasks = tasks.filter(t =>
    ["not_started", "started", "in_progress", "partly_done"].includes(t.status)
  );

  // Today's tasks: scheduled for today, or no date set
  const activeTasks = allActiveTasks.filter(t =>
    !t.scheduled_date || t.scheduled_date === today
  );

  // Sort by scheduled_time if present
  activeTasks.sort((a, b) => {
    if (a.scheduled_time && b.scheduled_time) return a.scheduled_time.localeCompare(b.scheduled_time);
    if (a.scheduled_time) return -1;
    if (b.scheduled_time) return 1;
    return 0;
  });

  const topTask = activeTasks[0];

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    const data = { title: newTask.trim(), status: "not_started", scheduled_date: newTaskDate };
    if (newTaskTime) data.scheduled_time = newTaskTime;
    const created = await base44.entities.Task.create(data);
    setTasks(prev => [created, ...prev]);
    setNewTask("");
    setNewTaskTime("");
    setNewTaskDate(today);
    setShowInput(false);
  };

  const handleStartFocus = (task) => {
    navigate("/session", { state: { task } });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const name = profile?.display_name?.split(" ")[0] || "";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-8 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-foreground">
              {greeting()}{name ? `, ${name}` : ""}.
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTasks.length} task{activeTasks.length !== 1 ? "s" : ""} today
            </p>
          </div>
          <Link to="/settings" className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
            <Settings className="w-5 h-5" />
          </Link>
        </div>

        {/* Avatar Companion */}
        <div className="mb-8">
          <AvatarCompanion
            tasks={activeTasks}
            profile={profile}
            onUpdateProfile={async (data) => {
              const profiles = await base44.entities.UserProfile.list();
              const p = profiles[0];
              if (p) await base44.entities.UserProfile.update(p.id, data);
              setProfile(prev => ({ ...prev, ...data }));
            }}
            onStartTask={(task) => handleStartFocus(task)}
            onCapture={() => navigate("/capture")}
            onTaskCompleted={loadData}
            onCreateTask={() => setShowInput(true)}
            navigate={navigate}
          />
        </div>

        {/* Daily Anchors */}
        <div className="mb-8">
          <DailyAnchors />
        </div>

        {/* Focus card — top active task */}
        {topTask && (
          <div className="mb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Up next</p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl px-4 py-4"
            >
              <p className="font-serif text-lg text-foreground leading-snug mb-3">{topTask.title}</p>
              <button
                onClick={() => handleStartFocus(topTask)}
                className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Crosshair className="w-4 h-4" /> Start focus session
              </button>
            </motion.div>
          </div>
        )}

        {/* Recent tasks */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Tasks</p>
            <button
              onClick={() => setShowInput(v => !v)}
              className="p-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <AnimatePresence>
            {showInput && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-3 bg-card border border-border rounded-2xl px-4 py-3 space-y-2"
              >
                <input
                  autoFocus
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleAddTask(); if (e.key === "Escape") setShowInput(false); }}
                  placeholder="What needs doing?"
                  className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newTaskDate}
                    onChange={e => setNewTaskDate(e.target.value)}
                    className="flex-1 bg-background border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                  />
                  <input
                    type="time"
                    value={newTaskTime}
                    onChange={e => setNewTaskTime(e.target.value)}
                    className="flex-1 bg-background border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                  />
                </div>
                <button onClick={handleAddTask} disabled={!newTask.trim()} className="w-full bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50">
                  Add task
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            {activeTasks.slice(0, 5).map(task => (
              <div
                key={task.id}
                className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{task.title}</p>
                  {task.scheduled_time && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {task.scheduled_time}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleStartFocus(task)}
                  className="shrink-0 p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Start focus"
                >
                  <Crosshair className="w-4 h-4" />
                </button>
              </div>
            ))}
            {activeTasks.length === 0 && !showInput && (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nothing active. Add a task to get started.
              </p>
            )}
          </div>
        </div>

        {/* Nav links */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { to: "/tasks", icon: ListTodo, label: "All tasks" },
            { to: "/parking-lot", icon: Archive, label: "Parking lot" },
            { to: "/weekly-recap", icon: BarChart2, label: "Weekly recap" },
            { to: "/capture", icon: Plus, label: "Quick capture" },
          ].map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 text-sm text-foreground hover:border-primary/40 hover:bg-oat/40 transition-all"
            >
              <Icon className="w-4 h-4 text-muted-foreground" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}