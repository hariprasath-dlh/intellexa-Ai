import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp, Sparkles, Globe, ShieldCheck, AlertTriangle, CheckCircle2,
  ListChecks, Lightbulb, FileText, Loader2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SourceCard } from "@/components/SourceCard";
import { callResearchApi, type ResearchApiResponse } from "@/lib/api";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "New Research — Intellexa AI" },
      { name: "description", content: "Run a new research query and get structured insights, sources, credibility and consistency checks." },
      { property: "og:title", content: "New Research — Intellexa AI" },
      { property: "og:description", content: "Run a new research query and get structured insights, sources, credibility and consistency checks." },
    ],
  }),
  component: ResearchRoute,
});

const STAGES = [
  "Understanding query…",
  "Fetching sources…",
  "Analyzing data…",
  "Generating insights…",
];

function ResearchRoute() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [data, setData] = useState<ResearchApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stageTimer = useRef<number | null>(null);

  useEffect(() => () => {
    abortRef.current?.abort();
    if (stageTimer.current) window.clearInterval(stageTimer.current);
  }, []);

  const runQuery = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setQuery(trimmed);
    setError(null);
    setData(null);
    setLoading(true);
    setStage(0);

    if (stageTimer.current) window.clearInterval(stageTimer.current);
    stageTimer.current = window.setInterval(() => {
      setStage((s) => (s < STAGES.length - 1 ? s + 1 : s));
    }, 900);

    try {
      const res = await callResearchApi(trimmed, controller.signal);
      console.log("API Response:", res);
      setData(res);
    } catch (err) {
      if ((err as any)?.name !== "AbortError") {
        console.error("Research API failed:", err);
        setError("Unable to fetch results. Please try again.");
      }
    } finally {
      if (stageTimer.current) {
        window.clearInterval(stageTimer.current);
        stageTimer.current = null;
      }
      setLoading(false);
    }
  };

  const submit = () => {
    runQuery(input);
    setInput("");
  };

  const showHero = !loading && !data && !error;

  return (
    <AppShell>
      <div className="h-[calc(100vh-4rem)] overflow-y-auto scrollbar-thin">
        <div className="max-w-4xl mx-auto px-6 py-10">
          {showHero ? (
            <HeroInput value={input} setValue={setInput} onSubmit={submit} />
          ) : (
            <div className="space-y-6">
              <QueryHeader query={query} onReset={() => { setData(null); setError(null); setQuery(""); }} />
              <CompactInput value={input} setValue={setInput} onSubmit={submit} disabled={loading} />
              <AnimatePresence mode="wait">
                {loading && <LoadingStages key="loading" stage={stage} />}
                {!loading && error && <ErrorBlock key="error" message={error} onRetry={() => runQuery(query)} />}
                {!loading && data && <Results key="results" data={data} />}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function HeroInput({ value, setValue, onSubmit }: { value: string; setValue: (v: string) => void; onSubmit: () => void }) {
  const samples = [
    "Analyse old car prices in Delhi",
    "State of fault-tolerant quantum computing in 2026",
    "How are LLM agents reshaping enterprise workflows?",
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[60vh] flex flex-col items-center justify-center text-center"
    >
      <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full border border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
        <Sparkles className="h-3 w-3 text-primary" /> New research
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-semibold mb-3">
        What would you like to <span className="text-gradient">investigate</span>?
      </h1>
      <p className="text-sm text-muted-foreground max-w-lg mb-8">
        Frame it as a research question. Intellexa will gather sources, check credibility and contradictions, and return a structured answer.
      </p>

      <div className="w-full max-w-2xl glass-strong rounded-2xl p-3 flex items-end gap-2 focus-within:border-primary/40 transition">
        <div className="h-9 w-9 rounded-lg grid place-items-center text-muted-foreground"><Globe className="h-4 w-4" /></div>
        <textarea
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
          rows={1}
          placeholder="Ask anything…"
          className="flex-1 bg-transparent resize-none outline-none text-sm py-2.5 placeholder:text-muted-foreground max-h-40"
        />
        <button
          onClick={onSubmit}
          disabled={!value.trim()}
          className="h-10 w-10 rounded-lg bg-gradient-primary text-primary-foreground grid place-items-center disabled:opacity-40 transition hover:opacity-90"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mr-1">Try</span>
        {samples.map((s) => (
          <button
            key={s}
            onClick={() => setValue(s)}
            className="text-[11px] px-2.5 h-7 rounded-full border border-white/10 bg-white/[0.03] text-foreground/85 hover:bg-white/[0.07] hover:border-primary/40 transition"
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function CompactInput({ value, setValue, onSubmit, disabled }: { value: string; setValue: (v: string) => void; onSubmit: () => void; disabled?: boolean }) {
  return (
    <div className="glass rounded-xl p-2 flex items-end gap-2 focus-within:border-primary/40 transition">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
        rows={1}
        placeholder="Ask a follow-up or start a new query…"
        className="flex-1 bg-transparent resize-none outline-none text-sm py-2 px-2 placeholder:text-muted-foreground max-h-40"
      />
      <button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="h-9 w-9 rounded-lg bg-gradient-primary text-primary-foreground grid place-items-center disabled:opacity-40 transition hover:opacity-90"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </div>
  );
}

function QueryHeader({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-1">Research query</div>
        <h1 className="font-display text-xl md:text-2xl font-semibold leading-snug">{query || "—"}</h1>
      </div>
      <button
        onClick={onReset}
        className="shrink-0 h-9 px-3 rounded-lg border border-white/10 text-xs hover:bg-white/5 transition"
      >
        New query
      </button>
    </div>
  );
}

function LoadingStages({ stage }: { stage: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="glass-strong rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="h-9 w-9 rounded-lg bg-gradient-primary grid place-items-center text-primary-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Working</div>
          <div className="shimmer-text text-sm font-medium">Synthesizing your research…</div>
        </div>
      </div>
      <ol className="space-y-2.5">
        {STAGES.map((s, i) => {
          const state = i < stage ? "done" : i === stage ? "active" : "pending";
          return (
            <li key={s} className="flex items-center gap-3">
              <span
                className={`h-5 w-5 rounded-full grid place-items-center text-[10px] border transition-colors ${
                  state === "done"
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : state === "active"
                    ? "bg-white/5 border-primary/40 text-primary"
                    : "bg-white/[0.02] border-white/10 text-muted-foreground"
                }`}
              >
                {state === "done" ? <CheckCircle2 className="h-3 w-3" /> : state === "active" ? <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> : i + 1}
              </span>
              <span className={`text-[13px] ${state === "active" ? "text-foreground" : state === "done" ? "text-foreground/80" : "text-muted-foreground"}`}>
                {s}
              </span>
              {state === "active" && (
                <div className="ml-auto h-1 w-24 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                    className="h-full w-1/2 bg-gradient-primary"
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </motion.div>
  );
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="glass rounded-2xl p-5 border border-amber/20 bg-amber/5"
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-4 w-4 text-amber" />
        <div className="flex-1 text-sm text-foreground/90">{message}</div>
        <button
          onClick={onRetry}
          className="h-9 px-3 rounded-lg bg-gradient-primary text-primary-foreground text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    </motion.div>
  );
}

function Results({ data }: { data: ResearchApiResponse }) {
  const sources = data.sources ?? [];
  const insights = data.result?.keyInsights ?? [];
  const factors = data.result?.factors ?? [];
  const directAnswer = data.result?.directAnswer ?? "";
  const credibility = data.credibility;
  const contradictions = data.contradictions;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {directAnswer && (
        <Section icon={FileText} label="Direct Answer" delay={0}>
          <p className="text-[15px] leading-relaxed text-foreground/95">{directAnswer}</p>
        </Section>
      )}

      {sources.length > 0 && (
        <Section icon={Globe} label={`Sources (${sources.length})`} delay={0.05}>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {sources.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.04 }}
              >
                <SourceCard
                  source={{
                    title: s.title || `Source ${i + 1}`,
                    snippet: s.snippet || "",
                    url: s.url || "#",
                    site: s.site || hostFromUrl(s.url),
                  }}
                  index={i}
                />
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {credibility && (
        <Section icon={ShieldCheck} label="Credibility" delay={0.1}>
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <Stat label="Confidence" value={formatConfidence(credibility.confidenceScore)} />
            <Stat label="Bias level" value={credibility.biasLevel || "—"} />
          </div>
          {credibility.explanation && (
            <p className="text-[13px] leading-relaxed text-muted-foreground">{credibility.explanation}</p>
          )}
        </Section>
      )}

      <Section
        icon={contradictions?.hasContradiction ? AlertTriangle : CheckCircle2}
        label="Consistency"
        delay={0.15}
      >
        {contradictions?.hasContradiction && (contradictions.details?.length ?? 0) > 0 ? (
          <ul className="space-y-1.5">
            {contradictions.details.map((d, i) => (
              <li key={i} className="text-[13px] text-foreground/90 leading-relaxed">• {d}</li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-muted-foreground">No contradictions detected across sources.</p>
        )}
      </Section>

      {insights.length > 0 && (
        <Section icon={Lightbulb} label="Key Insights" delay={0.2}>
          <ul className="space-y-2">
            {insights.map((t, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="flex gap-3 text-[13px] leading-relaxed text-foreground/95"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-primary" />
                <span>{t}</span>
              </motion.li>
            ))}
          </ul>
        </Section>
      )}

      {factors.length > 0 && (
        <Section icon={ListChecks} label="Factors" delay={0.25}>
          <ul className="space-y-2">
            {factors.map((t, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="flex gap-3 text-[13px] leading-relaxed text-foreground/95"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-accent" />
                <span>{t}</span>
              </motion.li>
            ))}
          </ul>
        </Section>
      )}
    </motion.div>
  );
}

function Section({
  icon: Icon, label, children, delay = 0,
}: { icon: any; label: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-strong rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-md bg-white/5 border border-white/5 grid place-items-center text-primary">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      </div>
      {children}
    </motion.section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-3 text-center">
      <div className="font-display text-lg font-semibold text-gradient">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function formatConfidence(v: unknown): string {
  if (typeof v !== "number" || !isFinite(v)) return "—";
  const pct = v <= 1 ? v * 100 : v;
  return `${Math.round(pct)}%`;
}

function hostFromUrl(u?: string) {
  if (!u) return "source";
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return "source"; }
}