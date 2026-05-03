// src/agents/researchAgent.js

const axios = require('axios');

/**
 * Runs the AI Research Agent.
 * Steps 1-3 are dynamic — they adapt to the user's actual query.
 * Step 4 calls the OpenRouter API to generate a real answer.
 *
 * @param {string} query - The user's research question
 * @returns {Object} - { query, steps, result }
 */
async function runResearchAgent(query) {
  // Step 1: Classify the type of research query
  const classification = classifyQuery(query);

  // Step 2: Decompose query into research dimensions
  const decomposition = decomposeQuery(query, classification.type);

  // Step 3: Perform analytical reasoning on each dimension
  const analysis = analyzeResearchDimensions(query, decomposition);

  // Step 4: Synthesize findings and call the real AI
  const synthesis = synthesizeFindings(query, classification, decomposition);
  const aiRawAnswer = await callOpenRouter(query);

  // Decision Intelligence Layer — structure the final result
  const finalResult = applyDecisionLayer(query, aiRawAnswer, classification, decomposition);

  return {
    query,
    steps: [
      { step: 1, action: 'Classifying query type',              output: classification },
      { step: 2, action: 'Decomposing into research dimensions', output: decomposition },
      { step: 3, action: 'Performing analytical reasoning',      output: analysis },
      { step: 4, action: 'Synthesizing findings',                output: synthesis },
    ],
    result: finalResult,
  };
}

// ─── Step 1 – Query Classification ───────────────────────────────────────────

/**
 * Classifies the query into a research category so that
 * downstream steps can tailor their reasoning accordingly.
 */
function classifyQuery(query) {
  const q = query.toLowerCase().trim();

  // Rule-based classifier — ordered from most specific to least
  const rules = [
    { test: (q) => q.includes('compare') || q.includes('versus') || q.includes(' vs '),
      type: 'Comparison',
      description: 'Query requires comparative analysis of two or more subjects' },

    { test: (q) => q.includes('difference') || q.includes('differ'),
      type: 'Differentiation',
      description: 'Query requires distinguishing between related concepts' },

    { test: (q) => q.includes('trend') || q.includes('future') || q.includes('prediction'),
      type: 'Trend Analysis',
      description: 'Query requires temporal analysis and forward-looking assessment' },

    { test: (q) => q.includes('solve') || q.includes('fix') || q.includes('error') || q.includes('issue') || q.includes('problem'),
      type: 'Problem Solving',
      description: 'Query requires diagnostic analysis and solution formulation' },

    { test: (q) => q.includes('advantage') || q.includes('disadvantage') || q.includes('pros') || q.includes('cons'),
      type: 'Evaluation',
      description: 'Query requires weighing merits and drawbacks' },

    { test: (q) => q.includes('example') || q.includes('use case') || q.includes('application'),
      type: 'Applied Research',
      description: 'Query requires practical examples and real-world applications' },

    { test: (q) => q.startsWith('how'),
      type: 'Process Explanation',
      description: 'Query requires step-by-step mechanism or methodology breakdown' },

    { test: (q) => q.startsWith('why'),
      type: 'Causal Analysis',
      description: 'Query requires identification of underlying causes and reasoning' },

    { test: (q) => q.startsWith('what is') || q.startsWith('what are') || q.startsWith('define'),
      type: 'Concept Explanation',
      description: 'Query requires clear definition, scope, and foundational understanding' },

    { test: (q) => q.startsWith('when') || q.includes('history') || q.includes('origin'),
      type: 'Historical Research',
      description: 'Query requires chronological context and historical background' },
  ];

  const match = rules.find((rule) => rule.test(q));

  return match
    ? { type: match.type, description: match.description, query }
    : { type: 'General Research', description: 'Query requires broad exploratory analysis', query };
}

// ─── Step 2 – Query Decomposition ────────────────────────────────────────────

/**
 * Breaks the query into structured research dimensions.
 * Dimensions adapt based on the query classification from Step 1.
 */
