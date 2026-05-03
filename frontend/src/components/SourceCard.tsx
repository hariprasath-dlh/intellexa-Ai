import { ExternalLink } from "lucide-react";
import type { Source } from "@/data/sessions";

export function SourceCard({ source, index }: { source: Source; index: number }) {
  return (
    <a
      href={source.url}
      className="glass glass-hover block rounded-xl p-3.5 group"
    >
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 shrink-0 rounded-md bg-white/5 grid place-items-center text-[10px] font-mono text-muted-foreground border border-white/5">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
            <span>{source.site}</span>
          </div>
          <div className="text-[13px] font-medium leading-snug text-foreground/95 line-clamp-2 mb-1">{source.title}</div>
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{source.snippet}</p>
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition shrink-0" />
      </div>
    </a>
  );
}