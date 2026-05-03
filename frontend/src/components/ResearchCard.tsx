import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, Layers } from "lucide-react";
import type { Session } from "@/data/sessions";

export function ResearchCard({ session, index = 0 }: { session: Session; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <Link
        to="/workspace/$sessionId"
        params={{ sessionId: session.id }}
        className="glass glass-hover block rounded-2xl p-5 h-full group"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{session.topic}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${session.depth === "Deep" ? "border-accent/40 text-accent bg-accent/10" : "border-primary/40 text-primary bg-primary/10"}`}>
            {session.depth}
          </span>
        </div>
        <h3 className="text-[15px] font-semibold leading-snug text-foreground/95 line-clamp-2 mb-3">
          {session.query}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-5">{session.summary}</p>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" />{session.createdAt}</span>
          <span className="inline-flex items-center gap-1.5"><Layers className="h-3 w-3" />{session.sources.length} sources</span>
          <ArrowUpRight className="h-4 w-4 text-foreground/40 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition" />
        </div>
      </Link>
    </motion.div>
  );
}