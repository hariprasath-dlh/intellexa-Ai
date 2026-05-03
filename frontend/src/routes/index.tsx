import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Activity, Brain, Database } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ResearchCard } from "@/components/ResearchCard";
import { sessions } from "@/data/sessions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Intellexa AI" },
      { name: "description", content: "Your research operating system. Resume sessions, launch deep investigations, and review structured insights." },
      { property: "og:title", content: "Dashboard — Intellexa AI" },
      { property: "og:description", content: "Resume sessions, launch deep investigations, and review structured insights." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AppShell>
      <div className="px-8 py-10 max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Good evening, Alex</div>
          <h1 className="text-4xl md:text-5xl font-semibold leading-[1.05] max-w-3xl">
            Turn questions into <span className="text-gradient">structured intelligence.</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl text-[15px]">
            Intellexa decomposes your query, scans the open web and curated corpora, and returns a synthesized brief — not a chat reply.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-8 glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-primary opacity-20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-gradient-accent opacity-15 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary mb-2">
                <Sparkles className="h-3.5 w-3.5" /> Start new research
              </div>
              <div className="text-lg md:text-xl font-medium">
                "What changed in fault-tolerant quantum computing this quarter?"
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Suggested · Deep Research mode recommended</div>
            </div>
            <Link
              to="/research"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:opacity-95 transition"
            >
              Launch Workspace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={Activity} label="Sessions this month" value="42" delta="+18%" />
          <StatCard icon={Brain} label="Insights pinned" value="127" delta="+9" />
          <StatCard icon={Database} label="Sources indexed" value="3.4k" delta="live" />
        </div>

        <div className="mt-12 flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold">Recent research</h2>
            <p className="text-xs text-muted-foreground mt-1">Pick up where you left off — sessions stay live for 30 days.</p>
          </div>
          <Link to="/history" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.slice(0, 6).map((s, i) => <ResearchCard key={s.id} session={s} index={i} />)}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, delta }: { icon: any; label: string; value: string; delta: string }) {
  return (
    <div className="glass glass-hover rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 grid place-items-center text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{delta}</span>
      </div>
      <div className="mt-4 font-display text-3xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
