const express = require('express');
const bcrypt  = require('bcryptjs');
const User    = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('admin'));

// ── GET /api/admin/overview ──────────────────────────────────
router.get('/overview', async (req, res) => {
  try {
    const [admins, staff, coaches, users] = await Promise.all([
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'staff' }),
      User.countDocuments({ role: 'coach' }),
      User.countDocuments({ role: 'user' }),
    ]);
    res.json({ admins, staff, coaches, users, total: admins + staff + coaches + users });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/admin/users ─────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('createdBy', 'name role')
      .sort('-createdAt');
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/admin/staff ─────────────────────────────────────
router.get('/staff', async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['staff', 'admin'] } })
      .select('-password')
      .populate('createdBy', 'name role')
      .sort('-createdAt');
    res.json(staff);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/admin/staff ────────────────────────────────────
router.post('/staff', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });
    
    const newRole = role === 'admin' ? 'admin' : 'staff';
    const staff = await User.create({ name, email, password, role: newRole, createdBy: req.user._id });
    res.status(201).json({ message: 'User created', user: { _id: staff._id, name: staff.name, email: staff.email, role: staff.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/admin/users/:id/toggle ───────────────────────
router.patch('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot disable admin' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'enabled' : 'disabled'}`, isActive: user.isActive });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DELETE /api/admin/users/:id ──────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin' });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
