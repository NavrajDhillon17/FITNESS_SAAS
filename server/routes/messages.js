const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ── GET /api/messages/unread-count ──────────────────────────
// Total unread messages for the logged in user
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, isRead: false });
    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/messages/unread-by-sender ──────────────────────
// Breakdown of unread messages by sender (for Coach)
router.get('/unread-by-sender', async (req, res) => {
  try {
    const unreadMessages = await Message.aggregate([
      { $match: { receiver: req.user._id, isRead: false } },
      { $group: { _id: '$sender', count: { $sum: 1 } } }
    ]);
    const unreadMap = unreadMessages.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    res.json(unreadMap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/messages/:userId/read ──────────────────────────
// Mark messages from a specific user as read
router.put('/:userId/read', async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/messages/:userId ──────────────────────────────
// Get conversation between logged in user and :userId
router.get('/:userId', async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    }).sort('createdAt');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/messages/:userId ─────────────────────────────
// Send a message to :userId
router.post('/:userId', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Message text is required' });

    // Ensure the receiver exists
    const receiver = await User.findById(req.params.userId);
    if (!receiver) return res.status(404).json({ message: 'User not found' });

    // If user is a 'user', they can only message their assigned coach
    if (req.user.role === 'user') {
      if (String(req.user.assignedCoach) !== req.params.userId) {
        return res.status(403).json({ message: 'You can only message your assigned coach' });
      }
    }
    
    // If user is a 'coach', they can only message their assigned athletes
    if (req.user.role === 'coach') {
      if (String(receiver.assignedCoach) !== String(req.user._id)) {
         return res.status(403).json({ message: 'You can only message your assigned athletes' });
      }
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: req.params.userId,
      text
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/messages/coach/athletes ───────────────────────
// Get a list of athletes who have messaged the coach, or are assigned to them
router.get('/coach/athletes', async (req, res) => {
  try {
    if (req.user.role !== 'coach') return res.status(403).json({ message: 'Not authorized' });
    
    // Get all assigned athletes
    const athletes = await User.find({ assignedCoach: req.user._id, role: 'user' }).select('name email');
    res.json(athletes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
