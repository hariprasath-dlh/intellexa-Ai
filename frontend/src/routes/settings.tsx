import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ToggleSwitch } from "@/components/ToggleSwitch";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Intellexa AI" },
      { name: "description", content: "Tune your research workspace, defaults, and integrations." },
      { property: "og:title", content: "Settings — Intellexa AI" },
      { property: "og:description", content: "Tune your research workspace, defaults, and integrations." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [deep, setDeep] = useState(true);
  const [autosave, setAutosave] = useState(true);
  const [showSources, setShowSources] = useState(true);

  return (
    <AppShell>
      <div className="px-8 py-10 max-w-3xl mx-auto">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Preferences</div>
        <h1 className="text-3xl md:text-4xl font-semibold">Settings</h1>

        <Section title="Research defaults">
          <Row label="Deep Research by default" hint="New sessions launch in multi-pass mode." control={<ToggleSwitch checked={deep} onChange={setDeep} label="" />} />
          <Row label="Autosave sessions" hint="Persist queries and outputs automatically." control={<ToggleSwitch checked={autosave} onChange={setAutosave} label="" />} />
          <Row label="Always show sources panel" hint="Open the structured panel by default." control={<ToggleSwitch checked={showSources} onChange={setShowSources} label="" />} />
        </Section>

        <Section title="Profile">
          <Field label="Display name" value="Alex Reyes" />
          <Field label="Email" value="alex@intellexa.ai" />
          <Field label="Workspace" value="Reyes Research · Pro" />
        </Section>

        <Section title="Appearance">
          <Row label="Theme" hint="Glass dark — optimized for long research sessions." control={<span className="text-xs px-3 h-8 inline-flex items-center rounded-md border border-white/10 text-muted-foreground">Glass Dark</span>} />
        </Section>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 glass-strong rounded-2xl p-2">
      <div className="px-4 pt-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{title}</div>
      <div className="divide-y divide-white/5">{children}</div>
    </div>
  );
}

function Row({ label, hint, control }: { label: string; hint?: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 px-4 py-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <div>{control}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}