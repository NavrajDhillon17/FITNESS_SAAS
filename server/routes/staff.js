const express = require('express');
const User    = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('admin', 'staff'));

// ── GET /api/staff/overview ─────────────────────────────────
router.get('/overview', async (req, res) => {
  try {
    const coaches = await User.find({ createdBy: req.user._id, role: 'coach' });
    const coachIds = coaches.map(c => c._id);
    const usersManaged = await User.countDocuments({ assignedCoach: { $in: coachIds } });
    
    res.json({ coaches: coaches.length, usersManaged });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/staff/coaches ──────────────────────────────────
router.get('/coaches', async (req, res) => {
  try {
    const filter = { role: 'coach' };
    if (req.user.role !== 'admin') {
      filter.createdBy = req.user._id;
    }
    const coaches = await User.find(filter).select('-password');
    res.json(coaches);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/staff/coaches ─────────────────────────────────
router.post('/coaches', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });
      
    const coach = await User.create({
      name, email, password,
      role: 'coach',
      createdBy: req.user._id
    });
    
    res.status(201).json({ message: 'Coach created', user: { _id: coach._id, name: coach.name, email: coach.email } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/staff/users ────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    let users;
    if (req.user.role === 'admin') {
      users = await User.find({ role: 'user' })
        .select('-password')
        .populate('assignedCoach', 'name email')
        .sort('-createdAt');
    } else {
      const coaches = await User.find({ createdBy: req.user._id, role: 'coach' });
      const coachIds = coaches.map(c => c._id);
      // Include both assigned-to-my-coaches AND unassigned athletes
      users = await User.find({
        role: 'user',
        $or: [
          { assignedCoach: { $in: coachIds } },
          { assignedCoach: { $in: [null, undefined] } }
        ]
      })
        .select('-password')
        .populate('assignedCoach', 'name email')
        .sort('-createdAt');
    }
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/staff/unassigned ───────────────────────────────
router.get('/unassigned', async (req, res) => {
  try {
    const users = await User.find({ role: 'user', assignedCoach: { $in: [null, undefined] } }).select('-password');
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/staff/assign ──────────────────────────────────
router.post('/assign', async (req, res) => {
  try {
    const { userId, coachId } = req.body;
    const user = await User.findById(userId);
    const coach = await User.findById(coachId);
    
    if (!user || user.role !== 'user') return res.status(404).json({ message: 'User not found' });
    if (!coach || coach.role !== 'coach') return res.status(404).json({ message: 'Coach not found' });
    
    if (req.user.role !== 'admin' && String(coach.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Can only assign to your own coaches' });
    }

    user.assignedCoach = coachId;
    await user.save();
    res.json({ message: 'User assigned to coach successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/staff/users/:id/toggle ──────────────────────
// Staff can enable/disable athlete accounts
router.patch('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'user') return res.status(403).json({ message: 'Staff can only toggle athlete accounts' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `Athlete ${user.isActive ? 'enabled' : 'disabled'}`, isActive: user.isActive });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/staff/users/:id/reassign ────────────────────
// Staff can reassign an athlete to a different coach
router.patch('/users/:id/reassign', async (req, res) => {
  try {
    const { coachId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'user') return res.status(404).json({ message: 'Athlete not found' });

    if (coachId) {
      const coach = await User.findById(coachId);
      if (!coach || coach.role !== 'coach') return res.status(404).json({ message: 'Coach not found' });
      if (req.user.role !== 'admin' && String(coach.createdBy) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Can only assign to your own coaches' });
      }
      user.assignedCoach = coachId;
    } else {
      user.assignedCoach = null; // unassign
    }

    await user.save();
    const updated = await User.findById(user._id).populate('assignedCoach', 'name email');
    res.json({ message: 'Athlete reassigned successfully', user: updated });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
