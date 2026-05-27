import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plus, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function QuickCapture() {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleCapture = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    const created = await base44.entities.QuickThought.create({ text: text.trim(), category: "unreviewed" });
    setSaved(prev => [created, ...prev]);
    setText("");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
    setSubmitting(false);
  };

  const handlePromoteToTask = async (thought) => {
    await base44.entities.Task.create({ title: thought.text, status: "inbox" });
    await base44.entities.QuickThought.update(thought.id, { category: "task" });
    setSaved(prev => prev.filter(t => t.id !== thought.id));
  };

  const handlePark = async (thought) => {
    await base44.entities.ParkedThought.create({ text: thought.text, type: "other" });
    await base44.entities.QuickThought.delete(thought.id);
    setSaved(prev => prev.filter(t => t.id !== thought.id));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Quick Capture</h1>
            <p className="text-sm text-muted-foreground">Brain dump, no pressure</p>
          </div>
        </div>

        {/* Input */}
        <div className="mb-6">
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleCapture(); } }}
            placeholder="What's on your mind? Just type it out..."
            rows={3}
            className="w-full bg-card border border-border/60 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">Press Enter to capture, Shift+Enter for new line</p>
            <button
              onClick={handleCapture}
              disabled={!text.trim() || submitting}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-full disabled:opacity-50 hover:bg-primary/90 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              Capture
            </button>
          </div>
        </div>

        {/* Just saved flash */}
        <AnimatePresence>
          {justSaved && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 text-center text-sm text-primary font-medium"
            >
              ✓ Captured!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Captured items */}
        {saved.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Just captured
            </h2>
            <div className="space-y-2">
              <AnimatePresence>
                {saved.map(thought => (
                  <motion.div
                    key={thought.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-card border border-border/60 rounded-2xl px-4 py-3"
                  >
                    <p className="text-sm text-foreground mb-2">{thought.text}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePromoteToTask(thought)}
                        className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                      >
                        + Task
                      </button>
                      <button
                        onClick={() => handlePark(thought)}
                        className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-accent transition-colors"
                      >
                        Park it
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Empty hint */}
        {saved.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">Start typing to capture a thought.</p>
            <p className="text-xs text-muted-foreground mt-1">Each item can become a task or get parked for later.</p>
          </div>
        )}
      </div>
    </div>
  );
}