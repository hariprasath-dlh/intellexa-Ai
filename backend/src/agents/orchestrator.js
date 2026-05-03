// src/agents/orchestrator.js

const axios = require('axios');
const { callOpenRouter, extractSubjects } = require('./researchAgent');

const SAFE_AI_MESSAGE = 'AI is currently unavailable. Please try again shortly.';

/**
 * Classifies the query only. Search keywords and reasoning entities are handled
 * by separate agents so final output never depends on raw search tokens.
 */
function analyzeQuery(query) {
  const normalizedQuery = normalizeText(query);
  const type = classifyQueryType(normalizedQuery);

  return {
    type,
    intent: getIntentDescription(type),
    keywords: getSearchKeywords(query),
    entities: mapEntities(query),
  };
}

function classifyQueryType(normalizedQuery) {
  if (/\bwhich\s+is\s+better\b/.test(normalizedQuery)) {
    return 'decision';
  }

  if (/\bvs\b|\bversus\b|\bor\b/.test(normalizedQuery)) {
    return 'comparison';
  }

  if (/\banaly[sz]e\b|\bexplain\b|\btell\s+about\b/.test(normalizedQuery)) {
    return 'informational';
  }

  return 'informational';
}

function getIntentDescription(type) {
  const descriptions = {
    informational: 'User wants a clear explanation or analysis without a forced recommendation.',
    comparison: 'User wants two or more options compared across practical criteria.',
    decision: 'User wants a recommendation between options.',
  };

  return descriptions[type] || descriptions.informational;
}

function getSearchKeywords(query) {
  return dedupeList(extractSubjects(query));
}

/**
 * Maps raw query mentions to professional names used for reasoning and output.
 */
function mapEntities(query) {
  const normalizedQuery = normalizeText(query);
  const entities = [];

  const rules = [
    { test: /\bopen\s*ai\b|\bopenai\b/, value: 'OpenAI' },
    { test: /\bclaude\b/, value: 'Claude AI' },
    { test: /\bpython\b/, value: 'Python' },
    { test: /\bjava\b/, value: 'Java' },
    { test: /\bev\b|\bevs\b|\belectric\s+vehicle\b|\belectric\s+vehicles\b/, value: 'Electric Vehicles' },
    { test: /\bindia\b/, value: 'India' },
    { test: /\bmachine\s+learning\b/, value: 'Machine Learning' },
  ];

  rules.forEach((rule) => {
    if (rule.test.test(normalizedQuery)) {
      entities.push(rule.value);
    }
  });

  return dedupeList(entities);
}

/**
 * Fetches Google results through Serper. If Serper is unavailable, the caller
 * receives an empty source list and continues with an AI-only response.
 */
