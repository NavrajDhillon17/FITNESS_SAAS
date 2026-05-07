const express = require('express');
const User    = require('../models/User');
const Workout = require('../models/Workout');
const Goal    = require('../models/Goal');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('admin', 'staff', 'coach'));

// ── GET /api/coach/overview ─────────────────────────────────
router.get('/overview', async (req, res) => {
  try {
    const assignedUsers = await User.countDocuments({ assignedCoach: req.user._id });
    res.json({ assignedUsers });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/coach/users ────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ assignedCoach: req.user._id }).select('-password');
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/coach/users/:id/assign ────────────────────────
router.post('/users/:id/assign', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'user') return res.status(404).json({ message: 'Athlete not found' });
    if (user.assignedCoach) return res.status(400).json({ message: 'Athlete already has a coach' });
    
    user.assignedCoach = req.user._id;
    await user.save();
    res.json({ message: 'Athlete assigned successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DELETE /api/coach/users/:id/unassign ────────────────────
router.delete('/users/:id/unassign', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (String(user.assignedCoach) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    user.assignedCoach = null;
    user.assignedPlan = '';
    await user.save();
    res.json({ message: 'Athlete removed from roster' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PUT /api/coach/users/:id/plan ───────────────────────────
router.put('/users/:id/plan', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (String(user.assignedCoach) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    user.assignedPlan = req.body.plan;
    await user.save();
    res.json({ message: 'Plan updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/coach/users/:id/progress ───────────────────────
router.get('/users/:id/progress', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (String(user.assignedCoach) !== String(req.user._id) && req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const workouts = await Workout.find({ user: req.params.id }).sort('-date').limit(10);
    const goals = await Goal.find({ user: req.params.id });
    
    res.json({ workouts, goals });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