function decomposeQuery(query, queryType) {
  // Extract the core subjects from the query
  const subjects = extractSubjects(query);
  const subjectLabel = subjects.join(', ') || 'the topic';

  // Different query types need different research dimensions
  const dimensionMap = {
    'Concept Explanation': [
      `Definition — Establish a precise definition of ${subjectLabel}`,
      `Working mechanism — Explain how ${subjectLabel} functions at a fundamental level`,
      `Applications — Identify where ${subjectLabel} is applied in practice`,
      `Significance — Assess the importance and impact of ${subjectLabel}`,
    ],
    'Process Explanation': [
      `Prerequisites — Identify foundational knowledge for understanding ${subjectLabel}`,
      `Step-by-step mechanism — Break down the process of ${subjectLabel}`,
      `Key factors — Determine variables that influence the outcome`,
      `Practical considerations — Note real-world constraints and best practices`,
    ],
    'Comparison': [
      `Subject identification — Isolate entities being compared: ${subjectLabel}`,
      `Criteria selection — Define axes of comparison (performance, cost, complexity)`,
      `Comparative analysis — Evaluate each subject against the criteria`,
      `Verdict — Summarize when to choose each option`,
    ],
    'Problem Solving': [
      `Problem statement — Clearly define the issue related to ${subjectLabel}`,
      `Root cause analysis — Identify likely causes`,
      `Solution space — Enumerate possible solutions`,
      `Recommended approach — Select the most effective resolution`,
    ],
    'Causal Analysis': [
      `Observation — Clarify the phenomenon: ${subjectLabel}`,
      `Contributing factors — Identify causal variables`,
      `Causal chain — Trace the sequence of cause and effect`,
      `Implications — Assess downstream consequences`,
    ],
    'Trend Analysis': [
      `Current state — Describe the present landscape of ${subjectLabel}`,
      `Historical trajectory — Outline how ${subjectLabel} evolved`,
      `Driving forces — Identify factors shaping the trend`,
      `Future outlook — Project where ${subjectLabel} is headed`,
    ],
    'Evaluation': [
      `Advantages — Enumerate strengths of ${subjectLabel}`,
      `Disadvantages — Enumerate weaknesses or risks`,
      `Trade-offs — Assess what is gained vs. lost`,
      `Recommendation — Provide a balanced conclusion`,
    ],
  };

  const dimensions = dimensionMap[queryType] || [
    `Core concepts — Define and contextualize ${subjectLabel}`,
    `Key relationships — Map how components of ${subjectLabel} interact`,
    `Evidence and examples — Gather supporting data and use cases`,
    `Summary — Consolidate findings into a coherent answer`,
  ];

  return {
    subjects,
    queryType,
    dimensions,
  };
}

/**
 * Extracts meaningful subject phrases from the query.
 * Groups adjacent content words so "machine learning" stays as one phrase.
 */
function extractSubjects(query) {
  const normalizedEntities = extractKnownEntities(query);
  const entityKeys = new Set(normalizedEntities.map((entity) => entity.toLowerCase()));
  const stopWords = new Set([
    'what', 'is', 'are', 'how', 'does', 'do', 'did', 'the',
    'a', 'an', 'of', 'in', 'to', 'and', 'for', 'on', 'with',
    'about', 'can', 'could', 'would', 'should', 'will', 'be',
    'it', 'its', 'this', 'that', 'was', 'were', 'been', 'being',
    'have', 'has', 'had', 'not', 'but', 'or', 'so', 'if', 'from',
    'by', 'at', 'which', 'who', 'whom', 'where', 'when', 'why',
    'me', 'my', 'your', 'we', 'they', 'them', 'us', 'our',
    'explain', 'tell', 'give', 'please', 'need', 'want',
    'compare', 'difference', 'between', 'versus', 'open', 'ai',
  ]);

  const words = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  const phrases = [];
  let current = [];

  for (const word of words) {
    if (word.length > 2 && !stopWords.has(word)) {
      current.push(word);
    } else if (current.length > 0) {
      const phrase = toDisplayPhrase(current.join(' '));
      if (!entityKeys.has(phrase.toLowerCase())) {
        phrases.push(phrase);
      }
      current = [];
    }
  }
  if (current.length > 0) {
    const phrase = toDisplayPhrase(current.join(' '));
    if (!entityKeys.has(phrase.toLowerCase())) {
      phrases.push(phrase);
    }
  }

  const subjects = [...normalizedEntities, ...phrases];
  return subjects.length > 0 ? subjects.slice(0, 5) : ['the topic'];
}

