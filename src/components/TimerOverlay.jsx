import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, RotateCcw } from "lucide-react";

const PRESETS = [
  { label: "2 min", seconds: 120 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
  { label: "25 min", seconds: 1500 },
  { label: "45 min", seconds: 2700 },
];

export default function TimerOverlay({ open, onClose, initialSeconds = 120 }) {
  const [selected, setSelected] = useState(initialSeconds);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const [customMins, setCustomMins] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSelected(initialSeconds);
    setSeconds(initialSeconds);
    setRunning(false);
    setShowCustom(false);
    setCustomMins("");
  }, [initialSeconds, open]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) { clearInterval(intervalRef.current); setRunning(false); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handlePreset = (secs) => {
    setSelected(secs);
    setSeconds(secs);
    setRunning(false);
    setShowCustom(false);
    setCustomMins("");
  };

  const handleCustomSubmit = () => {
    const mins = parseFloat(customMins);
    if (!mins || mins <= 0) return;
    const secs = Math.round(mins * 60);
    setSelected(secs);
    setSeconds(secs);
    setRunning(false);
    setShowCustom(false);
    setCustomMins("");
  };

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const started = seconds !== selected;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xl flex flex-col items-center gap-5 w-80">
            {/* Close */}
            <button onClick={onClose} className="self-end text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>

            {/* Time display */}
            <p className="text-6xl font-mono font-bold tracking-tight">{mins}:{secs}</p>

            {/* Preset pills */}
            {!started && (
              <div className="flex flex-wrap justify-center gap-2 w-full">
                {PRESETS.map(p => (
                  <button
                    key={p.seconds}
                    onClick={() => handlePreset(p.seconds)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selected === p.seconds
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowCustom(v => !v)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    showCustom ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Custom
                </button>
              </div>
            )}

            {/* Custom input */}
            <AnimatePresence>
              {showCustom && !started && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 w-full overflow-hidden"
                >
                  <input
                    autoFocus
                    type="number"
                    min="1"
                    max="180"
                    value={customMins}
                    onChange={e => setCustomMins(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCustomSubmit()}
                    placeholder="Minutes"
                    className="flex-1 bg-background border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                  />
                  <button
                    onClick={handleCustomSubmit}
                    disabled={!customMins || parseFloat(customMins) <= 0}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                  >
                    Set
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex gap-3">
              <button
                onClick={() => setRunning(r => !r)}
                className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-all"
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {running ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => { setSeconds(selected); setRunning(false); }}
                className="px-4 py-2.5 rounded-full bg-muted text-muted-foreground text-sm hover:bg-accent transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {seconds === 0 && (
              <p className="text-sm text-primary font-medium animate-pulse">Time's up! Great work 🎉</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}