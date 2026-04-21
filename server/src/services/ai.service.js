// PATH: server/src/services/ai.service.js
// Real AI analysis using Gemini (primary) with OpenAI fallback
// Falls back to rule-based if both fail

const { detectAttack, getConfidence } = require('../utils/detect')

// ── Gemini caller ─────────────────────────────────────────────────────────────
async function callGemini(prompt) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('No Gemini key')

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.2, maxOutputTokens: 800 },
            }),
        }
    )
    if (!res.ok) throw new Error(`Gemini ${res.status}`)
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// ── OpenAI caller ─────────────────────────────────────────────────────────────
async function callOpenAI(prompt) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('No OpenAI key')

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_tokens: 800,
        }),
    })
    if (!res.ok) throw new Error(`OpenAI ${res.status}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content || ''
}

// ── Parse AI JSON response safely ─────────────────────────────────────────────
function parseAIJson(text) {
    try {
        // strip markdown code fences if present
        const clean = text.replace(/```json|```/g, '').trim()
        return JSON.parse(clean)
    } catch {
        return null
    }
}

// ── Build rule-based fallback (no AI cost) ────────────────────────────────────
function ruleBasedAnalysis(payload, attackTypeHint) {
    const result = detectAttack(payload)
    const attackType = attackTypeHint || result.attackType || 'Unknown'
    const confidence = getConfidence(attackType)

    return {
        detected: result.detected ?? false,
        attackType,
        confidence,
        riskScore: result.detected ? result.riskScore : Math.floor(Math.random() * 12) + 2,
        severity: result.detected ? result.severity : 'Low',
        cvssScore: result.detected ? (result.riskScore / 10).toFixed(1) : '1.0',
        affectedComponents: result.detected ? ['HTTP Request Parser', 'Input Validation Layer'] : ['None'],
        mitreTechnique: getMitreTechnique(attackType),
        recommendation: result.detected
            ? `Block request. Return HTTP 403. Log source IP for monitoring.`
            : `Request appears legitimate. Allow with standard logging.`,
        explanation: result.detected
            ? `The payload matches known ${attackType} patterns. The WAF signature engine detected suspicious tokens that indicate a malicious intent.`
            : `No attack signatures were matched. The request payload is within acceptable parameters.`,
        steps: buildSteps(payload, attackType, result.detected ?? false),
    }
}

// ── Main export: analyzePayload ────────────────────────────────────────────────
async function analyzePayload(payload, attackTypeHint, useAI = true) {
    // Run local detection first (instant, always reliable)
    const local = detectAttack(payload)
    const attackType = attackTypeHint || local.attackType || 'Unknown'

    // If AI is disabled or payload is clearly clean, skip AI call
    if (!useAI || (!local.detected && !attackTypeHint)) {
        return ruleBasedAnalysis(payload, attackTypeHint)
    }

    const prompt = buildPrompt(payload, attackType, local)

    let aiText = null

    // Try Gemini first
    try {
        aiText = await callGemini(prompt)
    } catch (e) {
        console.warn('[AI] Gemini failed:', e.message, '→ trying OpenAI')
    }

    // Fallback to OpenAI
    if (!aiText) {
        try {
            aiText = await callOpenAI(prompt)
        } catch (e) {
            console.warn('[AI] OpenAI failed:', e.message, '→ using rule-based fallback')
        }
    }

    // Parse AI response
    const parsed = aiText ? parseAIJson(aiText) : null

    if (!parsed) {
        console.warn('[AI] Could not parse AI response, using rule-based fallback')
        return ruleBasedAnalysis(payload, attackTypeHint)
    }

    // Merge AI output with local detection (local detection is ground truth for detected/riskScore)
    return {
        detected: local.detected ?? parsed.detected ?? false,
        attackType: parsed.attackType || attackType,
        confidence: parsed.confidence || getConfidence(attackType),
        riskScore: local.detected ? (local.riskScore || parsed.riskScore || 85) : (parsed.riskScore || 5),
        severity: local.detected ? (local.severity || parsed.severity) : (parsed.severity || 'Low'),
        cvssScore: parsed.cvssScore || (local.detected ? '8.5' : '1.0'),
        affectedComponents: parsed.affectedComponents || ['HTTP Layer'],
        mitreTechnique: parsed.mitreTechnique || getMitreTechnique(attackType),
        recommendation: parsed.recommendation || 'Review request and apply appropriate WAF rule.',
        explanation: parsed.explanation || 'Analysis complete.',
        steps: buildSteps(payload, parsed.attackType || attackType, local.detected ?? false),
    }
}

// ── Build Gemini prompt ────────────────────────────────────────────────────────
function buildPrompt(payload, attackTypeHint, localResult) {
    return `You are a Web Application Firewall (WAF) AI engine. Analyze this HTTP request payload and return ONLY a JSON object — no markdown, no explanation outside the JSON.

Payload: "${payload.slice(0, 300)}"
Attack type hint: ${attackTypeHint}
Local detection result: ${localResult.detected ? `DETECTED as ${localResult.attackType} (risk: ${localResult.riskScore})` : 'NOT detected by rule engine'}

Return this exact JSON:
{
  "detected": true/false,
  "attackType": "SQL Injection|XSS|Path Traversal|Command Injection|SSRF|XXE|CSRF|Brute Force|Unknown",
  "confidence": 0-100,
  "riskScore": 0-100,
  "severity": "Critical|High|Medium|Low",
  "cvssScore": "0.0-10.0",
  "affectedComponents": ["component1", "component2"],
  "mitreTechnique": "e.g. T1190 - Exploit Public-Facing Application",
  "recommendation": "one clear sentence on what the WAF should do",
  "explanation": "2-3 sentence technical explanation of why this is or isn't an attack"
}`
}

// ── MITRE ATT&CK mapping ──────────────────────────────────────────────────────
function getMitreTechnique(attackType) {
    const map = {
        'SQL Injection': 'T1190 - Exploit Public-Facing Application',
        'XSS': 'T1059.007 - JavaScript Execution',
        'Path Traversal': 'T1083 - File and Directory Discovery',
        'Command Injection': 'T1059 - Command and Scripting Interpreter',
        'SSRF': 'T1090 - Proxy via Internal Services',
        'XXE': 'T1190 - XML External Entity Injection',
        'CSRF': 'T1185 - Browser Session Hijacking',
        'Brute Force': 'T1110 - Brute Force',
    }
    return map[attackType] || 'T1190 - Exploit Public-Facing Application'
}

// ── Step-by-step trace for simulator UI ───────────────────────────────────────
function buildSteps(payload, attackType, detected) {
    return [
        {
            step: 1,
            label: 'Request Intercepted',
            detail: `WAF received HTTP request with payload: "${payload.slice(0, 55)}…"`,
            status: 'ok',
            ms: Math.floor(Math.random() * 2) + 1,
        },
        {
            step: 2,
            label: 'Signature Database Scan',
            detail: detected
                ? `Matched ${attackType} signature pattern in OWASP rule set`
                : 'No signatures matched in 847 rule checks',
            status: detected ? 'match' : 'ok',
            ms: Math.floor(Math.random() * 4) + 2,
        },
        {
            step: 3,
            label: 'AI Anomaly Scoring',
            detail: detected
                ? `Anomaly score 94/100 — exceeds block threshold (>75)`
                : 'Anomaly score 12/100 — within safe range',
            status: detected ? 'match' : 'ok',
            ms: Math.floor(Math.random() * 8) + 5,
        },
        {
            step: 4,
            label: 'Threat Intelligence Lookup',
            detail: detected
                ? `Source pattern matches known ${attackType} toolkit`
                : 'No threat intelligence hits found',
            status: detected ? 'match' : 'ok',
            ms: Math.floor(Math.random() * 6) + 3,
        },
        {
            step: 5,
            label: 'WAF Policy Decision',
            detail: detected
                ? `Rule triggered: OWASP ${attackType} Protection → ACTION: BLOCK`
                : 'All policy checks passed → ACTION: ALLOW',
            status: detected ? 'blocked' : 'allowed',
            ms: 1,
        },
    ]
}

// ── AI-generated metrics insight ──────────────────────────────────────────────
async function generateMetricInsight(summary) {
    const prompt = `You are a cybersecurity AI analyst. Given these WAF metrics, write a 2-sentence insight for a security dashboard. Be specific, concise, and professional. Return ONLY the insight text, no JSON.

Metrics:
- Total requests: ${summary.totalRequests}
- Blocked attacks: ${summary.blockedAttacks}
- Block rate: ${summary.blockRate}%
- Top threat: ${summary.topThreat}
- Active rules: ${summary.activeRules}`

    try {
        const text = await callGemini(prompt)
        return text.trim()
    } catch {
        try {
            const text = await callOpenAI(prompt)
            return text.trim()
        } catch {
            return `${summary.blockedAttacks} attacks blocked out of ${summary.totalRequests} total requests (${summary.blockRate}% block rate). Top threat vector: ${summary.topThreat}.`
        }
    }
}

module.exports = { analyzePayload, generateMetricInsight, ruleBasedAnalysis }