async function performWebSearch(query, keywords = []) {
  const apiKey = (process.env.SERPER_API_KEY || '').trim();
  const searchQuery = keywords.length ? keywords.join(' ') : query;

  if (!apiKey || apiKey === 'your_key_here') {
    console.log('[Orchestrator] SERPER_API_KEY not set. Continuing without live search.');
    return [];
  }

  try {
    const response = await axios.post(
      'https://google.serper.dev/search',
      { q: searchQuery },
      {
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const organicResults = Array.isArray(response.data.organic) ? response.data.organic : [];

    return organicResults.slice(0, 5).map((source) => ({
      title: source.title || 'Untitled source',
      snippet: source.snippet || 'No snippet available.',
      link: source.link || '',
    }));
  } catch (error) {
    console.error('[Serper Error]', error.response?.status || error.message);
    return [];
  }
}

function buildResearchPrompt(query, sources, analysis) {
  const entityText = analysis.entities.length
    ? `Use these exact entity names in reasoning and output: ${analysis.entities.join(', ')}.\n`
    : '';

  const formatInstruction = analysis.type === 'informational'
    ? 'Focus on explanation, key insights, factors, and trends. Do not force a recommendation.'
    : 'Compare the options practically and support any recommendation with concrete reasoning.';

  const responseShapeInstruction = [
    'Return fresh, query-specific output for this exact query.',
    'Use this structure:',
    '{',
    '  "directAnswer": "clear answer in 1-3 paragraphs",',
    '  "insights": ["specific insight 1", "specific insight 2", "specific insight 3"],',
    '  "factors": ["specific factor 1", "specific factor 2", "specific factor 3"]',
    '}',
    'Do not reuse generic insights or factors. Do not include markdown fences.',
  ].join('\n');

  if (!sources.length) {
    return `${entityText}${formatInstruction}\n\n${responseShapeInstruction}\n\nAnswer clearly and practically:\n${query}`;
  }

  const sourceText = sources
    .map((source, index) => `${index + 1}. ${source.title}\nSnippet: ${source.snippet}\nLink: ${source.link}`)
    .join('\n\n');

  return `${entityText}Using the following real-world data:\n${sourceText}\n\n${formatInstruction}\n\n${responseShapeInstruction}\n\nAnswer the query clearly and practically:\n${query}`;
}

/**
 * Calls the LLM only. It never performs search or formatting.
 */
async function generateAIResponse(prompt) {
  try {
    const response = await callOpenRouter(prompt);
    return response || SAFE_AI_MESSAGE;
  } catch (error) {
    console.error('[AI Error]', error.message);
    return SAFE_AI_MESSAGE;
  }
}

function evaluateCredibility(response) {
  const text = (response || '').trim();
  const lowerText = text.toLowerCase();
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const sentenceCount = text ? text.split(/[.!?]+/).filter((part) => part.trim()).length : 0;
  const balancedSignals = countMatches(lowerText, [
    'however',
    'on the other hand',
    'while',
    'although',
    'depends',
    'both',
    'trade-off',
    'pros',
    'cons',
  ]);
  const opinionSignals = countMatches(lowerText, [
    'always',
    'never',
    'obviously',
    'clearly',
    'best',
    'worst',
    'must',
  ]);

  let confidenceScore = 3;
  let detail = 'very generic';

  if (wordCount >= 40 || sentenceCount >= 3) {
    confidenceScore = 6;
    detail = 'moderately detailed';
  }

  if (wordCount >= 90 || sentenceCount >= 5) {
    confidenceScore = 8;
    detail = 'detailed';
  }

  let biasLevel = 'medium';
  if (balancedSignals >= 2) biasLevel = 'low';
  if (opinionSignals >= 3 && balancedSignals === 0) biasLevel = 'high';

  return {
    confidenceScore,
    biasLevel,
    explanation: `The response is ${detail}. Bias is ${biasLevel} based on balanced language versus strong one-sided wording.`,
  };
}

function detectContradictions(response) {
  const lowerText = normalizeText(response);
  const rules = [
    {
      hasConflict: lowerText.includes('best') && lowerText.includes('not the best'),
      detail: 'Conflicting statements detected about whether something is the best option.',
    },
    {
      hasConflict: lowerText.includes('recommended') && lowerText.includes('not recommended'),
      detail: 'Conflicting statements detected about whether something is recommended.',
    },
    {
      hasConflict: lowerText.includes('better than') && lowerText.includes('worse than'),
      detail: 'Conflicting comparative statements detected about relative quality.',
    },
  ];

  const details = rules.filter((rule) => rule.hasConflict).map((rule) => rule.detail);

  return {
    hasContradiction: details.length > 0,
    details,
  };
}

function buildResultSections(query, analysis, aiResponse) {
  return buildStructuredResult(aiResponse);
}

function buildStructuredResult(aiText) {
  console.log('AI RAW RESPONSE:', aiText);

  if (isAIUnavailable(aiText)) {
    const fallbackResult = {
      directAnswer: SAFE_AI_MESSAGE,
      keyInsights: ['No insights available'],
      factors: ['No factors available'],
    };

    console.log('INSIGHTS:', fallbackResult.keyInsights);
    console.log('FACTORS:', fallbackResult.factors);
    return fallbackResult;
  }

  const parsed = parseAIResponse(aiText);
  const keyInsights = extractInsights(aiText, parsed);
  const factors = extractFactors(aiText, parsed);

  const result = {
    directAnswer: extractDirectAnswer(aiText, parsed),
    keyInsights,
    factors,
  };

  console.log('INSIGHTS:', result.keyInsights);
  console.log('FACTORS:', result.factors);

  return result;
}

function parseAIResponse(aiText) {
  const text = String(aiText || '').trim();
  if (!text) return null;

  const candidates = [
    text,
    text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, ''),
    extractJsonObject(text),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch {
      // Keep trying less strict candidates.
    }
  }

  return null;
}

function extractJsonObject(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return '';
  return text.slice(start, end + 1);
}

function extractDirectAnswer(aiText, parsed) {
  const directAnswer = firstStringValue(parsed, ['directAnswer', 'direct_answer', 'answer', 'summary']);
  if (directAnswer) return sanitizeDeclarativeText(directAnswer);

  const section = extractNamedSection(aiText, ['direct answer', 'answer', 'summary'], ['insights', 'key insights', 'factors']);
  if (section) return sanitizeDeclarativeText(section);

  return sanitizeDeclarativeText(aiText);
}

function extractInsights(aiText, parsed) {
  return extractAIList(aiText, parsed, ['insights', 'keyInsights', 'key_insights', 'key insights'], ['No insights available']);
}

function extractFactors(aiText, parsed) {
  return extractAIList(aiText, parsed, ['factors', 'keyFactors', 'key_factors', 'key factors', 'drivers'], ['No factors available']);
}

function extractAIList(aiText, parsed, fieldNames, failureFallback) {
  const parsedList = firstArrayValue(parsed, fieldNames);
  if (parsedList.length) return parsedList;

  const section = extractNamedSection(aiText, fieldNames.map(toSectionName), [
    'direct answer',
    'answer',
    'summary',
    'insights',
    'key insights',
    'factors',
    'key factors',
    'drivers',
  ]);

  const sectionItems = parseListItems(section);
  if (sectionItems.length) return sectionItems;

  const derivedItems = deriveSentences(aiText);
  return derivedItems.length ? derivedItems : failureFallback;
}

function firstStringValue(source, fieldNames) {
  if (!source || typeof source !== 'object') return '';

  for (const fieldName of fieldNames) {
    const value = getCaseInsensitiveValue(source, fieldName);
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function firstArrayValue(source, fieldNames) {
  if (!source || typeof source !== 'object') return [];

  for (const fieldName of fieldNames) {
    const value = getCaseInsensitiveValue(source, fieldName);
    const items = normalizeList(value);
    if (items.length) return items;
  }

  return [];
}

function getCaseInsensitiveValue(source, fieldName) {
  const expected = normalizeFieldName(fieldName);
  const key = Object.keys(source).find((candidate) => normalizeFieldName(candidate) === expected);
  return key ? source[key] : undefined;
}

function normalizeFieldName(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function toSectionName(value) {
  return String(value || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .trim();
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return dedupeList(value.map(cleanListItem).filter((item) => item.length > 0)).slice(0, 5);
  }

  if (typeof value === 'string') {
    return parseListItems(value);
  }

  return [];
}

function extractNamedSection(aiText, sectionNames, stopSectionNames) {
  const text = String(aiText || '').replace(/\r\n/g, '\n');
  if (!text.trim()) return '';

  const escapedNames = sectionNames
    .map((name) => toSectionName(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .filter(Boolean);

  if (!escapedNames.length) return '';

  const headingPattern = new RegExp(`(?:^|\\n)\\s*(?:#{1,6}\\s*)?(?:${escapedNames.join('|')})\\s*:?\\s*\\n`, 'i');
  const match = headingPattern.exec(text);
  if (!match) return '';

  const start = match.index + match[0].length;
  const remaining = text.slice(start);
  const stopPattern = buildStopSectionPattern(stopSectionNames);
  const stopMatch = stopPattern.exec(remaining);

  return (stopMatch ? remaining.slice(0, stopMatch.index) : remaining).trim();
}

function buildStopSectionPattern(sectionNames) {
  const names = dedupeList(sectionNames.map(toSectionName))
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .filter(Boolean);

  return new RegExp(`(?:^|\\n)\\s*(?:#{1,6}\\s*)?(?:${names.join('|')})\\s*:?\\s*(?:\\n|$)`, 'i');
}

function parseListItems(text) {
  const items = String(text || '')
    .split('\n')
    .map(cleanListItem)
    .filter((item) => item.length > 0);

  if (items.length) {
    return dedupeList(items).slice(0, 5);
  }

  return deriveSentences(text);
}

function deriveSentences(text) {
  return dedupeList(
    String(text || '')
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .split(/(?<=[.!?])\s+/)
      .map(cleanListItem)
      .filter((item) => item.length >= 25)
  ).slice(0, 5);
}

function cleanListItem(value) {
  return sanitizeDeclarativeText(value)
    .replace(/^["']|["']$/g, '')
    .replace(/^[\s>*-]*(?:\d+[.)]\s*)?/, '')
    .replace(/,$/, '')
    .trim();
}

function isAIUnavailable(aiText) {
  const normalized = normalizeText(aiText);
  return !normalized || normalized === normalizeText(SAFE_AI_MESSAGE);
}

function generateFinalOutput({ sources, credibility, contradictions, result }) {
  return [
    formatSourcesSection(sources),
    formatCredibilitySection(credibility),
    formatContradictionsSection(contradictions),
    formatResultSection(result),
  ]
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n');
}

function formatResultSection(result) {
  if (Array.isArray(result.keyInsights) && Array.isArray(result.factors)) {
    return [
      `Direct Answer\n${result.directAnswer}`,
      `Key Insights\n${result.keyInsights.map((item) => `- ${item}`).join('\n')}`,
      `Factors\n${result.factors.map((item) => `- ${item}`).join('\n')}`,
    ].join('\n\n');
  }

  return [
    `Direct Answer\n${result.directAnswer}`,
    `Recommendation\n${result.recommendation}`,
    `Reasoning\n${result.reasoning.map((item) => `- ${item}`).join('\n')}`,
    `Trade-offs\n${result.tradeOffs.map((item) => `- ${item}`).join('\n')}`,
    `Conclusion\n${result.conclusion}`,
  ].join('\n\n');
}

function formatSourcesSection(sources) {
  if (!sources.length) {
    return 'Sources\n- No live sources available. Using AI-only response.';
  }

  return [
    'Sources',
    ...sources.map((source) => `- ${source.title} - ${source.snippet}`),
  ].join('\n');
}

function formatCredibilitySection(credibility) {
  return [
    'Credibility',
    `- Confidence Score: ${credibility.confidenceScore}/10`,
    `- Bias Level: ${titleCase(credibility.biasLevel)}`,
    `- Explanation: ${credibility.explanation}`,
  ].join('\n');
}

function formatContradictionsSection(contradictions) {
  if (!contradictions.hasContradiction) {
    return 'Consistency Check\n- No contradictions detected';
  }

  return [
    'Consistency Check',
    '- Contradictions found:',
    ...contradictions.details.map((detail) => `- ${detail}`),
  ].join('\n');
}

async function runAgentPipeline(query) {
  console.log('\n[Orchestrator] Starting pipeline for:', query);

  const analysis = analyzeQuery(query);
  console.log('[Orchestrator] Type:', analysis.type);
  console.log('[Orchestrator] Keywords:', analysis.keywords.join(', '));
  console.log('[Orchestrator] Entities:', analysis.entities.join(', ') || 'none');

  const sources = await performWebSearch(query, analysis.keywords);
  console.log('[Orchestrator] Sources found:', sources.length);

  const prompt = buildResearchPrompt(query, sources, analysis);
  const aiResponse = await generateAIResponse(prompt);
  const credibility = evaluateCredibility(aiResponse);
  const contradictions = detectContradictions(aiResponse);
  const result = buildResultSections(query, analysis, aiResponse);
  const final = generateFinalOutput({ sources, credibility, contradictions, result });

  console.log('[Orchestrator] Pipeline complete.\n');

  return {
    query,
    type: analysis.type,
    sources,
    credibility,
    contradictions,
    result,
    final,
    analysis,
    research: {
      rawResponse: aiResponse,
      sources,
    },
  };
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function dedupeList(values) {
  return [...new Set(values.filter(Boolean))];
}

function countMatches(text, phrases) {
  return phrases.filter((phrase) => text.includes(phrase)).length;
}

function titleCase(value) {
  return String(value || '').charAt(0).toUpperCase() + String(value || '').slice(1);
}

function sanitizeDeclarativeText(text) {
  return String(text || '')
    .replace(/\bAnalyse in\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

module.exports = {
  runAgentPipeline,
  analyzeQuery,
  classifyQueryType,
  getSearchKeywords,
  mapEntities,
  performWebSearch,
  buildResearchPrompt,
  generateAIResponse,
  evaluateCredibility,
  detectContradictions,
  buildResultSections,
  generateFinalOutput,
  formatResultSection,
  sanitizeDeclarativeText,
};
