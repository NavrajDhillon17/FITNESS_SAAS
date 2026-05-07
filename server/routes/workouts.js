const express = require('express');
const Workout = require('../models/Workout');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ── GET /api/workouts ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const workouts = await Workout.find({ user: req.user._id })
      .sort('-date')
      .limit(limit);
    
    res.json({ workouts });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/workouts ──────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, date, notes, exercises } = req.body;
    
    const workout = await Workout.create({
      user: req.user._id,
      title, date: date || Date.now(), notes, exercises
    });
    
    res.status(201).json(workout);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DELETE /api/workouts/:id ────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    
    await workout.deleteOne();
    res.json({ message: 'Workout deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
