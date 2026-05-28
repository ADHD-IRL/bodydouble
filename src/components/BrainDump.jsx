import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Trash2, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BrainDump({ onConvertToTask }) {
  const [thoughts, setThoughts] = useState([]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.QuickThought.filter({ category: "unreviewed" }, "-created_date", 10).then(setThoughts);
  }, []);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setSaving(true);
    const created = await base44.entities.QuickThought.create({ text: text.trim(), category: "unreviewed" });
    setThoughts(prev => [created, ...prev]);
    setText("");
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.QuickThought.delete(id);
    setThoughts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="mb-6">
      <h2 className="font-serif text-base text-foreground mb-3">Brain dump</h2>
      <p className="text-xs text-muted-foreground mb-3">Drop anything here. It doesn't have to make sense.</p>

      <div className="flex gap-2 mb-3">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="What's on your mind?"
          className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30"
        />
        <button
          onClick={handleAdd}
          disabled={!text.trim() || saving}
          className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {thoughts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 mb-2"
          >
            <p className="flex-1 text-sm text-foreground">{t.text}</p>
            <button onClick={() => onConvertToTask(t.text)} className="p-1 text-muted-foreground hover:text-clay transition-colors" title="Turn into task">
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button onClick={() => handleDelete(t.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}