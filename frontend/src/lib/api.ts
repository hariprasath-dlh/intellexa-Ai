import type { Session, Source, Insight } from "@/data/sessions";

export type ResearchApiResponse = {
  query: string;
  type: string;
  sources: Array<{ title?: string; snippet?: string; url?: string; site?: string }>;
  credibility: { confidenceScore: number; biasLevel: string; explanation: string };
  contradictions: { hasContradiction: boolean; details: string[] };
  result: { directAnswer: string; keyInsights: string[]; factors: string[] };
};

const API_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_RESEARCH_API_URL) ||
  "http://localhost:5000/api/research";

export async function callResearchApi(query: string, signal?: AbortSignal): Promise<ResearchApiResponse> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return (await res.json()) as ResearchApiResponse;
}

function hostFromUrl(u?: string) {
  if (!u) return "source";
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

export function mapApiToSession(api: ResearchApiResponse, base: Session): Session {
  // Debug: verify fresh API data arrives on every query
  console.log("Updated API Data:", api);

  const sources: Source[] = (api.sources ?? []).map((s, i) => ({
    title: s.title || `Source ${i + 1}`,
    site: s.site || hostFromUrl(s.url),
    snippet: s.snippet || "",
    url: s.url || "#",
  }));

  // Always use API data — never fall back to static base session data
  const insights: Insight[] = (api.result?.keyInsights ?? []).map((t) => ({ text: t, tag: "Insight" }));
  const factors: string[] = api.result?.factors ?? [];

  return {
    ...base,
    query: api.query || base.query,
    topic: api.type || base.topic,
    // summary is the full synthesis; directAnswer is the short answer
    summary: api.result?.directAnswer || "",
    directAnswer: api.result?.directAnswer || "",
    // Always replace with live API data — empty array if none returned
    factors,
    insights,
    sources: sources.length ? sources : [],
    actions: factors.length ? factors : [],
    credibility: api.credibility,
    contradictions: api.contradictions,
    messages: [
      { role: "user", content: api.query || base.query },
      {
        role: "ai",
        content:
          api.result?.directAnswer ||
          "I analyzed the available sources. See the structured panel for the full breakdown.",
      },
    ],
  };
}