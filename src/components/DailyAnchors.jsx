import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Check, Sun } from "lucide-react";
import { motion } from "framer-motion";

const DEFAULT_ANCHORS = [
  { label: "Wake up", scheduled_time: "07:00" },
  { label: "Eat breakfast", scheduled_time: "08:00" },
  { label: "Start work / study", scheduled_time: "09:00" },
  { label: "Lunch break", scheduled_time: "12:00" },
  { label: "Evening reset", scheduled_time: "18:00" },
  { label: "Wind down", scheduled_time: "21:00" },
];

export default function DailyAnchors() {
  const [anchors, setAnchors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [anchorList, logList] = await Promise.all([
      base44.entities.DailyAnchor.list("order", 20),
      base44.entities.AnchorLog.filter({ date: today }),
    ]);
    setAnchors(anchorList.length > 0 ? anchorList : DEFAULT_ANCHORS);
    setLogs(logList);
    setLoading(false);
  };

  const isLogged = (anchor) => logs.some(l => l.anchor_id === anchor.id);

  const toggle = async (anchor) => {
    if (!anchor.id) return; // default anchors not yet saved
    const existing = logs.find(l => l.anchor_id === anchor.id);
    if (existing) {
      await base44.entities.AnchorLog.delete(existing.id);
      setLogs(prev => prev.filter(l => l.id !== existing.id));
    } else {
      const log = await base44.entities.AnchorLog.create({
        anchor_id: anchor.id,
        date: today,
        completed_at: new Date().toISOString(),
      });
      setLogs(prev => [...prev, log]);
    }
  };

  if (loading) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sun className="w-4 h-4 text-clay" />
        <h2 className="font-serif text-base text-foreground">Today's anchors</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {anchors.filter(a => a.enabled !== false && !a.is_medication).map((anchor, i) => {
          const done = isLogged(anchor);
          return (
            <motion.button
              key={anchor.id || i}
              onClick={() => toggle(anchor)}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                done
                  ? "bg-moss/15 border-moss/30 text-moss"
                  : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {done && <Check className="w-3 h-3" />}
              {anchor.label}
              {anchor.scheduled_time && <span className="text-muted-foreground ml-0.5">{anchor.scheduled_time}</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}