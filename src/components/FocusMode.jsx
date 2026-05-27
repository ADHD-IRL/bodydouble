import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, RotateCcw, CheckCircle2, ParkingSquare } from "lucide-react";

const PRESETS = [5, 10, 15, 25];

export default function FocusMode({ task, onClose, onComplete, onPark }) {
  const [timerMins, setTimerMins] = useState(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSeconds(timerMins * 60);
    setRunning(false);
  }, [timerMins]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setSeconds(timerMins * 60);
  };

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const progress = 1 - seconds / (timerMins * 60);
  const circumference = 2 * Math.PI * 54;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Task title */}
      <div className="text-center mb-10 max-w-sm">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Now focusing on</p>
        <h2 className="text-2xl font-bold text-foreground leading-snug">{task.title}</h2>
      </div>

      {/* Circular timer */}
      <div className="relative w-48 h-48 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke="hsl(var(--primary))" strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-mono font-bold text-foreground">{mins}:{secs}</span>
        </div>
      </div>

      {/* Preset duration pills */}
      <div className="flex gap-2 mb-8">
        {PRESETS.map(m => (
          <button
            key={m}
            onClick={() => setTimerMins(m)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              timerMins === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {m}m
          </button>
        ))}
      </div>

      {/* Timer controls */}
      <div className="flex gap-3 mb-10">
        <button
          onClick={() => setRunning(r => !r)}
          className="px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-all"
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={reset}
          className="p-3 rounded-full bg-muted text-muted-foreground hover:bg-accent transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Task actions */}
      <div className="flex gap-3">
        <button
          onClick={onPark}
          className="px-4 py-2.5 rounded-full bg-muted text-muted-foreground text-sm flex items-center gap-2 hover:bg-accent transition-all"
        >
          <ParkingSquare className="w-4 h-4" /> Park it
        </button>
        <button
          onClick={onComplete}
          className="px-4 py-2.5 rounded-full bg-green-100 text-green-700 text-sm font-medium flex items-center gap-2 hover:bg-green-200 transition-all"
        >
          <CheckCircle2 className="w-4 h-4" /> Done!
        </button>
      </div>
    </motion.div>
  );
}