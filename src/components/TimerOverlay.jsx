import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, RotateCcw } from "lucide-react";

export default function TimerOverlay({ open, onClose, initialSeconds = 120 }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSeconds(initialSeconds);
    setRunning(false);
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

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="bg-card border border-border rounded-3xl p-8 shadow-xl flex flex-col items-center gap-6 w-72">
            <button onClick={onClose} className="self-end text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <p className="text-6xl font-mono font-bold tracking-tight">{mins}:{secs}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setRunning(r => !r)}
                className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {running ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => { setSeconds(initialSeconds); setRunning(false); }}
                className="px-4 py-2.5 rounded-full bg-muted text-muted-foreground text-sm hover:bg-accent"
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