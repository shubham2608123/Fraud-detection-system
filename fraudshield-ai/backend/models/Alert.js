const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alert_id: {
    type: String,
    required: true,
  },
  batch_id: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  account_id: String,
  city: String,
  risk_score: Number,
  reasons: [String],
  timestamp: Date,
  status: {
    type: String,
    enum: ['new', 'investigating', 'resolved'],
    default: 'new',
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
  },
  notes: String,
}, {
  timestamps: true,
});

alertSchema.index({ user: 1, severity: 1 });
alertSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Alert', alertSchema);
