const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:        { type: String, required: true },
  targetValue:  { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  unit:         { type: String, default: 'kg' },
  status:       { type: String, enum: ['active','completed','paused'], default: 'active' },
  deadline:     { type: Date },
}, { timestamps: true });

// Auto-complete when target reached
GoalSchema.pre('save', function(next) {
  if (this.currentValue >= this.targetValue) this.status = 'completed';
  next();
});

module.exports = mongoose.model('Goal', GoalSchema);
