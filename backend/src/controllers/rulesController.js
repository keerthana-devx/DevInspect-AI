import Rule from '../models/Rule.js';

/* GET /api/rules */
export const getRules = async (req, res) => {
  try {
    const rules = await Rule.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* POST /api/rules */
export const createRule = async (req, res) => {
  try {
    const { text, category } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Rule text is required' });

    const rule = await Rule.create({ user: req.user._id, text: text.trim(), category: category || 'general' });
    res.status(201).json(rule);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'This rule already exists' });
    res.status(500).json({ message: err.message });
  }
};

/* PUT /api/rules/:id — update text/category */
export const updateRule = async (req, res) => {
  try {
    const { text, category } = req.body;
    const rule = await Rule.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { ...(text && { text: text.trim() }), ...(category && { category }) },
      { new: true }
    );
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    res.json(rule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* PATCH /api/rules/:id/toggle — flip enabled */
export const toggleRule = async (req, res) => {
  try {
    const rule = await Rule.findOne({ _id: req.params.id, user: req.user._id });
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    rule.enabled = !rule.enabled;
    await rule.save();
    res.json(rule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE /api/rules/:id */
export const deleteRule = async (req, res) => {
  try {
    await Rule.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Helper — get enabled rule texts for a user (used in AI pipeline) */
export const getEnabledRuleTexts = async (userId) => {
  const rules = await Rule.find({ user: userId, enabled: true }).select('text').lean();
  return rules.map(r => r.text);
};
