const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  sets:     { type: Number, default: 0 },
  reps:     { type: Number, default: 0 },
  weight:   { type: Number, default: 0 },   // kg
  duration: { type: Number, default: 0 },   // minutes
  calories: { type: Number, default: 0 },
});

const WorkoutSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:         { type: String, required: true },
  date:          { type: Date, default: Date.now },
  exercises:     [ExerciseSchema],
  notes:         { type: String },
  totalCalories: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-calculate totals
WorkoutSchema.pre('save', function(next) {
  this.totalCalories = this.exercises.reduce((s, e) => s + (e.calories || 0), 0);
  this.totalDuration = this.exercises.reduce((s, e) => s + (e.duration || 0), 0);
  next();
});

module.exports = mongoose.model('Workout', WorkoutSchema);
