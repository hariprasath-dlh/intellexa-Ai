import { createFileRoute, redirect } from "@tanstack/react-router";
import { sessions } from "@/data/sessions";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace — Intellexa AI" },
      { name: "description", content: "Run deep research with structured output, source previews and pinned insights." },
      { property: "og:title", content: "Workspace — Intellexa AI" },
      { property: "og:description", content: "Run deep research with structured output, source previews and pinned insights." },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/workspace/$sessionId", params: { sessionId: sessions[0].id }, replace: true });
  },
  component: () => null,
});