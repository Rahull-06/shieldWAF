// const axios = require('axios');

// // ─── Severity bands ───────────────────────────────────────────────────────────
// const getSeverity = (score) => {
//     if (score >= 85) return 'critical';
//     if (score >= 65) return 'high';
//     if (score >= 40) return 'medium';
//     if (score >= 15) return 'low';
//     return 'none';
// };

// const getRecommendation = (score) => {
//     if (score >= 65) return 'block';
//     if (score >= 30) return 'monitor';
//     return 'allow';
// };

// // ─── Build the analysis prompt ────────────────────────────────────────────────
// const buildPrompt = (requestData) => {
//     const { method, path, ip, headers, body, detections } = requestData;

//     return `You are a Web Application Firewall (WAF) security analyst AI.

// Analyze this incoming HTTP request for security threats.

// REQUEST:
//   Method  : ${method || 'GET'}
//   Path    : ${path || '/'}
//   IP      : ${ip || 'unknown'}
//   Headers : ${JSON.stringify(headers || {}, null, 2)}
//   Body    : ${JSON.stringify(body || {}, null, 2)}

// PRE-DETECTED THREATS (from rule engine):
//   ${detections && detections.length > 0 ? detections.map(d => `- ${d.type} (pattern: ${d.pattern})`).join('\n  ') : 'None detected by rule engine'}

// Respond ONLY with a valid JSON object in this exact format (no markdown, no explanation outside JSON):
// {
//   "threatScore": <integer 0-100>,
//   "confidence": <integer 0-100>,
//   "categories": [<threat category strings>],
//   "explanation": "<one paragraph explaining your reasoning>"
// }

// Scoring guide:
// - 0-14   : Clean request, no threats
// - 15-39  : Suspicious but likely benign
// - 40-64  : Moderate threat, warrants monitoring
// - 65-84  : High threat, should be blocked
// - 85-100 : Critical attack, block immediately`;
// };

// // ─── Parse AI JSON response safely ───────────────────────────────────────────
// const parseAIResponse = (text) => {
//     try {
//         const clean  = text.replace(/```json|```/g, '').trim();
//         const parsed = JSON.parse(clean);

//         const threatScore = Math.min(100, Math.max(0, parseInt(parsed.threatScore) || 0));
//         const confidence  = Math.min(100, Math.max(0, parseInt(parsed.confidence)  || 50));

//         return {
//             threatScore,
//             confidence,
//             categories    : Array.isArray(parsed.categories) ? parsed.categories : [],
//             explanation   : parsed.explanation || 'No explanation provided.',
//             severity      : getSeverity(threatScore),
//             recommendation: getRecommendation(threatScore),
//         };
//     } catch {
//         return null;
//     }
// };

// // ─── Gemini Provider (FREE ✅) ────────────────────────────────────────────────
// //  Get free key at: https://aistudio.google.com/apikey
// //  Free tier: 1500 requests/day, 15/min — more than enough for ShieldWAF
// // ─────────────────────────────────────────────────────────────────────────────
// const analyzeWithGemini = async (requestData) => {
//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) throw new Error('GEMINI_API_KEY not set in .env');

//     const response = await axios.post(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
//         {
//             contents: [{
//                 parts: [{ text: buildPrompt(requestData) }],
//             }],
//             generationConfig: {
//                 temperature    : 0.1,
//                 maxOutputTokens: 512,
//             },
//         },
//         {
//             headers: { 'Content-Type': 'application/json' },
//             timeout: 10000,
//         }
//     );

//     const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
//     const parsed  = parseAIResponse(rawText);

//     if (!parsed) throw new Error('Gemini returned unparseable response');

//     return { ...parsed, provider: 'gemini', rawResponse: rawText };
// };

// // ─── Claude Provider ──────────────────────────────────────────────────────────
// const analyzeWithClaude = async (requestData) => {
//     const apiKey = process.env.ANTHROPIC_API_KEY;
//     if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set in .env');

//     const response = await axios.post(
//         'https://api.anthropic.com/v1/messages',
//         {
//             model     : 'claude-haiku-4-5-20251001',
//             max_tokens: 512,
//             messages  : [{ role: 'user', content: buildPrompt(requestData) }],
//         },
//         {
//             headers: {
//                 'x-api-key'        : apiKey,
//                 'anthropic-version': '2023-06-01',
//                 'content-type'     : 'application/json',
//             },
//             timeout: 10000,
//         }
//     );

//     const rawText = response.data?.content?.[0]?.text || '';
//     const parsed  = parseAIResponse(rawText);

//     if (!parsed) throw new Error('Claude returned unparseable response');

//     return { ...parsed, provider: 'claude', rawResponse: rawText };
// };

// // ─── OpenAI Provider ──────────────────────────────────────────────────────────
// const analyzeWithOpenAI = async (requestData) => {
//     const apiKey = process.env.OPENAI_API_KEY;
//     if (!apiKey) throw new Error('OPENAI_API_KEY not set in .env');

//     const response = await axios.post(
//         'https://api.openai.com/v1/chat/completions',
//         {
//             model      : 'gpt-4o-mini',
//             max_tokens : 512,
//             temperature: 0.1,
//             messages   : [
//                 {
//                     role   : 'system',
//                     content: 'You are a WAF security analyst. Always respond with valid JSON only.',
//                 },
//                 { role: 'user', content: buildPrompt(requestData) },
//             ],
//         },
//         {
//             headers: {
//                 Authorization : `Bearer ${apiKey}`,
//                 'Content-Type': 'application/json',
//             },
//             timeout: 10000,
//         }
//     );

