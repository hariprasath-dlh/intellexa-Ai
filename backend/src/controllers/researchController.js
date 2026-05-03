// src/controllers/researchController.js

const { runAgentPipeline } = require('../agents/orchestrator');

/**
 * Handles POST /api/research
 *
 * Runs the full orchestrator pipeline and returns a structured JSON response
 * matching the frontend ResearchApiResponse type:
 * {
 *   query, type, sources, credibility, contradictions,
 *   result: { directAnswer, keyInsights, factors }
 * }
 */
async function handleResearchRequest(req, res) {
  try {
    const { query } = req.body;

    // Validate input
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        error: 'A non-empty "query" string is required in the request body.',
      });
    }

    console.log('[Research] Query received:', query.trim());

    // ── Run the full agent pipeline ──
    const pipelineResult = await runAgentPipeline(query.trim());

    // ── Map Serper sources: rename `link` → `url` for frontend compatibility ──
    const sources = (pipelineResult.sources || []).map((s) => ({
      title:   s.title   || 'Untitled source',
      snippet: s.snippet || '',
      url:     s.link    || s.url || '#',
      site:    s.site    || extractHost(s.link || s.url),
    }));

    // ── Build the JSON response matching ResearchApiResponse ──
    const responsePayload = {
      query:          pipelineResult.query,
      type:           pipelineResult.type,
      sources,
      credibility:    pipelineResult.credibility,
      contradictions: pipelineResult.contradictions,
      result: {
        directAnswer: pipelineResult.result?.directAnswer || '',
        keyInsights:  pipelineResult.result?.keyInsights  || [],
        factors:      pipelineResult.result?.factors      || [],
      },
    };

    console.log('[Research] Sending JSON response. Sources:', sources.length);
    return res.status(200).json(responsePayload);

  } catch (err) {
    console.error('[Research] Agent error:', err.message);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}

/** Extract hostname from a URL string safely. */
function extractHost(url) {
  if (!url) return 'source';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'source';
  }
}

module.exports = { handleResearchRequest };