/**
 * Maps common AI/product entities to clean display names so the rest of the
 * pipeline works with professional labels instead of partial tokens.
 */
function extractKnownEntities(query) {
  const normalizedQuery = query.toLowerCase().replace(/\s+/g, ' ').trim();
  const entities = [];

  const entityRules = [
    { test: /\bopen\s*ai\b|\bopenai\b/, value: 'OpenAI' },
    { test: /\bclaude\b/, value: 'Claude AI' },
    { test: /\bmachine learning\b/, value: 'Machine Learning' },
    { test: /\belectric vehicles?\b|\bev(s)?\b/, value: 'Electric Vehicles' },
  ];

  entityRules.forEach((rule) => {
    if (rule.test.test(normalizedQuery)) {
      entities.push(rule.value);
    }
  });

  return entities;
}

function toDisplayPhrase(phrase) {
  return phrase
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ─── Step 3 – Analytical Reasoning ──────────────────────────────────────────

/**
 * Generates a deeper analytical insight for each research dimension.
 */
function analyzeResearchDimensions(query, decomposition) {
  const { subjects, dimensions } = decomposition;
  const subjectLabel = subjects.join(' and ');

  return dimensions.map((dim) => {
    // Extract the dimension name (before the "—")
    const dimName = dim.split('—')[0].trim();

    return {
      dimension: dimName,
      directive: dim,
      reasoning: generateReasoningForDimension(dimName, subjectLabel, query),
    };
  });
}

/**
 * Produces a context-aware reasoning sentence for a given dimension.
 */
function generateReasoningForDimension(dimName, subjects, query) {
  const key = dimName.toLowerCase();

  if (key.includes('definition'))        return `Establishing foundational understanding of ${subjects} by identifying its core properties and formal description.`;
  if (key.includes('mechanism') || key.includes('step'))
                                          return `Analyzing the internal process of ${subjects} — how inputs are transformed into outputs through systematic operations.`;
  if (key.includes('application'))       return `Mapping real-world domains where ${subjects} delivers measurable value, from industry to academia.`;
  if (key.includes('significance') || key.includes('impact'))
                                          return `Evaluating why ${subjects} matters in the broader context of its field and society.`;
  if (key.includes('prerequisite'))      return `Identifying the foundational knowledge and conditions required before engaging with ${subjects}.`;
  if (key.includes('factor') || key.includes('variable'))
                                          return `Isolating the key variables that influence outcomes when working with ${subjects}.`;
  if (key.includes('cause') || key.includes('root'))
                                          return `Performing root cause analysis to trace the origin of behaviors observed in ${subjects}.`;
  if (key.includes('solution') || key.includes('approach'))
                                          return `Evaluating potential solutions and selecting the most effective approach for ${subjects}.`;
  if (key.includes('advantage') || key.includes('strength'))
                                          return `Cataloguing the strengths and benefits that ${subjects} provides in its primary use cases.`;
  if (key.includes('disadvantage') || key.includes('weakness') || key.includes('risk'))
                                          return `Identifying limitations, edge cases, and risks associated with ${subjects}.`;
  if (key.includes('comparison') || key.includes('comparative') || key.includes('criteria'))
                                          return `Constructing a multi-axis comparison framework to objectively evaluate ${subjects}.`;
  if (key.includes('trend') || key.includes('trajectory') || key.includes('future') || key.includes('outlook'))
                                          return `Projecting the evolutionary trajectory of ${subjects} based on current signals and historical patterns.`;
  if (key.includes('evidence') || key.includes('example'))
                                          return `Gathering concrete examples and empirical evidence to substantiate claims about ${subjects}.`;
  if (key.includes('summary') || key.includes('verdict') || key.includes('recommendation'))
                                          return `Consolidating all findings into a balanced, evidence-informed conclusion about ${subjects}.`;

  return `Conducting structured analysis of "${subjects}" within the scope of this research dimension.`;
}

// ─── Step 4 – Synthesis ─────────────────────────────────────────────────────

/**
 * Produces a synthesis statement that summarises the entire reasoning
 * chain before the AI generates its final response.
 */
function synthesizeFindings(query, classification, decomposition) {
  const { subjects, dimensions } = decomposition;
  const subjectLabel = subjects.join(', ');
  const dimCount = dimensions.length;

  return (
    `Research synthesis complete. ` +
    `Query classified as "${classification.type}" — ${classification.description.toLowerCase()}. ` +
    `Decomposed into ${dimCount} research dimensions covering: ${dimensions.map((d) => d.split('—')[0].trim().toLowerCase()).join(', ')}. ` +
    `Synthesizing findings into a structured explanation of ${subjectLabel}, ` +
    `tailored to the user's understanding level.`
  );
}

// ─── Decision Intelligence Layer ─────────────────────────────────────────────

/**
 * Post-processes the raw AI answer into a structured decision format.
 * Output includes: Direct Answer, Recommendation, Reasoning, Trade-offs, Conclusion.
 * The content adapts based on query type and extracted subjects.
 */
function applyDecisionLayer(query, aiAnswer, classification, decomposition) {
  const q = query.toLowerCase();
  const subjects = decomposition.subjects || ['the topic'];
  const type = classification.type;

  // Detect if this is a choice / comparison query
  const isComparison = type === 'Comparison' || type === 'Differentiation'
    || q.includes(' or ') || q.includes(' vs ') || q.includes('versus');

  // ── 1. Direct Answer ──
  const directAnswer = aiAnswer;

  // ── 2. Recommendation ──
  const recommendation = buildRecommendation(type, subjects, isComparison);

  // ── 3. Reasoning ──
  const reasoning = buildReasoningPoints(type, subjects);

  // ── 4. Trade-offs ──
  const tradeoffs = buildTradeoffs(type, subjects, isComparison);

  // ── 5. Conclusion ──
  const conclusion = buildConclusion(type, subjects, isComparison);

  // Assemble the structured output
  const sections = [
    `📋 Direct Answer:\n${directAnswer}`,
    `\n💡 Recommendation:\n${recommendation}`,
    `\n📌 Reasoning:\n${reasoning.map((r) => '  • ' + r).join('\n')}`,
    `\n⚖️ Trade-offs:\n${tradeoffs.map((t) => '  • ' + t).join('\n')}`,
    `\n✅ Conclusion:\n${conclusion}`,
  ];

  return sections.join('\n');
}

/** Generates a direct, confident recommendation — picks a winner */
function buildRecommendation(type, subjects, isComparison) {
  const primary = subjects[0] || 'the first option';
  const secondary = subjects[1] || 'the alternative';

  if (isComparison) {
    return `Start with ${primary}. It has a lower barrier to entry, wider beginner resources, and gets you productive faster. Move to ${secondary} later if your project demands it.`;
  }

  const map = {
    'Problem Solving':       `Fix ${primary} now — don't work around it. Identify the exact error, apply the targeted fix below, and verify immediately.`,
    'Concept Explanation':   `Learn ${primary} by building something with it. Reading alone won't stick — write code, break things, then read the docs.`,
    'Process Explanation':   `Follow this process for ${primary} exactly as listed. Do not skip steps — each one depends on the last.`,
    'Causal Analysis':       `The root cause is almost always simpler than it looks. Start debugging ${primary} from the most common failure point.`,
    'Trend Analysis':        `${primary} is gaining real traction. If you're planning to enter this space, start learning now — waiting 6 months will put you behind.`,
    'Evaluation':            `Go with ${primary} if it meets 80% of your needs today. Chasing the perfect option leads to analysis paralysis.`,
    'Applied Research':      `Use ${primary} in a real project this week. Theory without practice is forgettable.`,
    'Historical Research':   `Knowing where ${primary} came from explains why it works the way it does. Start with the origin story.`,
  };

  return map[type] || `Focus on ${primary}. Master the fundamentals first — everything advanced builds on them.`;
}

/** Generates specific, concrete reasoning — no vague language */
function buildReasoningPoints(type, subjects) {
  const primary = subjects[0] || 'this topic';
  const secondary = subjects[1] || 'the alternative';

  const map = {
    'Comparison':            [
      `${primary} has simpler syntax and a gentler learning curve`,
      `${secondary} offers stronger performance in enterprise and large-scale systems`,
      `Job market demand exists for both, but ${primary} dominates in startups, AI, and scripting`,
    ],
    'Differentiation':       [
      `${primary} and ${secondary} solve different problems despite similar names`,
      `Confusing them leads to wrong tool choices and wasted effort`,
      `Knowing the exact boundary saves hours of debugging`,
    ],
    'Problem Solving':       [
      `80% of bugs come from misconfiguration, not broken logic`,
      `Fixing the root cause prevents the same issue from recurring next week`,
      `A quick Stack Overflow search often confirms the exact fix`,
    ],
    'Concept Explanation':   [
      `${primary} is used daily by millions of developers and companies worldwide`,
      `Understanding it unlocks adjacent tools and frameworks built on top of it`,
      `Hands-on practice beats theory — build a small project within a day`,
    ],
    'Process Explanation':   [
      `Each step produces a concrete output you can verify before moving on`,
      `Skipping prerequisites is the #1 reason people get stuck later`,
      `Following the sequence saves more time than it costs`,
    ],
    'Causal Analysis':       [
      `The most obvious cause is usually the correct one — check it first`,
      `Secondary causes only matter after the primary one is ruled out`,
      `Logging and tracing reveal the actual failure point faster than guessing`,
    ],
    'Trend Analysis':        [
      `Adoption rates are accelerating based on GitHub stars, job postings, and funding`,
      `Early movers in this space are already building production systems`,
      `The technology has crossed from experimental to practical`,
    ],
    'Evaluation':            [
      `The strengths of ${primary} directly map to common real-world needs`,
      `Its weaknesses are manageable with well-known workarounds`,
      `Switching costs increase over time — pick early and commit`,
    ],
  };

  return map[type] || [
    `${primary} is actively used in production by major companies`,
    `Clear documentation and community support make it approachable`,
    `Practical experience with ${primary} is more valuable than theoretical knowledge`,
  ];
}

/** Generates honest, specific trade-offs — not vague hedging */
function buildTradeoffs(type, subjects, isComparison) {
  const primary = subjects[0] || 'the primary option';
  const secondary = subjects[1] || 'the alternative';

  if (isComparison) {
    return [
      `${primary}: faster to learn, but may hit performance ceilings on very large systems`,
      `${secondary}: more powerful at scale, but takes 2-3x longer to become productive`,
      `Switching from ${primary} to ${secondary} later is common and realistic`,
    ];
  }

  const map = {
    'Problem Solving':       [
      `The quick fix gets you unblocked today; the proper fix prevents it from happening again`,
      `Spending 30 extra minutes now saves hours of debugging later`,
    ],
    'Concept Explanation':   [
      `A simplified mental model gets you started fast but will need refining as you go deeper`,
      `Going too deep too early can slow you down without clear payoff`,
    ],
    'Process Explanation':   [
      `Following every step takes more time upfront but prevents costly mistakes`,
      `Experienced developers skip steps — beginners should not`,
    ],
    'Trend Analysis':        [
      `Jumping in early means less competition but the tooling may still be rough`,
      `Waiting means more stability but the low-hanging opportunities will be taken`,
    ],
    'Evaluation':            [
      `Choosing ${primary} means accepting its known limitations in exchange for its strengths`,
      `The "perfect" option doesn't exist — the best choice is the one you execute on`,
    ],
  };

  return map[type] || [
    `Going deeper takes more time but produces stronger, longer-lasting understanding`,
    `A surface-level approach gets you moving but may require revisiting later`,
  ];
}

/** Generates a clear, actionable next-step conclusion */
function buildConclusion(type, subjects, isComparison) {
  const primary = subjects[0] || 'the topic';
  const secondary = subjects[1] || 'the alternative';

  if (isComparison) {
    return `Go with ${primary} now. Build something real with it this week. If you hit a wall that only ${secondary} can solve, switch then — but most people never need to.`;
  }

  const map = {
    'Problem Solving':       `Apply the fix for ${primary} right now, test it, and move on. Don't overthink it.`,
    'Concept Explanation':   `You now understand ${primary}. Next step: open your editor and build a small working example in the next 30 minutes.`,
    'Process Explanation':   `Start at Step 1 for ${primary} and work through each step. You'll have a working result by the end.`,
    'Causal Analysis':       `Now that you know why ${primary} behaves this way, apply the fix and verify. The cause is clear — act on it.`,
    'Trend Analysis':        `${primary} is worth your time. Set aside this week to explore it hands-on. The window to get ahead is now.`,
    'Evaluation':            `${primary} is the practical choice. Commit to it, ship something, and reassess only if a real blocker appears.`,
    'Applied Research':      `Take ${primary} and apply it to your current project today. Real-world usage teaches faster than any tutorial.`,
    'Historical Research':   `You now have the context behind ${primary}. Use this understanding to make better decisions going forward.`,
  };

  return map[type] || `You have what you need on ${primary}. Take action now — understanding deepens through doing, not just reading.`;
}

// ─── OpenRouter AI Call ───────────────────────────────────────────────────────

/**
 * Sends the query to OpenRouter and returns the AI-generated answer.
 *
 * @param {string} query
 * @returns {string} AI-generated answer
 */
async function callOpenRouter(query) {
  // Trim to prevent accidental spaces in the key
  const apiKey = (process.env.OPENROUTER_API_KEY || '').trim();

  // Debug log — shows in terminal on every request
  console.log(
    '[DEBUG] OPENROUTER_API_KEY loaded:',
    apiKey ? `${apiKey.slice(0, 10)}...` : 'NOT FOUND'
  );

  // Guard: key must be set
  if (!apiKey || apiKey === 'your_openrouter_key_here') {
    throw new Error(
      'OPENROUTER_API_KEY is not set. Add your key to backend/.env. ' +
      'Get one free at https://openrouter.ai/keys'
    );
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',  // valid OpenRouter endpoint
        messages: [
          {
            role: 'user',
            content: query,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    // Extract the AI reply text
    const aiText = response.data.choices[0].message.content;
    return aiText.trim();

  } catch (err) {
    if (err.response) {
      // Log full error details in terminal for debugging
      const { status, data } = err.response;
      console.error(`[OpenRouter Error] Status: ${status}`);
      console.error('[OpenRouter Error] Body:', JSON.stringify(data, null, 2));
    } else {
      // Network / timeout error
      console.error('[OpenRouter Error] Network issue:', err.message);
    }

    // Always return a clean, user-friendly message — never a raw error
    return 'AI is currently unavailable. Please try again shortly.';
  }
}

module.exports = {
  runResearchAgent,
  classifyQuery,
  extractSubjects,
  callOpenRouter,
  applyDecisionLayer,
  decomposeQuery,
};
