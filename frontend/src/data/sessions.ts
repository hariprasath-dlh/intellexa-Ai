export type Source = { title: string; site: string; snippet: string; url: string };
export type Insight = { text: string; tag?: string };
export type Message = { role: "user" | "ai"; content: string };
export type Credibility = { confidenceScore: number; biasLevel: string; explanation: string };
export type Contradictions = { hasContradiction: boolean; details: string[] };
export type Session = {
  id: string;
  query: string;
  topic: string;
  createdAt: string;
  duration: string;
  depth: "Quick" | "Deep";
  summary: string;
  insights: Insight[];
  sources: Source[];
  actions: string[];
  messages: Message[];
  directAnswer?: string;
  factors?: string[];
  credibility?: Credibility;
  contradictions?: Contradictions;
};

export const sessions: Session[] = [
  {
    id: "s-quantum-2026",
    query: "State of fault-tolerant quantum computing in 2026",
    topic: "Quantum Computing",
    createdAt: "2 hours ago",
    duration: "1m 42s",
    depth: "Deep",
    summary:
      "Fault-tolerant quantum computing reached an inflection point in early 2026. Multiple labs demonstrated logical qubits with error rates below the surface-code threshold, shifting the field from physical-qubit races to logical-qubit benchmarks. Commercial timelines for utility-scale machines have compressed from a decade to roughly 4–6 years.",
    insights: [
      { text: "Logical qubit error rates dropped ~10x in 18 months across three independent labs.", tag: "Breakthrough" },
      { text: "Surface code is being challenged by qLDPC codes with 10–100x lower overhead.", tag: "Architecture" },
      { text: "Neutral-atom and trapped-ion platforms are converging on similar fidelities.", tag: "Hardware" },
      { text: "Cryogenic CMOS control is now the dominant scaling bottleneck, not qubit count.", tag: "Bottleneck" },
    ],
    sources: [
      { title: "Below-threshold logical qubits with surface code", site: "Nature", snippet: "A demonstration of a distance-7 surface code logical qubit operating below threshold for the first time at scale.", url: "#" },
      { title: "qLDPC codes reduce overhead by two orders of magnitude", site: "arXiv", snippet: "New family of quantum LDPC codes brings overhead within reach of near-term hardware.", url: "#" },
      { title: "Neutral atoms hit 99.95% two-qubit fidelity", site: "Quanta Magazine", snippet: "Reconfigurable atom arrays close the gap with ion traps on key gate metrics.", url: "#" },
      { title: "The cryogenic control wall", site: "IEEE Spectrum", snippet: "Why scaling beyond 10k qubits depends on rethinking control electronics.", url: "#" },
    ],
    actions: [
      "Track qLDPC code adoption in next-gen processor roadmaps.",
      "Evaluate cryo-CMOS suppliers for portfolio exposure.",
      "Re-baseline cryptography migration plans against compressed timelines.",
    ],
    messages: [
      { role: "user", content: "Give me the state of fault-tolerant quantum computing in 2026." },
      { role: "ai", content: "I synthesized 41 sources across peer-reviewed journals, preprints and industry reports. Structured findings are in the insights panel." },
    ],
  },
  {
    id: "s-llm-agents",
    query: "How are LLM agents reshaping enterprise workflows?",
    topic: "AI Agents",
    createdAt: "Yesterday",
    duration: "58s",
    depth: "Quick",
    summary:
      "Enterprise LLM agents have moved from pilots to production in finance, legal and operations. The dominant pattern is narrow, tool-augmented agents wrapped in deterministic workflows — not autonomous generalists. ROI is concentrated in document-heavy, repetitive knowledge work.",
    insights: [
      { text: "67% of Fortune 500 deployments are scoped to a single workflow, not 'general assistants'.", tag: "Adoption" },
      { text: "Tool-use accuracy now matters more than raw model intelligence for enterprise ROI.", tag: "Trend" },
      { text: "Evaluation infrastructure is the #1 bottleneck cited by AI platform teams.", tag: "Bottleneck" },
    ],
    sources: [
      { title: "The Enterprise AI Agent Report 2026", site: "a16z", snippet: "Field study of 120 enterprise agent deployments and their economics.", url: "#" },
      { title: "Why narrow agents are winning", site: "Sequoia Perspectives", snippet: "Constrained scopes outperform open-ended autonomy in production environments.", url: "#" },
      { title: "Evals are the new moat", site: "LangChain Blog", snippet: "Teams investing in evaluation pipelines ship 3x faster.", url: "#" },
    ],
    actions: [
      "Audit current pilots: are they scoped narrowly enough?",
      "Invest in evaluation tooling before scaling agent count.",
      "Map highest-ROI workflows (claims, contracts, ticket triage).",
    ],
    messages: [
      { role: "user", content: "How are LLM agents reshaping enterprise workflows?" },
      { role: "ai", content: "Synthesis ready. Key takeaway: narrow > autonomous. See structured panel." },
    ],
  },
  {
    id: "s-climate-fusion",
    query: "Commercial fusion: which approach is winning?",
    topic: "Energy",
    createdAt: "3 days ago",
    duration: "2m 11s",
    depth: "Deep",
    summary:
      "Tokamak and stellarator approaches dominate funding, but high-temperature superconducting magnets have shifted economics decisively. Inertial confinement remains scientifically promising but commercially distant. First grid-connected demonstrations are credibly targeted for 2031–2033.",
    insights: [
      { text: "HTS magnet cost curves dropped 40% YoY for three consecutive years.", tag: "Economics" },
      { text: "Private fusion funding crossed $9B cumulative in Q1 2026.", tag: "Capital" },
      { text: "Tritium fuel cycle remains the most under-discussed risk.", tag: "Risk" },
    ],
    sources: [
      { title: "Fusion Industry Report 2026", site: "FIA", snippet: "Annual census of 47 private fusion companies and their milestones.", url: "#" },
      { title: "HTS magnets and the new fusion economics", site: "MIT News", snippet: "Why magnet breakthroughs reshape every reactor design decision.", url: "#" },
      { title: "The tritium problem", site: "Science", snippet: "Global tritium supply is insufficient for projected commercial fleet.", url: "#" },
    ],
    actions: [
      "Watch HTS magnet supplier consolidation.",
      "Model tritium breeding requirements vs. supply.",
      "Re-evaluate grid integration timelines for 2032.",
    ],
    messages: [
      { role: "user", content: "Commercial fusion: which approach is winning?" },
      { role: "ai", content: "Compared 6 reactor architectures across 28 sources. Tokamak + HTS leads, with caveats." },
    ],
  },
  {
    id: "s-longevity",
    query: "Most credible longevity interventions backed by 2025–2026 trials",
    topic: "Biotech",
    createdAt: "Last week",
    duration: "1m 19s",
    depth: "Deep",
    summary:
      "Three intervention classes have produced statistically meaningful longevity signals in human trials: senolytics, GLP-1-class metabolics, and partial epigenetic reprogramming (early phase). Caloric restriction mimetics remain crowded but underpowered.",
    insights: [
      { text: "GLP-1 agonists show all-cause mortality reductions in cardio-metabolic cohorts.", tag: "Trial" },
      { text: "Senolytic combinations now in 4 Phase II trials with biomarker endpoints.", tag: "Pipeline" },
      { text: "Partial reprogramming safety data is the gating factor, not efficacy.", tag: "Risk" },
    ],
    sources: [
      { title: "GLP-1 and mortality: SELECT extension", site: "NEJM", snippet: "Long-term follow-up confirms cardiovascular and all-cause mortality benefit.", url: "#" },
      { title: "Senolytic Phase II readouts 2026", site: "Nature Aging", snippet: "Combination dasatinib+quercetin shows biomarker shifts in older adults.", url: "#" },
      { title: "Partial reprogramming: the safety question", site: "Cell", snippet: "Tumorigenicity remains the central concern for in vivo OSK delivery.", url: "#" },
    ],
    actions: [
      "Track Phase III GLP-1 longevity-specific trials starting 2026.",
      "Watch reprogramming safety datasets from Altos and NewLimit.",
      "Discount caloric restriction mimetic pipelines until better-powered.",
    ],
    messages: [
      { role: "user", content: "Most credible longevity interventions backed by 2025–2026 trials?" },
      { role: "ai", content: "Three classes stand out. Full breakdown in structured panel." },
    ],
  },
  {
    id: "s-semis",
    query: "Geopolitics of advanced semiconductor supply chains",
    topic: "Geopolitics",
    createdAt: "2 weeks ago",
    duration: "2m 47s",
    depth: "Deep",
    summary:
      "Advanced node manufacturing remains a near-monopoly geographic concentration despite four years of reshoring policy. Equipment chokepoints — particularly EUV and high-NA EUV — are more decisive than fab location. Export controls have accelerated, not reversed, indigenous Chinese tooling efforts.",
    insights: [
      { text: "TSMC still produces ~90% of sub-3nm wafers globally.", tag: "Concentration" },
      { text: "ASML high-NA EUV backlog extends to 2029.", tag: "Bottleneck" },
      { text: "China domestic DUV tooling reached commercial viability faster than projected.", tag: "Surprise" },
    ],
    sources: [
      { title: "Global semiconductor supply chain map 2026", site: "SIA", snippet: "Updated geographic and stage-by-stage concentration analysis.", url: "#" },
      { title: "High-NA EUV: who gets the machines", site: "Bits and Chips", snippet: "Allocation politics behind ASML's most strategic product.", url: "#" },
      { title: "SMIC's quiet progress", site: "Financial Times", snippet: "Domestic tooling milestones reshape five-year forecasts.", url: "#" },
    ],
    actions: [
      "Stress-test supply chain against Taiwan disruption scenarios.",
      "Track high-NA EUV allocations as leading indicator.",
      "Re-baseline China capacity assumptions upward.",
    ],
    messages: [
      { role: "user", content: "Geopolitics of advanced semiconductor supply chains?" },
      { role: "ai", content: "Equipment chokepoints matter more than fab location. Details in panel." },
    ],
  },
];

export const getSession = (id: string) => sessions.find((s) => s.id === id) ?? sessions[0];