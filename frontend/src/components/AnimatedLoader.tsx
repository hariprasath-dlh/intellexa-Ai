import { motion } from "framer-motion";

export function AnimatedLoader() {
  const steps = ["Decomposing query", "Searching 38 sources", "Cross-referencing", "Synthesizing insights"];
  return (
    <div className="glass rounded-2xl p-5 max-w-[80%]">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative h-7 w-7">
          <span className="absolute inset-0 rounded-full bg-gradient-primary opacity-30 blur-md animate-pulse" />
          <span className="absolute inset-0 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
        </div>
        <div className="shimmer-text text-sm font-medium">Intellexa is reasoning…</div>
      </div>
      <div className="space-y-1.5">
        {steps.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.18 }}
            className="flex items-center gap-2 text-[11px] text-muted-foreground"
          >
            <span className="h-1 w-1 rounded-full bg-primary" />{s}
          </motion.div>
        ))}
      </div>
    </div>
  );
}