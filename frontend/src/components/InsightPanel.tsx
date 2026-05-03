import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pin, Download, FileText, Sparkles, Link2, ListChecks, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Session } from "@/data/sessions";
import { SourceCard } from "@/components/SourceCard";

const tabs = [
  { id: "summary", label: "Summary", icon: FileText },
  { id: "insights", label: "Insights", icon: Sparkles },
  { id: "sources", label: "Sources", icon: Link2 },
  { id: "actions", label: "Actions", icon: ListChecks },
] as const;
type TabId = typeof tabs[number]["id"];

export function InsightPanel({ session, isThinking }: { session: Session; isThinking: boolean }) {
  const [tab, setTab] = useState<TabId>("summary");
  const [pinned, setPinned] = useState<Set<number>>(new Set());

  const insights = session?.insights ?? [];
  const sources = session?.sources ?? [];
  const actions = session?.actions ?? [];
  const factors = session?.factors ?? [];

  const togglePin = (i: number) => {
    setPinned((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col glass-strong rounded-2xl overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Structured Output</div>
            <h2 className="font-display text-base font-semibold mt-0.5">{session.topic}</h2>
          </div>
          <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-white/10 text-xs hover:bg-white/5 transition">
            <Download className="h-3.5 w-3.5" /> Export PDF
          </button>
        </div>
        <div className="flex gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/5">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-[11px] font-medium rounded-md transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {active && <motion.span layoutId="tab-bg" className="absolute inset-0 rounded-md bg-white/[0.07] border border-white/10" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                <Icon className="h-3.5 w-3.5 relative" />
                <span className="relative">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-5">
        {isThinking ? (
          <ThinkingSkeleton />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {tab === "summary" && session && (
                <div className="space-y-4">
                  <div className="glass rounded-xl p-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Query</div>
                    <div className="text-sm">{session.query || "—"}</div>
                  </div>
                  {session.directAnswer && (
                    <div className="glass rounded-xl p-4">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Direct Answer</div>
                      <p className="text-sm leading-relaxed text-foreground/95">{session.directAnswer}</p>
                    </div>
                  )}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Synthesis</div>
                    <p className="text-sm leading-relaxed text-foreground/90">{session.summary || "No synthesis available yet."}</p>
                  </div>
                  {session.credibility && (
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Credibility</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <Stat label="Confidence" value={formatConfidence(session.credibility.confidenceScore)} />
                        <Stat label="Bias" value={session.credibility.biasLevel || "—"} />
                      </div>
                      <p className="text-[12px] leading-relaxed text-muted-foreground">{session.credibility.explanation || ""}</p>
                    </div>
                  )}
                  {session.contradictions && (
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {session.contradictions.hasContradiction ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        )}
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Consistency</div>
                      </div>
                      {session.contradictions.hasContradiction && (session.contradictions.details?.length ?? 0) > 0 ? (
                        <ul className="space-y-1.5">
                          {(session.contradictions.details ?? []).map((d, i) => (
                            <li key={i} className="text-[12px] text-foreground/90 leading-relaxed">• {d}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[12px] text-muted-foreground">No contradictions detected across sources.</p>
                      )}
                    </div>
                  )}
                  {factors.length > 0 ? (
                    <div className="glass rounded-xl p-4">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Factors</div>
                      <ul className="space-y-1.5">
                        {factors.map((f, i) => (
                          <li key={i} className="text-[12px] text-foreground/90 leading-relaxed">• {f}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="glass rounded-xl p-4">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Factors</div>
                      <p className="text-[12px] text-muted-foreground">No factors available.</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <Stat label="Sources" value={String(sources.length)} />
                    <Stat label="Insights" value={String(insights.length)} />
                    <Stat label="Duration" value={session.duration || "—"} />
                  </div>
                </div>
              )}

              {tab === "insights" && (
                <div className="space-y-2.5">
                  {insights.length === 0 && (
                    <div className="text-[12px] text-muted-foreground">No insights available — run a query to populate this panel.</div>
                  )}
                  {insights.map((ins, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="glass rounded-xl p-4 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          {ins.tag && (
                            <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber/15 text-amber border border-amber/20 mb-2">
                              {ins.tag}
                            </span>
                          )}
                          <p className="text-[13px] leading-relaxed text-foreground/95">{ins.text}</p>
                        </div>
                        <button
                          onClick={() => togglePin(i)}
                          className={`shrink-0 h-7 w-7 rounded-md grid place-items-center transition ${pinned.has(i) ? "bg-accent/15 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                          aria-label="Pin insight"
                        >
                          <Pin className={`h-3.5 w-3.5 ${pinned.has(i) ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {tab === "sources" && (
                <div className="space-y-2.5">
                  {sources.length === 0 && (
                    <div className="text-[12px] text-muted-foreground">No sources yet.</div>
                  )}
                  {sources.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <SourceCard source={s} index={i} />
                    </motion.div>
                  ))}
                </div>
              )}

              {tab === "actions" && (
                <ol className="space-y-2.5">
                  {actions.length === 0 && (
                    <li className="text-[12px] text-muted-foreground">No action points yet.</li>
                  )}
                  {actions.map((a, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="glass rounded-xl p-4 flex gap-3 items-start"
                    >
                      <span className="h-6 w-6 shrink-0 rounded-md bg-gradient-accent text-accent-foreground text-[11px] font-semibold grid place-items-center">
                        {i + 1}
                      </span>
                      <span className="text-[13px] leading-relaxed text-foreground/95">{a}</span>
                    </motion.li>
                  ))}
                </ol>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
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

function ThinkingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="glass rounded-xl p-4 overflow-hidden relative">
          <div className="space-y-2">
            <div className="h-3 w-1/3 rounded bg-white/5 relative overflow-hidden"><div className="absolute inset-0 shimmer-bar" /></div>
            <div className="h-3 w-full rounded bg-white/5" />
            <div className="h-3 w-4/5 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}