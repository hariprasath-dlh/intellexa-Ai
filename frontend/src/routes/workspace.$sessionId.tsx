import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { ChatWindow } from "@/components/ChatWindow";
import { InsightPanel } from "@/components/InsightPanel";
import { getSession, sessions, type Session } from "@/data/sessions";
import { callResearchApi, mapApiToSession } from "@/lib/api";

export const Route = createFileRoute("/workspace/$sessionId")({
  head: ({ params }) => {
    const s = getSession(params.sessionId);
    return {
      meta: [
        { title: `${s.topic} — Intellexa AI` },
        { name: "description", content: s.summary.slice(0, 155) },
        { property: "og:title", content: `${s.topic} — Intellexa AI` },
        { property: "og:description", content: s.summary.slice(0, 155) },
      ],
    };
  },
  component: WorkspaceRoute,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <AppShell>
        <div className="px-8 py-16 max-w-xl mx-auto text-center">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Workspace error</div>
          <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mb-6">{error?.message || "Unable to load this research session."}</p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => { router.invalidate(); reset(); }}
              className="h-10 px-4 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold"
            >Retry</button>
            <Link to="/" className="h-10 px-4 inline-flex items-center rounded-lg border border-white/10 text-sm hover:bg-white/5">Go home</Link>
          </div>
        </div>
      </AppShell>
    );
  },
});

function WorkspaceRoute() {
  const { sessionId } = Route.useParams();
  const baseSession = getSession(sessionId) ?? sessions[0];
  const [session, setSession] = useState<Session>(baseSession);
  const [deepMode, setDeepMode] = useState(baseSession.depth === "Deep");
  const [isThinking, setIsThinking] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setSession(baseSession);
    setApiError(null);
    setIsThinking(true);
    const t = setTimeout(() => setIsThinking(false), 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleSubmit = async (query: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsThinking(true);
    setApiError(null);
    // Reset to base shell so old insights/factors never bleed into next query
    setSession(baseSession);
    try {
      const api = await callResearchApi(query, controller.signal);
      console.log("API Response:", api);
      // Always use baseSession as structural template, never stale prev state
      setSession(mapApiToSession(api, baseSession));
    } catch (err) {
      if ((err as any)?.name !== "AbortError") {
        console.error("Research API failed:", err);
        setApiError("Unable to fetch results. Please try again.");
      }
    } finally {
      setIsThinking(false);
    }
  };

  if (!session) {
    return (
      <AppShell>
        <div className="px-8 py-16 text-center text-sm text-muted-foreground">Loading workspace…</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <motion.div
        key={sessionId}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="h-[calc(100vh-4rem)] p-5 grid gap-5 grid-cols-1 lg:grid-cols-[1.2fr_1fr]"
      >
        <ChatWindow
          session={session}
          isThinking={isThinking}
          deepMode={deepMode}
          setDeepMode={setDeepMode}
          onSubmit={handleSubmit}
          errorMessage={apiError}
        />
        <InsightPanel session={session} isThinking={isThinking} />
      </motion.div>
    </AppShell>
  );
}