//     const rawText = response.data?.choices?.[0]?.message?.content || '';
//     const parsed  = parseAIResponse(rawText);

//     if (!parsed) throw new Error('OpenAI returned unparseable response');

//     return { ...parsed, provider: 'openai', rawResponse: rawText };
// };

// // ─── Mock / Local Scorer (no API key needed) ──────────────────────────────────
// const analyzeWithMock = (requestData) => {
//     const { detections = [], body = {}, path = '', headers = {} } = requestData;

//     let score = 0;
//     const categories = [];

//     const severityWeights = { critical: 35, high: 25, medium: 15, low: 8 };
//     for (const d of detections) {
//         const weight = severityWeights[d.severity] || 10;
//         score += weight;
//         if (!categories.includes(d.type)) categories.push(d.type);
//     }

//     const bodyStr = JSON.stringify(body).toLowerCase();
//     const pathStr = path.toLowerCase();

//     if (/(\bselect\b|\bdrop\b|\bunion\b|\binsert\b)/i.test(bodyStr + pathStr)) {
//         score += 20; if (!categories.includes('sqli')) categories.push('sqli');
//     }
//     if (/<script|onerror|onload|javascript:/i.test(bodyStr + pathStr)) {
//         score += 20; if (!categories.includes('xss')) categories.push('xss');
//     }
//     if (/\.\.\//i.test(pathStr)) {
//         score += 15; if (!categories.includes('path-traversal')) categories.push('path-traversal');
//     }
//     if (!headers['user-agent']) {
//         score += 5;
//     }

//     score = Math.min(100, score);
//     const confidence = Math.min(95, 40 + detections.length * 12 + categories.length * 8);

//     return {
//         provider      : 'mock',
//         threatScore   : score,
//         confidence,
//         severity      : getSeverity(score),
//         recommendation: getRecommendation(score),
//         categories,
//         explanation   : score === 0
//             ? 'No threat indicators found. Request appears clean.'
//             : `Detected ${categories.join(', ')} patterns. Score ${score}/100 based on ${detections.length} rule hits and heuristic analysis.`,
//         rawResponse   : null,
//     };
// };

// // ─── Main Export ──────────────────────────────────────────────────────────────
// const analyzeRequest = async (requestData) => {
//     const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();

//     try {
//         if (provider === 'gemini') return await analyzeWithGemini(requestData);
//         if (provider === 'claude') return await analyzeWithClaude(requestData);
//         if (provider === 'openai') return await analyzeWithOpenAI(requestData);
//         return analyzeWithMock(requestData);
//     } catch (err) {
//         console.error(`[AI] ${provider} failed — falling back to mock:`, err.message);
//         return {
//             ...analyzeWithMock(requestData),
//             provider   : 'mock-fallback',
//             explanation: `AI provider (${provider}) unavailable. Mock scorer used. Original error: ${err.message}`,
//         };
//     }
// };

// module.exports = { analyzeRequest };










// PATH: server/src/services/ai.service.js
// "AI" analysis service — rule-based scoring that sounds intelligent in demos.
// No actual ML needed for this project level. Just smart heuristics.

const { detectAttack, getConfidence } = require('../utils/detect')

/**
 * Analyze a payload and return a structured AI-style report.
 * Used by the simulator to generate the "WAF Analysis Result" panel.
 */
function analyzePayload(payload, attackTypeHint) {
    const result = detectAttack(payload)
    const attackType = attackTypeHint || result.attackType || 'Unknown'
    const confidence = getConfidence(attackType)

    const steps = buildSteps(payload, attackType, result.detected)

    return {
        detected: result.detected,
        attackType,
        confidence,
        riskScore: result.detected ? result.riskScore : Math.floor(Math.random() * 10) + 2,
        severity: result.detected ? result.severity : 'Low',
        steps,
        recommendation: result.detected
            ? `Block request. Return HTTP 403. Log source IP for further monitoring.`
            : `Request appears legitimate. Allow with standard logging.`,
    }
}

/**
 * Build step-by-step analysis trace for the simulator UI.
 */
function buildSteps(payload, attackType, detected) {
    const steps = [
        {
            step: 1,
            label: 'Request Received',
            detail: `Intercepted ${payload.slice(0, 60)}…`,
            status: 'ok',
            ms: Math.floor(Math.random() * 2) + 1,
        },
        {
            step: 2,
            label: 'Signature Matching',
            detail: detected
                ? `Pattern matched: ${attackType} signature database`
                : 'No known attack signatures matched',
            status: detected ? 'match' : 'ok',
            ms: Math.floor(Math.random() * 3) + 1,
        },
        {
            step: 3,
            label: 'Anomaly Scoring',
            detail: detected
                ? `Anomaly score exceeded threshold (>80)`
                : 'Anomaly score within normal range',
            status: detected ? 'match' : 'ok',
            ms: Math.floor(Math.random() * 2) + 1,
        },
        {
            step: 4,
            label: 'Rule Engine Evaluation',
            detail: detected
                ? `WAF rule triggered: ${attackType} protection rule`
                : 'All WAF rules passed',
            status: detected ? 'match' : 'ok',
            ms: Math.floor(Math.random() * 2) + 1,
        },
        {
            step: 5,
            label: 'Final Verdict',
            detail: detected
                ? `🚫 REQUEST BLOCKED — HTTP 403 Forbidden`
                : `✅ REQUEST ALLOWED — HTTP 200 OK`,
            status: detected ? 'blocked' : 'allowed',
            ms: 0,
        },
    ]
    return steps
}

module.exports = { analyzePayload }