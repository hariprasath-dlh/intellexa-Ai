export function ToggleSwitch({
  checked, onChange, label, hint,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 group"
      type="button"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition-colors border ${checked ? "bg-gradient-primary border-transparent" : "bg-white/5 border-white/10"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`}
        />
      </span>
      <span className="text-left leading-tight">
        <span className="block text-xs font-medium">{label}</span>
        {hint && <span className="block text-[10px] text-muted-foreground">{hint}</span>}
      </span>
    </button>
  );
}