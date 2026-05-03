import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, Layers, ArrowUpRight, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { sessions } from "@/data/sessions";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — Intellexa AI" },
      { name: "description", content: "Browse and reopen every research session you've run with Intellexa." },
      { property: "og:title", content: "History — Intellexa AI" },
      { property: "og:description", content: "Browse and reopen every research session you've run with Intellexa." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <AppShell>
      <div className="px-8 py-10 max-w-[1200px] mx-auto">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Archive</div>
        <h1 className="text-3xl md:text-4xl font-semibold">Research history</h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm">Every session, fully restorable. Open any item to resume the chat with its structured output intact.</p>

        <div className="mt-8 glass rounded-xl p-2 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <input
            placeholder="Search by topic, query, or source…"
            className="flex-1 bg-transparent outline-none text-sm py-2 placeholder:text-muted-foreground"
          />
          <button className="text-xs px-3 h-8 rounded-md border border-white/10 hover:bg-white/5">All topics</button>
        </div>

        <div className="mt-6 glass-strong rounded-2xl divide-y divide-white/5 overflow-hidden">
          {sessions.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to="/workspace/$sessionId"
                params={{ sessionId: s.id }}
                className="flex items-center gap-5 px-5 py-4 hover:bg-white/[0.03] transition group"
              >
                <span className={`h-2 w-2 rounded-full ${s.depth === "Deep" ? "bg-accent" : "bg-primary"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.topic}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-muted-foreground">{s.depth}</span>
                  </div>
                  <div className="text-sm font-medium truncate">{s.query}</div>
                </div>
                <div className="hidden md:flex items-center gap-5 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" />{s.createdAt}</span>
                  <span className="inline-flex items-center gap-1.5"><Layers className="h-3 w-3" />{s.sources.length} src</span>
                  <span>{s.duration}</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}