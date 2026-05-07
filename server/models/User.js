const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ['admin','staff','coach','user'], default: 'user' },

  // Fitness profile (for athletes)
  age:         { type: Number },
  weight:      { type: Number },    // kg
  height:      { type: Number },    // cm
  fitnessGoal: { type: String, enum: ['lose_weight','build_muscle','improve_endurance','stay_active'], default: 'stay_active' },

  // Hierarchy relations
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedCoach:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedPlan: { type: String },

  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
UserSchema.methods.matchPassword = function(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
