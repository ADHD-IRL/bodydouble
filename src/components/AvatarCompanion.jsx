import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, ChevronRight, Mic, MicOff, Timer } from "lucide-react";
import { base44 } from "@/api/base44Client";
import TimerOverlay from "@/components/TimerOverlay";

export const AVATARS = [
  { id: "plant", emoji: "🧘", name: "Sam",    img: "https://media.base44.com/images/public/6a106fe90cbaa1a3a638d453/8575bc52b_generated_image.png" },
  { id: "cat",   emoji: "🙋", name: "Alex",   img: "https://media.base44.com/images/public/6a106fe90cbaa1a3a638d453/6c8e3b835_generated_image.png" },
  { id: "robot", emoji: "🧑‍💻", name: "Jordan", img: "https://media.base44.com/images/public/6a106fe90cbaa1a3a638d453/1134ab5f6_generated_image.png" },
  { id: "sloth", emoji: "🤗", name: "Riley",  img: "https://media.base44.com/images/public/6a106fe90cbaa1a3a638d453/fae2f7a68_generated_image.png" },
  { id: "owl",   emoji: "🧑‍🏫", name: "Morgan", img: "https://media.base44.com/images/public/6a106fe90cbaa1a3a638d453/e7cb2bfaa_generated_image.png" },
  { id: "ghost", emoji: "🫂", name: "Casey",  img: "https://media.base44.com/images/public/6a106fe90cbaa1a3a638d453/21a7157f7_generated_image.png" },
];

function buildGreeting(avatar, tasks, displayName, tone) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 17 ? "Hey" : "Evening";
  const name = displayName ? `, ${displayName.split(" ")[0]}` : "";
  const active = tasks.filter(t => ["today", "focus", "paused"].includes(t.status));
  const inbox = tasks.filter(t => t.status === "inbox");
  const done = tasks.filter(t => ["completed", "good_enough_done"].includes(t.status));

  const lines = {
    plant: [
      `${greeting}${name}. I'm here with you today.`,
      active.length > 0
        ? `Looks like "${active[0].title}" is up next. Want to take a look at it together?`
        : inbox.length > 0
        ? `You've got ${inbox.length} thing${inbox.length > 1 ? "s" : ""} waiting. No pressure — want to pick one?`
        : `Your list is clear. Ready to create a task together?`,
      done.length > 0 ? `You've already finished ${done.length} thing${done.length > 1 ? "s" : ""} today. That genuinely counts.` : null,
    ],
    cat: [
      `${greeting}${name}. Good to see you.`,
      active.length > 0
        ? `"${active[0].title}" is next up. Want to jump in or talk through it first?`
        : inbox.length > 0
        ? `You've got ${inbox.length} thing${inbox.length > 1 ? "s" : ""} waiting. No pressure — want to pick one?`
        : `Your list is clear. Ready to create a task together?`,
      done.length > 0 ? `${done.length} thing${done.length > 1 ? "s" : ""} done already — nice.` : null,
    ],
    robot: [
      `${greeting}${name}. Ready when you are.`,
      active.length > 0
        ? `"${active[0].title}" is at the top of the list. Want to start small on it?`
        : inbox.length > 0
        ? `You've got ${inbox.length} thing${inbox.length > 1 ? "s" : ""} waiting. Want to pick one?`
        : `Your list is clear. Ready to create a task together?`,
      done.length > 0 ? `${done.length} thing${done.length > 1 ? "s" : ""} finished. You're making progress.` : null,
    ],
    sloth: [
      `${greeting}${name}. No rush — really.`,
      active.length > 0
        ? `"${active[0].title}" is here when you're ready. No pressure to dive in yet.`
        : inbox.length > 0
        ? `You've got ${inbox.length} thing${inbox.length > 1 ? "s" : ""} waiting. No rush — want to pick one?`
        : `Your list is clear. No pressure — ready to create a task whenever you are?`,
      done.length > 0 ? `You've already done ${done.length} thing${done.length > 1 ? "s" : ""}. Honestly, that's enough.` : null,
    ],
    owl: [
      `${greeting}${name}. Let's see what today's about.`,
      active.length > 0
        ? `"${active[0].title}" is up next. What do you already know about how to start?`
        : inbox.length > 0
        ? `You've got ${inbox.length} things in your inbox. Which one feels most alive right now?`
        : `Your list is clear. Ready to create something new?`,
      done.length > 0 ? `${done.length} thing${done.length > 1 ? "s" : ""} done so far — momentum is there.` : null,
    ],
    ghost: [
      `${greeting}${name}. I'm here — you're not doing this alone.`,
      active.length > 0
        ? `"${active[0].title}" is on your list. Want to figure out a small first step together?`
        : inbox.length > 0
        ? `You've got ${inbox.length} thing${inbox.length > 1 ? "s" : ""} waiting. Want to pick one?`
        : `Your list is clear. Ready to create a task together?`,
      done.length > 0 ? `${done.length} thing${done.length > 1 ? "s" : ""} done today. You did that.` : null,
    ],
  };

  return (lines[avatar] || lines.plant).filter(Boolean).join(" ");
}

