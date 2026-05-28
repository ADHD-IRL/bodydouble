import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, RotateCcw, Scissors, Zap, Wind, Loader2, Leaf, ChevronRight } from "lucide-react";
import ShrinkTaskModal from "@/components/ShrinkTaskModal";
import SessionClose from "@/components/SessionClose";

const STUCK_OPTIONS = [
  { id: "no_next_step", label: "I don't know the next step" },
  { id: "too_big", label: "It feels too big" },
  { id: "bored", label: "I'm bored" },
  { id: "anxious", label: "I'm anxious" },
  { id: "distracted", label: "I got distracted" },
  { id: "tired", label: "I'm tired" },
  { id: "need_reset", label: "I need a reset" },
];

const AI_PROMPTS = [
  "What's the very next tiny step?",
  "You don't have to finish. Just begin.",
  "Want to restart the timer?",
  "Would making this smaller help?",
  "You're here. That already counts.",
  "What would the easiest version of this look like?",
];

export default function Session() {
  const location = useLocation();
  const navigate = useNavigate();
  const { task } = location.state || {};

  const [session, setSession] = useState(null);
  const [timerMins, setTimerMins] = useState(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentActionIdx, setCurrentActionIdx] = useState(task?.current_tiny_action_index || 0);
  const [showStuck, setShowStuck] = useState(false);
  const [stuckType, setStuckType] = useState(null);
  const [stuckHelp, setStuckHelp] = useState(null);
  const [stuckLoading, setStuckLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(AI_PROMPTS[0]);
  const [promptIdx, setPromptIdx] = useState(0);
  const [showShrink, setShowShrink] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [tinyActions, setTinyActions] = useState(task?.tiny_actions || []);
  const intervalRef = useRef(null);
  const elapsedRef = useRef(null);

  useEffect(() => {
    if (!task) { navigate("/"); return; }
    createSession();
  }, []);

  const createSession = async () => {
    const s = await base44.entities.FocusSession.create({
      task_id: task.id,
      task_title: task.title,
      start_time: new Date().toISOString(),
      timer_length_minutes: timerMins,
      session_status: "started",
      current_tiny_action: tinyActions[currentActionIdx] || "",
    });
    setSession(s);
    await base44.entities.Task.update(task.id, { current_focus_session_id: s.id, status: "in_progress" });
  };

  useEffect(() => {
    setSeconds(timerMins * 60);
    setRunning(false);
  }, [timerMins]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
      elapsedRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
      clearInterval(elapsedRef.current);
    }
    return () => { clearInterval(intervalRef.current); clearInterval(elapsedRef.current); };
  }, [running]);

  useEffect(() => {
    if (seconds === 0 && running) {
      setRunning(false);
      setAiPrompt("Great work. Want to take a break or keep going?");
    }
  }, [seconds]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const progress = 1 - seconds / (timerMins * 60);
  const circumference = 2 * Math.PI * 56;

  const handleStuckType = async (type) => {
    setStuckType(type);
    setStuckLoading(true);
    const res = await base44.functions.invoke("getStuckHelp", {
      stuck_type: type,
      task_title: task.title,
      current_tiny_action: tinyActions[currentActionIdx] || "",
    });
    setStuckHelp(res.data);
    setStuckLoading(false);
    if (session) {
      const events = session.stuck_events || [];
      await base44.entities.FocusSession.update(session.id, {
        stuck_events: [...events, { timestamp: new Date().toISOString(), type, resolution: res.data?.action_label || "" }]
      });
    }
  };

  const handleDrift = async () => {
    if (session) {
      const events = session.drift_events || [];
      await base44.entities.FocusSession.update(session.id, {
        drift_events: [...events, { timestamp: new Date().toISOString() }]
      });
    }
    setRunning(false);
    setAiPrompt("You drifted — and that's okay. Want to come back?");
  };

  const handleNudge = () => {
    const next = AI_PROMPTS[(promptIdx + 1) % AI_PROMPTS.length];
    setPromptIdx(i => i + 1);
    setAiPrompt(next);
  };

  const handleBreak = () => {
    setRunning(false);
    setTimerMins(2);
    setSeconds(2 * 60);
    setAiPrompt("Two minutes. Breathe, stretch, sip something. I'll be here.");
  };

  const handleShrinkSave = async (steps) => {
    setTinyActions(steps);
    await base44.entities.Task.update(task.id, { tiny_actions: steps });
    setShowShrink(false);
  };

  const nextAction = tinyActions[currentActionIdx];
  const hasMoreActions = currentActionIdx < tinyActions.length - 1;

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setShowClose(true)} className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {[10, 15, 25, 45].map(m => (
                <button key={m} onClick={() => { setTimerMins(m); setSeconds(m * 60); setRunning(false); }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${timerMins === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Task */}
          <div className="text-center mb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">Focusing on</p>
            <h1 className="font-serif text-2xl text-foreground leading-snug">{task?.title}</h1>
          </div>

          {/* Tiny next action */}
          {nextAction && (
            <div className="bg-oat/60 border border-border rounded-2xl px-4 py-3 mb-6 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-moss shrink-0" />
              <p className="text-sm text-foreground flex-1">{nextAction}</p>
              {hasMoreActions && (
                <button onClick={() => setCurrentActionIdx(i => i + 1)} className="shrink-0 text-muted-foreground hover:text-clay transition-colors" title="Next step">
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Timer */}
          <div className="relative w-52 h-52 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
              <circle
                cx="64" cy="64" r="56" fill="none"
                stroke="hsl(var(--primary))" strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-4xl font-semibold text-foreground">{mins}:{secs}</span>
              {elapsed > 0 && <span className="text-xs text-muted-foreground mt-1">{Math.floor(elapsed / 60)}m elapsed</span>}
            </div>
          </div>

          {/* Timer controls */}
          <div className="flex gap-3 justify-center mb-6">
            <button onClick={() => { setSeconds(timerMins * 60); setRunning(false); }} className="p-3 rounded-full bg-muted text-muted-foreground hover:bg-accent transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRunning(r => !r)}
              className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? "Pause" : seconds === timerMins * 60 ? "Start" : "Resume"}
            </button>
          </div>

          {/* AI prompt bubble */}
          <AnimatePresence mode="wait">
            <motion.div
              key={aiPrompt}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-border rounded-2xl px-4 py-3 text-center mb-6"
            >
              <p className="text-sm text-muted-foreground italic">"{aiPrompt}"</p>
            </motion.div>
          </AnimatePresence>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button onClick={() => { setShowStuck(true); setStuckType(null); setStuckHelp(null); }}
              className="flex flex-col items-center gap-1 bg-card border border-border rounded-2xl px-2 py-3 text-xs text-muted-foreground hover:border-clay/40 hover:text-clay transition-colors">
              <span className="text-lg">😶</span> I got stuck
            </button>
            <button onClick={handleDrift}
              className="flex flex-col items-center gap-1 bg-card border border-border rounded-2xl px-2 py-3 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
              <Wind className="w-5 h-5" /> I drifted
            </button>
            <button onClick={() => setShowShrink(true)}
              className="flex flex-col items-center gap-1 bg-card border border-border rounded-2xl px-2 py-3 text-xs text-muted-foreground hover:border-moss/40 hover:text-moss transition-colors">
              <Scissors className="w-5 h-5" /> Make smaller
            </button>
            <button onClick={handleNudge}
              className="flex flex-col items-center gap-1 bg-card border border-border rounded-2xl px-2 py-3 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
              <Zap className="w-5 h-5" /> Ask for nudge
            </button>
            <button onClick={handleBreak}
              className="flex flex-col items-center gap-1 bg-card border border-border rounded-2xl px-2 py-3 text-xs text-muted-foreground hover:border-accent-foreground/30 hover:text-foreground transition-colors">
              <span className="text-lg">☕</span> 2-min break
            </button>
            <button onClick={() => setShowClose(true)}
              className="flex flex-col items-center gap-1 bg-card border border-border rounded-2xl px-2 py-3 text-xs text-muted-foreground hover:border-foreground/20 hover:text-foreground transition-colors">
              <span className="text-lg">🏁</span> End session
            </button>
          </div>
        </div>
      </div>

      {/* Stuck modal */}
      <AnimatePresence>
        {showStuck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-bark/30 backdrop-blur-sm flex items-end justify-center"
            onClick={e => e.target === e.currentTarget && setShowStuck(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="bg-card rounded-t-3xl w-full max-w-md px-5 pt-5 pb-10"
            >
              {!stuckType ? (
                <>
                  <h2 className="font-serif text-lg text-foreground mb-1">What kind of stuck?</h2>
                  <p className="text-sm text-muted-foreground mb-4">No wrong answer.</p>
                  <div className="space-y-2">
                    {STUCK_OPTIONS.map(o => (
                      <button key={o.id} onClick={() => handleStuckType(o.id)}
                        className="w-full text-left px-4 py-3 rounded-xl bg-muted text-sm text-foreground hover:bg-accent transition-colors">
                        {o.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : stuckLoading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Finding a path forward…</span>
                </div>
              ) : stuckHelp ? (
                <div className="space-y-4">
                  <h2 className="font-serif text-lg text-foreground">Here's something to try</h2>
                  <p className="text-sm text-foreground leading-relaxed bg-oat/60 rounded-xl px-4 py-3">{stuckHelp.suggestion}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowStuck(false)} className="flex-1 py-2.5 rounded-xl bg-muted text-sm text-muted-foreground hover:bg-accent transition-colors">
                      Dismiss
                    </button>
                    <button onClick={() => { setShowStuck(false); if (stuckHelp.action_label === "Take a break") handleBreak(); else if (stuckHelp.action_label === "Make it smaller") setShowShrink(true); else if (stuckHelp.action_label === "Restart timer") { setSeconds(timerMins * 60); setRunning(false); } }}
                      className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                      {stuckHelp.action_label}
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shrink modal */}
      <AnimatePresence>
        {showShrink && (
          <ShrinkTaskModal
            task={{ ...task, tiny_actions: tinyActions }}
            onSave={handleShrinkSave}
            onClose={() => setShowShrink(false)}
          />
        )}
      </AnimatePresence>

      {/* Close / end session */}
      <AnimatePresence>
        {showClose && (
          <SessionClose
            task={task}
            session={session}
            elapsedMinutes={Math.floor(elapsed / 60)}
            currentTinyAction={nextAction}
            onDone={() => navigate("/")}
          />
        )}
      </AnimatePresence>
    </>
  );
}