import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Timer, ParkingSquare, CheckCircle2, Play, Pause, RotateCcw, ChevronRight } from "lucide-react";
import { AVATARS } from "@/components/AvatarCompanion";

const PHASES = {
  WARMUP: "warmup",
  FOCUSING: "focusing",
  DEBRIEF: "debrief",
};

function useTimer(initialSeconds, running) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const ref = useRef(null);

  useEffect(() => { setSeconds(initialSeconds); }, [initialSeconds]);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    } else {
      clearInterval(ref.current);
    }
    return () => clearInterval(ref.current);
  }, [running]);

  const reset = () => setSeconds(initialSeconds);
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return { seconds, display: `${mins}:${secs}`, reset };
}

export default function FocusSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const task = location.state?.task;
  const profile = location.state?.profile;

  const avatarId = profile?.companion_avatar || "plant";
  const avatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];

  const [phase, setPhase] = useState(PHASES.WARMUP);
  const [firstStep, setFirstStep] = useState("");
  const [avatarMsg, setAvatarMsg] = useState("");
  const [timerMins, setTimerMins] = useState(25);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [parkText, setParkText] = useState("");
  const [showPark, setShowPark] = useState(false);
  const [parkedCount, setParkedCount] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);

  // Debrief state
  const [difficulty, setDifficulty] = useState(null);
  const [urge, setUrge] = useState(null);
  const [completionState, setCompletionState] = useState(null);
  const [futureNote, setFutureNote] = useState("");
  const [debriefDone, setDebriefDone] = useState(false);

  const { seconds, display, reset } = useTimer(timerMins * 60, timerRunning);

  // Redirect if no task passed
  useEffect(() => {
    if (!task) navigate("/");
  }, [task]);

  // Auto-end timer
  useEffect(() => {
    if (seconds === 0 && timerRunning) {
      setTimerRunning(false);
      setPhase(PHASES.DEBRIEF);
    }
  }, [seconds, timerRunning]);

  // Warmup: get AI first-step prompt
  useEffect(() => {
    if (!task) return;
    const energy = task.energy_required;
    const load = task.emotional_load;
    const needsWarmup = energy === "high" || load === "high" || energy === "medium" || load === "medium";

    const warmupTip = needsWarmup
      ? energy === "high" || load === "high"
        ? "Before you start, take 3 slow breaths or shake out your hands — this task has some weight to it."
        : "Take a moment to settle in. Maybe a sip of water or one slow breath."
      : "You've got this. Let's just identify your first move.";

    setAvatarMsg(`${warmupTip}\n\nWhat's the very first physical action for "${task.title}"?`);
  }, [task]);

  const handleBeginFocus = async () => {
    setAiLoading(true);
    const start = new Date().toISOString();
    setSessionStartTime(start);
    await base44.entities.Task.update(task.id, { status: "focus", last_opened_at: start });

    // AI encouragement for starting
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are ${avatar.name}, a warm body-double companion for someone with ADHD.
They are about to start: "${task.title}"
Their first step: "${firstStep || "not specified"}"
Energy: ${task.energy_required || "unknown"}, Emotional load: ${task.emotional_load || "unknown"}

Give a single short sentence of warm encouragement to start. Max 20 words. Sound human and real.`,
      });
      setAvatarMsg(typeof res === "string" ? res : res?.text || "You've got this. I'm right here with you.");
    } catch {
      setAvatarMsg("You've got this. I'm right here with you.");
    }
    setAiLoading(false);
    setPhase(PHASES.FOCUSING);
    setTimerRunning(true);
  };

  const handleParkThought = async () => {
    if (!parkText.trim()) return;
    await base44.entities.ParkedThought.create({ text: parkText.trim(), type: "tangent", linked_task_id: task.id });
    setParkedCount(c => c + 1);
    setParkText("");
    setShowPark(false);
    setAvatarMsg("Parked. Now back to your task — you were working on: " + (firstStep || task.title));
  };

  const handleEndEarly = () => {
    setTimerRunning(false);
    setPhase(PHASES.DEBRIEF);
  };

  const handleFinishDebrief = async () => {
    const endTime = new Date().toISOString();
    const startTime = sessionStartTime || endTime;
    const elapsed = Math.round((new Date(endTime) - new Date(startTime)) / 60000);

    await Promise.all([
      base44.entities.TaskSession.create({
        task_id: task.id,
        start_time: startTime,
        end_time: endTime,
        timer_length_minutes: timerMins,
        user_reported_difficulty: difficulty,
        user_reported_urge: urge,
        parked_thoughts_count: parkedCount,
        completion_state: completionState || "completed",
        future_you_note: futureNote || undefined,
      }),
      base44.entities.Task.update(task.id, {
        status: completionState === "paused" ? "paused" : completionState === "good_enough_done" ? "good_enough_done" : "completed",
        completed_at: completionState !== "paused" ? endTime : undefined,
        future_you_note: futureNote || undefined,
      }),
    ]);

    setDebriefDone(true);
    setTimeout(() => navigate("/"), 2000);
  };

  if (!task) return null;

  const timerProgress = timerMins > 0 ? 1 - seconds / (timerMins * 60) : 0;
  // Momentum: blend timer progress with ease-of-effort (low difficulty = more momentum)
  const difficultyBoost = difficulty ? (6 - difficulty) / 5 * 0.15 : 0; // up to +15% boost for easy sessions
  const momentumProgress = Math.min(1, timerProgress + difficultyBoost);
  const progress = timerProgress;
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Vertical momentum bar — right edge, only during focus */}
      {phase === PHASES.FOCUSING && (
        <div className="fixed right-0 top-0 bottom-0 w-1.5 bg-muted/40 z-10">
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-t-full bg-primary/30"
            animate={{ height: `${momentumProgress * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-t-full bg-primary/60"
            animate={{ height: `${timerProgress * 100}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>
      )}
      <div className="max-w-md mx-auto px-4 py-6 w-full flex-1 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate("/")} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            {phase === PHASES.WARMUP ? "Warm up" : phase === PHASES.FOCUSING ? "In session" : "Wrap up"}
          </span>
          <div className="w-9" />
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
            {avatar.img
              ? <img src={avatar.img} alt={avatar.name} className="w-20 h-20 rounded-full object-cover shadow-md border-4 border-background" />
              : <span className="text-6xl">{avatar.emoji}</span>
            }
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div
              key={avatarMsg}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 bg-card border border-border/60 rounded-3xl rounded-tl-sm px-5 py-4 shadow-sm w-full max-w-sm text-center"
            >
              {aiLoading ? (
                <div className="flex gap-1.5 justify-center py-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                      className="w-2 h-2 bg-muted-foreground/40 rounded-full" />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{avatarMsg}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Task title */}
        <div className="bg-card border border-border/60 rounded-2xl px-4 py-3 mb-6 text-center">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Working on</p>
          <p className="text-base font-semibold text-foreground">{task.title}</p>
          {firstStep && phase !== PHASES.WARMUP && (
            <p className="text-sm text-muted-foreground mt-1">→ {firstStep}</p>
          )}
        </div>

        {/* WARMUP PHASE */}
        {phase === PHASES.WARMUP && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <input
              autoFocus
              value={firstStep}
              onChange={e => setFirstStep(e.target.value)}
              onKeyDown={e => e.key === "Enter" && firstStep.trim() && handleBeginFocus()}
              placeholder="My first action is..."
              className="w-full bg-card border border-border/60 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
            />
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs text-muted-foreground">Timer length:</p>
              {[5, 10, 15, 25, 45].map(m => (
                <button key={m} onClick={() => setTimerMins(m)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${timerMins === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                  {m}m
                </button>
              ))}
            </div>
            <button
              onClick={handleBeginFocus}
              disabled={aiLoading}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-60"
            >
              <Play className="w-4 h-4" /> Start {timerMins}-minute session
            </button>
            <button onClick={() => navigate("/")} className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Not now
            </button>
          </motion.div>
        )}

        {/* FOCUSING PHASE */}
        {phase === PHASES.FOCUSING && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
            {/* Circular timer */}
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-mono font-bold text-foreground">{display}</span>
              </div>
            </div>

            {/* Timer controls */}
            <div className="flex gap-3">
              <button onClick={() => setTimerRunning(r => !r)}
                className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-all">
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {timerRunning ? "Pause" : "Resume"}
              </button>
              <button onClick={reset}
                className="px-4 py-2.5 rounded-full bg-muted text-muted-foreground text-sm hover:bg-accent transition-all">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Park a thought */}
            <AnimatePresence>
              {showPark && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="w-full flex gap-2">
                  <input autoFocus value={parkText} onChange={e => setParkText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleParkThought(); if (e.key === "Escape") setShowPark(false); }}
                    placeholder="Park this thought..."
                    className="flex-1 bg-card border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                  />
                  <button onClick={handleParkThought} disabled={!parkText.trim()}
                    className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50">
                    Park
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2 flex-wrap justify-center">
              <button onClick={() => setShowPark(v => !v)}
                className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm hover:bg-accent transition-all flex items-center gap-1.5">
                <ParkingSquare className="w-3.5 h-3.5" /> Park a thought
                {parkedCount > 0 && <span className="bg-primary/20 text-primary text-xs rounded-full px-1.5">{parkedCount}</span>}
              </button>
              <button onClick={handleEndEarly}
                className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm hover:bg-accent transition-all">
                End session
              </button>
            </div>
          </motion.div>
        )}

        {/* DEBRIEF PHASE */}
        {phase === PHASES.DEBRIEF && !debriefDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <h2 className="text-base font-semibold text-foreground text-center">How did that go?</h2>

            {/* Completion state */}
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-2">What's the status now?</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: "completed", l: "✅ Done!" },
                  { v: "good_enough_done", l: "👍 Good enough" },
                  { v: "paused", l: "⏸ Need another session" },
                ].map(o => (
                  <button key={o.v} onClick={() => setCompletionState(o.v)}
                    className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${completionState === o.v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-2">How hard was it? (1–5)</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setDifficulty(n)}
                    className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${difficulty === n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* OCD urge */}
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">Urge to check/redo? (0 = none, 10 = intense)</p>
              <div className="flex gap-1 flex-wrap">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <button key={n} onClick={() => setUrge(n)}
                    className={`w-8 h-8 rounded-full text-xs font-semibold transition-all ${urge === n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Future you note */}
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-2">Note for Future You (optional)</p>
              <textarea value={futureNote} onChange={e => setFutureNote(e.target.value)}
                placeholder="Next time, start by..."
                rows={2}
                className="w-full bg-card border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none"
              />
            </div>

            <button onClick={handleFinishDebrief} disabled={!completionState}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50">
              <CheckCircle2 className="w-4 h-4" /> Finish session
            </button>
          </motion.div>
        )}

        {/* Done screen */}
        {debriefDone && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-8">
            <span className="text-5xl">🎉</span>
            <p className="text-lg font-semibold text-foreground">Session complete!</p>
            <p className="text-sm text-muted-foreground text-center">Heading back home…</p>
          </motion.div>
        )}

      </div>
    </div>
  );
}