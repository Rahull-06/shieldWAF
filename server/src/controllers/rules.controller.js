// PATH: server/src/controllers/rules.controller.js
const Rule = require('../models/Rule')

// ── GET /api/rules ────────────────────────────────────────────────────────────
async function getRules(req, res) {
    try {
        const { severity = '', search = '' } = req.query
        const filter = {}

        if (severity) filter.severity = severity
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
            ]
        }

        const rules = await Rule.find(filter).sort({ ruleId: 1 }).lean()
        const formatted = rules.map(r => ({ ...r, id: r._id.toString() }))

        res.json({ success: true, data: formatted })
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch rules.' })
    }
}

// ── POST /api/rules ───────────────────────────────────────────────────────────
async function createRule(req, res) {
    try {
        const { name, description, category, action, severity, patterns } = req.body

        if (!name || !category || !severity) {
            return res.status(400).json({ success: false, error: 'Name, category and severity are required.' })
        }

        // Auto-generate ruleId
        const last = await Rule.findOne().sort({ ruleId: -1 })
        const nextId = last ? String(Number(last.ruleId) + 1).padStart(3, '0') : '009'

        const rule = await Rule.create({
            ruleId: nextId,
            name,
            description: description || '',
            category,
            action: action || 'Block',
            severity,
            patterns: patterns || [],
            hits: 0,
            enabled: true,
        })

        res.status(201).json({ success: true, data: { ...rule.toJSON(), id: rule._id.toString() } })
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, error: Object.values(err.errors).map(e => e.message).join(', ') })
        }
        res.status(500).json({ success: false, error: 'Failed to create rule.' })
    }
}

// ── PATCH /api/rules/:id ──────────────────────────────────────────────────────
async function updateRule(req, res) {
    try {
        const { name, description, category, action, severity, enabled } = req.body
        const updates = {}

        if (name !== undefined) updates.name = name
        if (description !== undefined) updates.description = description
        if (category !== undefined) updates.category = category
        if (action !== undefined) updates.action = action
        if (severity !== undefined) updates.severity = severity
        if (enabled !== undefined) updates.enabled = enabled

        const rule = await Rule.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
        if (!rule) return res.status(404).json({ success: false, error: 'Rule not found.' })

        res.json({ success: true, data: { ...rule.toJSON(), id: rule._id.toString() } })
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to update rule.' })
    }
}

// ── DELETE /api/rules/:id ─────────────────────────────────────────────────────
async function deleteRule(req, res) {
    try {
        const rule = await Rule.findByIdAndDelete(req.params.id)
        if (!rule) return res.status(404).json({ success: false, error: 'Rule not found.' })
        res.json({ success: true, message: 'Rule deleted.' })
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to delete rule.' })
    }
}

// ── PATCH /api/rules/:id/toggle ───────────────────────────────────────────────
async function toggleRule(req, res) {
    try {
        const rule = await Rule.findById(req.params.id)
        if (!rule) return res.status(404).json({ success: false, error: 'Rule not found.' })

        rule.enabled = !rule.enabled
        await rule.save()

        res.json({ success: true, data: { ...rule.toJSON(), id: rule._id.toString() } })
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to toggle rule.' })
    }
}

module.exports = { getRules, createRule, updateRule, deleteRule, toggleRule }