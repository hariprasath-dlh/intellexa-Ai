import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Globe, Paperclip, Sparkles, Wand2 } from "lucide-react";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { MessageBubble } from "@/components/MessageBubble";
import { AnimatedLoader } from "@/components/AnimatedLoader";
import type { Message, Session } from "@/data/sessions";

const SAMPLE_QUERIES = [
  "Analyse old car prices in Delhi",
  "State of fault-tolerant quantum computing in 2026",
  "How are LLM agents reshaping enterprise workflows?",
  "Most credible longevity interventions in 2025–2026",
];

export function ChatWindow({
  session, isThinking, deepMode, setDeepMode, onSubmit, errorMessage,
}: {
  session: Session;
  isThinking: boolean;
  deepMode: boolean;
  setDeepMode: (v: boolean) => void;
  onSubmit: (q: string) => void;
  errorMessage?: string | null;
}) {
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>(session?.messages ?? []);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setLocalMessages(session?.messages ?? []); }, [session?.id, session?.messages]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [localMessages, isThinking]);

  const submit = () => {
    const q = input.trim();
    if (!q) return;
    setLocalMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    onSubmit(q);
  };

  const runSample = (q: string) => {
    if (isThinking) return;
    setLocalMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    onSubmit(q);
  };

  return (
    <div className="h-full flex flex-col glass-strong rounded-2xl overflow-hidden">
      <div className="px-5 h-14 flex items-center gap-3 border-b border-white/5">
        <div className="h-7 w-7 rounded-md bg-gradient-primary grid place-items-center text-primary-foreground">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="leading-tight min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Active session</div>
          <div className="text-sm font-medium truncate">{session.query}</div>
        </div>
        <div className="ml-auto">
          <ToggleSwitch
            checked={deepMode}
            onChange={setDeepMode}
            label="Deep Research"
            hint={deepMode ? "Multi-pass · 40+ sources" : "Single-pass · ~12 sources"}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-5 py-6 space-y-5">
        {localMessages.map((m, i) => <MessageBubble key={i} message={m} />)}
        {isThinking && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-primary grid place-items-center text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <AnimatedLoader />
          </motion.div>
        )}
        {errorMessage && !isThinking && (
          <div className="text-[12px] text-amber/90 bg-amber/10 border border-amber/20 rounded-lg px-3 py-2">
            {errorMessage}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="mb-2.5 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <Wand2 className="h-3 w-3" /> Free test queries
          </span>
          {SAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => runSample(q)}
              disabled={isThinking}
              className="text-[11px] px-2.5 h-6 rounded-full border border-white/10 bg-white/[0.03] text-foreground/85 hover:bg-white/[0.07] hover:border-primary/40 transition disabled:opacity-40"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="glass rounded-2xl p-2.5 flex items-end gap-2 focus-within:border-primary/40 transition">
          <button className="h-9 w-9 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground hover:bg-white/5"><Paperclip className="h-4 w-4" /></button>
          <button className="h-9 w-9 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground hover:bg-white/5"><Globe className="h-4 w-4" /></button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            rows={1}
            placeholder="Ask Intellexa anything — frame it like a research question…"
            className="flex-1 bg-transparent resize-none outline-none text-sm py-2 placeholder:text-muted-foreground max-h-40"
          />
          <button
            onClick={submit}
            disabled={!input.trim() || isThinking}
            className="h-9 w-9 rounded-lg bg-gradient-primary text-primary-foreground grid place-items-center disabled:opacity-40 transition hover:opacity-90"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 px-1 text-[10px] text-muted-foreground flex items-center justify-between">
          <span>Press Enter to send · Shift+Enter for newline</span>
          <span>{deepMode ? "Deep mode active" : "Standard mode"}</span>
        </div>
      </div>
    </div>
  );
}