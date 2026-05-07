const express = require('express');
const Workout = require('../models/Workout');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ── GET /api/progress/weekly ────────────────────────────────
router.get('/weekly', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const workouts = await Workout.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgo }
    }).sort('date');
    
    // Group by day for the chart
    const dailyData = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyData[dateStr] = { date: dateStr, calories: 0, duration: 0 };
    }
    
    workouts.forEach(w => {
      const dateStr = w.date.toISOString().split('T')[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].calories += w.totalCalories;
        dailyData[dateStr].duration += w.totalDuration;
      }
    });
    
    res.json(Object.values(dailyData));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/progress/monthly ───────────────────────────────
router.get('/monthly', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const workouts = await Workout.find({
      user: req.user._id,
      date: { $gte: thirtyDaysAgo }
    });
    
    const totals = workouts.reduce((acc, w) => {
      acc.workouts++;
      acc.calories += w.totalCalories;
      acc.duration += w.totalDuration;
      return acc;
    }, { workouts: 0, calories: 0, duration: 0 });
    
    res.json(totals);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