const NUDGES = {
  plant: [
    "What's one thing you could do in the next two minutes?",
    "Is something making this feel harder than it needs to be?",
    "Take a breath with me. What's one small step forward?",
    "You don't have to finish it today. What would starting look like?",
    "How's your energy right now — high, medium, or kind of low?",
  ],
  cat: [
    "What's getting in the way right now?",
    "Is this actually urgent, or is it just sitting on your mind?",
    "Okay, what's one thing you could move on?",
    "You've handled harder stuff. What's the first move here?",
    "Out of everything, what feels most doable right now?",
  ],
  robot: [
    "What's the very first physical action this task needs?",
    "Is the block coming from inside or outside of you?",
    "What would a lighter, 20% version of this look like?",
    "What's worked for you before on something like this?",
    "If you had to do just one thing right now, what would it be?",
  ],
  sloth: [
    "What's the tiniest, least effortful version of this?",
    "No rush at all — what feels actually possible right now?",
    "Is there any part of this you don't mind doing?",
    "Sometimes rest comes first. What does your body need?",
    "Even a small move counts. What feels lightweight today?",
  ],
  owl: [
    "What do you already know about this task?",
    "What's really underneath the stuck feeling?",
    "If you were explaining the first step to someone else, what would you say?",
    "Is this task clear enough to start, or does it need breaking down more?",
    "What's something about today you don't want to look back and regret?",
  ],
  ghost: [
    "Hey — you're not doing this alone. What feels hardest right now?",
    "Tell me something true about this task.",
    "I'm right here. What's the smallest possible first thing?",
    "That stuck feeling won't last. What might shift it a little?",
    "We can just sit with it for a moment if you need to.",
  ],
};

function speak(text, voiceOn, voiceSettings = {}, isListening = false) {
  if (!voiceOn || !window.speechSynthesis) return;
  if (isListening) return;
  window.speechSynthesis.cancel();

  const doSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = voiceSettings.rate ?? 0.9;
    utter.pitch = voiceSettings.pitch ?? 1.0;
    utter.volume = 1.0;
    if (voiceSettings.name) {
      const match = voices.find(v => v.name === voiceSettings.name);
      if (match) utter.voice = match;
    }
    window.speechSynthesis.speak(utter);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    const handler = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      doSpeak();
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
  } else {
    doSpeak();
  }
}

function extractTimerSeconds(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (!lower.includes("timer") && !lower.includes("minute") && !lower.includes("min")) return null;
  const match = lower.match(/(\d+)\s*(?:minute|min)/);
  if (match) return parseInt(match[1], 10) * 60;
  if (lower.includes("timer")) return 120;
  return null;
}

function buildTimerRecommendation(rec, onOpenTimer) {
  const secs = extractTimerSeconds(rec);
  if (!secs) return null;
  return { label: rec, action: () => onOpenTimer(secs) };
}

