import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Check, Play, Loader2, RefreshCw, AlertTriangle, Plus, Trash2, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { AVATARS } from "@/components/AvatarCompanion";
import { motion, AnimatePresence } from "framer-motion";

const TONES = [
  { v: "gentle",   l: "Gentle",   desc: "Soft, patient, reassuring" },
  { v: "direct",   l: "Direct",   desc: "Clear and no-nonsense" },
  { v: "playful",  l: "Playful",  desc: "Light, fun, energetic" },
  { v: "minimal",  l: "Minimal",  desc: "Short and to the point" },
];

const TASK_LIMITS = [1, 2, 3, 4, 5];

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("plant");
  const [tone, setTone] = useState("gentle");
  const [taskLimit, setTaskLimit] = useState(3);
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceName, setVoiceName] = useState("");
  const [voiceRate, setVoiceRate] = useState(0.9);
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [testingVoice, setTestingVoice] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Anchors state
  const [anchors, setAnchors] = useState([]);
  const [newAnchorLabel, setNewAnchorLabel] = useState("");
  const [newAnchorTime, setNewAnchorTime] = useState("");
  const [showAddAnchor, setShowAddAnchor] = useState(false);

  useEffect(() => {
    loadProfile();
    loadVoices();
    loadAnchors();
  }, []); 
  
  const loadAnchors = async () => {
    const list = await base44.entities.DailyAnchor.list("order", 50);
    setAnchors(list);
  };

  const handleAddAnchor = async () => {
    if (!newAnchorLabel.trim()) return;
    const created = await base44.entities.DailyAnchor.create({
      label: newAnchorLabel.trim(),
      scheduled_time: newAnchorTime || "",
      enabled: true,
      order: anchors.length,
    });
    setAnchors(prev => [...prev, created]);
    setNewAnchorLabel("");
    setNewAnchorTime("");
    setShowAddAnchor(false);
  };

  const handleDeleteAnchor = async (id) => {
    await base44.entities.DailyAnchor.delete(id);
    setAnchors(prev => prev.filter(a => a.id !== id));
  };

  const handleToggleAnchor = async (anchor) => {
    const updated = { ...anchor, enabled: !anchor.enabled };
    setAnchors(prev => prev.map(a => a.id === anchor.id ? updated : a));
    await base44.entities.DailyAnchor.update(anchor.id, { enabled: updated.enabled });
  };

  const loadProfile = async () => {
    const profiles = await base44.entities.UserProfile.list();
    const p = profiles[0] || null;
    setProfile(p);
    if (p) {
      setDisplayName(p.display_name || "");
      setAvatar(p.companion_avatar || "plant");
      setTone(p.preferred_tone || "gentle");
      setTaskLimit(p.today_task_limit || 3);
      setVoiceOn(p.companion_voice_on || false);
      setVoiceName(p.voice_name || "");
      setVoiceRate(p.voice_rate ?? 0.9);
      setVoicePitch(p.voice_pitch ?? 1.0);
    }
    setLoading(false);
  };

  const loadVoices = () => {
    const set = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      setAvailableVoices(voices.filter(v => v.lang.startsWith("en")));
    };
    set();
    window.speechSynthesis?.addEventListener("voiceschanged", set);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      display_name: displayName,
      companion_avatar: avatar,
      preferred_tone: tone,
      today_task_limit: taskLimit,
      companion_voice_on: voiceOn,
      voice_name: voiceName,
      voice_rate: voiceRate,
      voice_pitch: voicePitch,
    };
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, data);
    } else {
      await base44.entities.UserProfile.create(data);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetDay = async () => {
    setResetting(true);
    // Find all active/today/focus/paused tasks
    const tasks = await base44.entities.Task.filter({ status: ["today", "focus", "paused", "inbox"] });
    const unfinished = tasks.filter(t => ["today", "focus", "paused"].includes(t.status));
    // Move each to parked + create a ParkedThought entry
    await Promise.all(unfinished.map(t =>
      Promise.all([
        base44.entities.Task.update(t.id, { status: "parked" }),
        base44.entities.ParkedThought.create({ text: t.title, type: "task", linked_task_id: t.id, urgency_guess: "low" }),
      ])
    ));
    setResetting(false);
    setResetDone(true);
    setConfirmReset(false);
    setTimeout(() => setResetDone(false), 3000);
  };

  const testVoice = () => {
    if (!window.speechSynthesis) return;
    setTestingVoice(true);
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance("Hey, I'm here with you today.");
    utter.rate = voiceRate;
    utter.pitch = voicePitch;
    if (voiceName) {
      const match = availableVoices.find(v => v.name === voiceName);
      if (match) utter.voice = match;
    }
    utter.onend = () => setTestingVoice(false);
    utter.onerror = () => setTestingVoice(false);
    window.speechSynthesis.speak(utter);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6 pb-28">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </div>
        </div>

        <div className="space-y-8">

          {/* Your name */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Your name</h2>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="What should your companion call you?"
              className="w-full bg-card border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
            />
          </section>

          {/* Companion */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Companion</h2>
            <div className="grid grid-cols-3 gap-3">
              {AVATARS.map(a => (
                <button
                  key={a.id}
                  onClick={() => setAvatar(a.id)}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                    avatar === a.id ? "border-primary bg-primary/5" : "border-border/60 bg-card hover:border-border"
                  }`}
                >
                  {avatar === a.id && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                  <img src={a.img} alt={a.name} className="w-14 h-14 rounded-full object-cover" />
                  <span className="text-xs font-medium text-foreground">{a.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Companion tone */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Companion tone</h2>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map(t => (
                <button
                  key={t.v}
                  onClick={() => setTone(t.v)}
                  className={`flex flex-col items-start px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    tone === t.v ? "border-primary bg-primary/5" : "border-border/60 bg-card hover:border-border"
                  }`}
                >
                  <span className="text-sm font-medium text-foreground">{t.l}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Daily task limit */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Daily task limit</h2>
            <p className="text-xs text-muted-foreground mb-3">Max tasks your companion will suggest per day</p>
            <div className="flex gap-2">
              {TASK_LIMITS.map(n => (
                <button
                  key={n}
                  onClick={() => setTaskLimit(n)}
                  className={`w-12 h-12 rounded-full text-sm font-semibold transition-all ${
                    taskLimit === n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>

          {/* Voice */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Companion voice</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Speak companion messages aloud</p>
              </div>
              <button
                onClick={() => setVoiceOn(v => !v)}
                className={`w-12 h-6 rounded-full transition-colors relative ${voiceOn ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${voiceOn ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>

            {voiceOn && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Voice selection */}
                {availableVoices.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-2">Voice</p>
                    <select
                      value={voiceName}
                      onChange={e => setVoiceName(e.target.value)}
                      className="w-full bg-card border border-border/60 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50"
                    >
                      <option value="">Default voice</option>
                      {availableVoices.map(v => (
                        <option key={v.name} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Rate */}
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-xs text-muted-foreground font-medium">Speed</p>
                    <span className="text-xs text-muted-foreground">{voiceRate.toFixed(1)}x</span>
                  </div>
                  <input type="range" min="0.5" max="1.5" step="0.1" value={voiceRate}
                    onChange={e => setVoiceRate(parseFloat(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Pitch */}
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-xs text-muted-foreground font-medium">Pitch</p>
                    <span className="text-xs text-muted-foreground">{voicePitch.toFixed(1)}</span>
                  </div>
                  <input type="range" min="0.5" max="2.0" step="0.1" value={voicePitch}
                    onChange={e => setVoicePitch(parseFloat(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Test */}
                <button
                  onClick={testVoice}
                  disabled={testingVoice}
                  className="flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-50"
                >
                  {testingVoice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {testingVoice ? "Playing…" : "Test voice"}
                </button>
              </motion.div>
            )}
          </section>

          {/* Daily Anchors */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5" /> Daily anchors
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Routine checkpoints shown on your home screen</p>
              </div>
              <button
                onClick={() => setShowAddAnchor(v => !v)}
                className="p-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <AnimatePresence>
              {showAddAnchor && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-3 bg-card border border-border rounded-xl px-4 py-3 space-y-2"
                >
                  <input
                    autoFocus
                    value={newAnchorLabel}
                    onChange={e => setNewAnchorLabel(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleAddAnchor(); if (e.key === "Escape") setShowAddAnchor(false); }}
                    placeholder="Anchor label (e.g. Morning walk)"
                    className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                  />
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={newAnchorTime}
                      onChange={e => setNewAnchorTime(e.target.value)}
                      className="flex-1 bg-background border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                    />
                    <button
                      onClick={handleAddAnchor}
                      disabled={!newAnchorLabel.trim()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              {anchors.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No anchors yet. Add one above.</p>
              )}
              {anchors.map(anchor => (
                <div key={anchor.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                  <button
                    onClick={() => handleToggleAnchor(anchor)}
                    className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${anchor.enabled !== false ? "bg-primary" : "bg-muted"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${anchor.enabled !== false ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                  <span className="flex-1 text-sm text-foreground">{anchor.label}</span>
                  {anchor.scheduled_time && (
                    <span className="text-xs text-muted-foreground">{anchor.scheduled_time}</span>
                  )}
                  <button onClick={() => handleDeleteAnchor(anchor.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Reset Day */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Hard day reset</h2>
            <p className="text-xs text-muted-foreground mb-3">Moves all active & today tasks to the Parking Lot so you can start fresh without losing anything.</p>
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-border/60 bg-card text-sm text-muted-foreground hover:border-destructive/40 hover:text-destructive transition-all w-full"
              >
                <RefreshCw className="w-4 h-4 shrink-0" />
                Reset my day
              </button>
            ) : (
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">This will move all your active tasks to the Parking Lot. Nothing gets deleted. Continue?</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetDay}
                    disabled={resetting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium disabled:opacity-60"
                  >
                    {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : resetDone ? <Check className="w-3.5 h-3.5" /> : null}
                    {resetting ? "Resetting…" : resetDone ? "Done!" : "Yes, reset my day"}
                  </button>
                  <button onClick={() => setConfirmReset(false)} className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm hover:bg-accent transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-border px-4 py-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              saved ? "bg-green-500 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"
            } disabled:opacity-60`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
            {saving ? "Saving…" : saved ? "Saved!" : "Save settings"}
          </button>
        </div>
      </div>
    </div>
  );
}