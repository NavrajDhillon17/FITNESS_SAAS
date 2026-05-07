const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// ── POST /api/auth/register  (Athletes only — public) ────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age, weight, height, fitnessGoal } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name, email, password,
      role: 'user',
      age, weight, height, fitnessGoal,
    });

    res.status(201).json({
      token: signToken(user._id),
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, fitnessGoal: user.fitnessGoal,
        age: user.age, weight: user.weight, height: user.height,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isActive)
      return res.status(403).json({ message: 'Account is disabled. Contact admin.' });

    res.json({
      token: signToken(user._id),
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, fitnessGoal: user.fitnessGoal,
        age: user.age, weight: user.weight, height: user.height,
        assignedCoach: user.assignedCoach, assignedPlan: user.assignedPlan,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

// ── PUT /api/auth/profile ────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, age, weight, height, fitnessGoal } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, age, weight, height, fitnessGoal },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