export default function AvatarCompanion({ tasks, profile, onUpdateProfile, onStartTask, onCapture, onTaskCompleted, onCreateTask }) {
  const avatarId = profile?.companion_avatar || "plant";
  const voiceOn = profile?.companion_voice_on || false;
  const avatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];
  const voiceSettings = {
    rate: profile?.voice_rate ?? 0.9,
    pitch: profile?.voice_pitch ?? 1.0,
    name: profile?.voice_name || "",
  };

  const [message, setMessage] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [nudgeIndex, setNudgeIndex] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const currentTask = tasks.find(t => ["focus", "paused", "today"].includes(t.status));
  const inboxCount = tasks.filter(t => t.status === "inbox").length;
  const hasNoTasks = tasks.filter(t => !["completed", "good_enough_done", "abandoned", "delegated"].includes(t.status)).length === 0;

  useEffect(() => {
    const greeting = buildGreeting(avatarId, tasks, profile?.display_name, profile?.preferred_tone);
    setMessage(greeting);
  }, [avatarId, tasks.length]);

  const [hasNudgedOnce, setHasNudgedOnce] = useState(false);

  const handleNudge = async () => {
    setThinking(true);
    setRecommendation(null);

    const taskContext = tasks
      .filter(t => ["today", "focus", "paused", "inbox"].includes(t.status))
      .slice(0, 8)
      .map((t, i) => `${i + 1}. ${t.title} (${t.status})`)
      .join("\n");

    const isFirstNudge = !hasNudgedOnce;
    setHasNudgedOnce(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: isFirstNudge
          ? `You are ${avatar.name}, a warm and grounded human companion helping someone with ADHD focus on their tasks.
The user's tasks right now:
${taskContext || "Nothing on the list yet"}

Look at what they need to do and respond with genuine, gentle encouragement. Start by acknowledging their list (it's okay if it's empty or full). Then ask which task feels most doable right now, or suggest the one that would free up mental space first.

Respond ONLY as valid JSON: {"question": "...", "recommendation": "..."}
"question": warm, focused on their tasks — under 50 words.
"recommendation": the single most important task to start with (task name only).`
          : `You are ${avatar.name}, a warm and grounded human companion helping someone with ADHD stay on track.
The user's tasks right now:
${taskContext || "Nothing on the list yet"}

The user just shared something with you. Respond warmly and briefly, then connect it back to what they're trying to accomplish today. Ask one simple question focused on moving a task forward.

Respond ONLY as valid JSON: {"question": "...", "recommendation": "..."}
"question": acknowledge their words + 1 task-focused question (under 30 words).
"recommendation": if relevant, suggest a small concrete action on a specific task.`,
        response_json_schema: {
          type: "object",
          properties: {
            question: { type: "string" },
            recommendation: { type: "string" }
          }
        }
      });

      const q = response?.question || "What's one small thing you can do right now?";
      const rec = response?.recommendation || null;
      setMessage(q);
      setLastQuestion(q);
      speak(q, voiceOn, voiceSettings, listening);
      if (rec) {
        const timerRec = buildTimerRecommendation(rec, (secs) => { setTimerSeconds(secs); setShowTimer(true); setRecommendation(null); });
        setRecommendation(timerRec || { label: rec, action: () => { setMessage(`Got it. "${rec}" — let's do it.`); setRecommendation(null); speak(`Got it. Let's do it.`, voiceOn, voiceSettings, listening); } });
      }
    } catch {
      const nudges = NUDGES[avatarId] || NUDGES.plant;
      const next = nudges[nudgeIndex % nudges.length];
      setMessage(next);
      speak(next, voiceOn, voiceSettings, listening);
      setNudgeIndex(i => i + 1);
    }
    setThinking(false);
  };

  const handleAskAI = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    await fireAI(aiInput.trim());
    setAiInput("");
    setAiMode(false);
    setAiLoading(false);
  };

  const handleTalk = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessage("Sorry, your browser doesn't support voice input. Try Chrome!");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { setListening(true); setTranscript(""); setAiMode(false); };
    recognition.onerror = () => { setListening(false); setTranscript(""); };
    recognition.onend = async () => {
      setListening(false);
      setTranscript(prev => {
        if (prev.trim()) fireAI(prev.trim());
        return "";
      });
    };

    recognition._finalTranscript = "";
    recognition.onresult = (event) => {
      const current = Array.from(event.results).map(r => r[0].transcript).join("");
      recognition._finalTranscript = current;
      setTranscript(current);
    };

    recognition.start();
  };

  const fireAI = async (input) => {
    setThinking(true);
    setRecommendation(null);
    const taskContext = tasks
      .filter(t => ["today", "focus", "paused", "inbox"].includes(t.status))
      .slice(0, 5)
      .map(t => `- ${t.title} (${t.status})`)
      .join("\n");

    const conversationContext = lastQuestion
      ? `You previously asked: "${lastQuestion}"\nThe user replied: "${input}"`
      : `The user said: "${input}"`;

    const finishedKeywords = /\b(finished|done|completed|just did|just finished|knocked out|wrapped up|got it done|marked (it|that) (as )?done)\b/i;
    if (finishedKeywords.test(input)) {
      const activeTasks = tasks.filter(t => ["focus", "paused", "today", "inbox"].includes(t.status));
      let matchedTask = null;
      for (const t of activeTasks) {
        const words = t.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        if (words.some(w => input.toLowerCase().includes(w))) { matchedTask = t; break; }
      }
      if (!matchedTask) matchedTask = activeTasks.find(t => ["focus", "paused", "today"].includes(t.status)) || activeTasks[0];
      if (matchedTask) {
        await base44.entities.Task.update(matchedTask.id, { status: "completed", completed_at: new Date().toISOString() });
        const praise = `That's amazing — "${matchedTask.title}" is done! You did it. 🎉`;
        setMessage(praise);
        speak(praise, voiceOn, voiceSettings, listening);
        onTaskCompleted?.();
        setThinking(false);
        return;
      }
    }

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are ${avatar.name}, a warm, grounded human companion helping someone with ADHD stay focused on their tasks. You speak like a caring friend — natural, real, never robotic.

${conversationContext}
Their tasks right now:
${taskContext || "Nothing on the list yet"}

Respond warmly to what they shared in 1 sentence. Then gently bring it back to their tasks — ask what's blocking them or what would help them start something today.
Respond ONLY as valid JSON: {"reply": "...", "recommendation": "..."}
Keep both brief and task-focused. Sound like a real friend.`,
        response_json_schema: {
          type: "object",
          properties: {
            reply: { type: "string" },
            recommendation: { type: "string" }
          }
        }
      });

      const reply = response?.reply || "I'm here. Let's take it one step at a time.";
      const rec = response?.recommendation || null;
      setMessage(reply);
      setLastQuestion("");
      speak(reply, voiceOn, voiceSettings, listening);
      if (rec) {
        const timerRec = buildTimerRecommendation(rec, (secs) => { setTimerSeconds(secs); setShowTimer(true); setRecommendation(null); });
        setRecommendation(timerRec || { label: rec, action: () => { setMessage(`Sounds good. "${rec}" — you've got this.`); setRecommendation(null); speak(`Sounds good. You've got this.`, voiceOn, voiceSettings, listening); } });
      }
    } catch {
      setMessage("I'm here. Let's take it one step at a time.");
    }
    setThinking(false);
  };

  const toggleVoice = () => {
    const next = !voiceOn;
    onUpdateProfile({ companion_voice_on: next });
    if (!next) {
      window.speechSynthesis?.cancel();
    } else {
      speak(message, true, voiceSettings);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 pt-2">
      {/* Avatar */}
      <div className="relative">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          {avatar.img ? (
            <img src={avatar.img} alt={avatar.name} className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-background" />
          ) : (
            <span className="text-7xl select-none">{avatar.emoji}</span>
          )}
        </motion.div>
        <button
          onClick={toggleVoice}
          className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-background flex items-center justify-center transition-colors ${
            voiceOn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {voiceOn ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
        </button>
      </div>

      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={thinking ? "thinking" : message}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="relative bg-card border border-border/60 rounded-3xl rounded-tl-sm px-5 py-4 shadow-sm w-full max-w-sm mx-auto"
        >
          <div className="absolute -top-2 left-6 w-3 h-3 bg-card border-l border-t border-border/60 rotate-45" />
          {thinking ? (
            <div className="flex gap-1.5 py-1 px-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }} className="w-2 h-2 bg-muted-foreground/40 rounded-full" />
              ))}
            </div>
          ) : (
            <p className="text-base text-foreground leading-relaxed">{message}</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Recommendation pill */}
      <AnimatePresence>
        {recommendation && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-sm">
            <div className="bg-primary/10 border border-primary/25 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-sm text-foreground leading-snug flex-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide block mb-0.5">Recommendation</span>
                {recommendation.label}
              </p>
              <button onClick={recommendation.action} className="shrink-0 bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 rounded-xl hover:bg-primary/90 transition-colors">
                Yes, let's do it
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listening indicator */}
      <AnimatePresence>
        {listening && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-2">
            <div className="flex gap-1 items-end h-6">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div key={i} animate={{ height: ["8px", "20px", "8px"] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.1 }} className="w-1.5 bg-primary rounded-full" />
              ))}
            </div>
            {transcript && <p className="text-sm text-muted-foreground italic px-4 text-center">"{transcript}"</p>}
            <p className="text-xs text-muted-foreground">Listening… tap mic to stop</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI chat input */}
      <AnimatePresence>
        {aiMode && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-sm flex gap-2">
            <input
              ref={inputRef}
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAskAI()}
              placeholder={`Ask ${avatar.name}...`}
              autoFocus
              className="flex-1 bg-card border border-border/60 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
            />
            <button onClick={handleAskAI} disabled={aiLoading || !aiInput.trim()} className="bg-primary text-primary-foreground rounded-2xl px-4 py-3 text-sm font-medium disabled:opacity-50">
              {aiLoading ? "..." : "→"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick action buttons */}
      <div className="flex gap-2 flex-wrap justify-center">
        <button onClick={handleNudge} className="px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
          Say something
        </button>
        <button
          onClick={handleTalk}
          className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-1.5 ${
            listening ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          {listening ? "Stop" : "Talk"}
        </button>
        <button
          onClick={() => setAiMode(v => !v)}
          className={`px-4 py-2 rounded-full text-sm transition-all ${
            aiMode ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          Talk to {avatar.name}
        </button>
        {currentTask && (
          <button onClick={() => onStartTask(currentTask)} className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-all flex items-center gap-1">
            Start task <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
        {!currentTask && inboxCount > 0 && (
          <button onClick={onCapture} className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-all">
            Pick a task
          </button>
        )}
        {hasNoTasks && (
          <button onClick={onCreateTask} className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
            + Create a task
          </button>
        )}
        <button onClick={() => { setTimerSeconds(120); setShowTimer(true); }} className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm hover:bg-accent hover:text-foreground transition-all flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5" /> Timer
        </button>
      </div>

      <TimerOverlay open={showTimer} onClose={() => setShowTimer(false)} initialSeconds={timerSeconds} />
    </div>
  );
}