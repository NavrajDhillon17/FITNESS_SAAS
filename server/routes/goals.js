const express = require('express');
const Goal    = require('../models/Goal');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ── GET /api/goals ──────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort('-createdAt');
    res.json(goals);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/goals ─────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, targetValue, currentValue, unit, deadline } = req.body;
    
    const goal = await Goal.create({
      user: req.user._id,
      title, targetValue, currentValue, unit, deadline
    });
    
    res.status(201).json(goal);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PUT /api/goals/:id ──────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    
    if (req.body.currentValue !== undefined) goal.currentValue = req.body.currentValue;
    if (req.body.status) goal.status = req.body.status;
    
    await goal.save(); // pre-save hook handles auto-completion
    res.json(goal);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DELETE /api/goals/:id ───────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    
    await goal.deleteOne();
    res.json({ message: 'Goal deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
