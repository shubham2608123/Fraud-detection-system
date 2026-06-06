const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  batch_id: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: String,
  upload_time: Date,
  processing_time: Number,
  summary: {
    total_transactions: Number,
    total_accounts: Number,
    mule_accounts_detected: Number,
    actual_mule_count: Number,
    high_risk_count: Number,
    medium_risk_count: Number,
    low_risk_count: Number,
    alerts_generated: Number,
    average_risk_score: Number,
    highest_risk_score: Number,
  },
  predictions: [mongoose.Schema.Types.Mixed],
  transactions: [mongoose.Schema.Types.Mixed],
  alerts: [mongoose.Schema.Types.Mixed],
  routes: [mongoose.Schema.Types.Mixed],
}, {
  timestamps: true,
});

transactionSchema.index({ user: 1, upload_time: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
