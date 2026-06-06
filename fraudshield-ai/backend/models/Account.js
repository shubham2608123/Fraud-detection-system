const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  account_id: {
    type: String,
    required: true,
  },
  batch_id: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  prediction: {
    type: Number,
    enum: [0, 1],
    required: true,
  },
  fraud_probability: {
    type: Number,
    required: true,
  },
  risk_score: {
    type: Number,
    required: true,
  },
  risk_level: {
    type: String,
    enum: ['high', 'medium', 'low'],
    required: true,
  },
  city: String,
  state: String,
  incoming_count: Number,
  outgoing_count: Number,
  incoming_amount: Number,
  outgoing_amount: Number,
  linked_accounts: [String],
  linked_count: Number,
  destination_cities: [String],
  cities_involved: [String],
  city_count: Number,
  row_index: Number,
}, {
  timestamps: true,
});

accountSchema.index({ user: 1, batch_id: 1 });
accountSchema.index({ user: 1, prediction: 1 });
accountSchema.index({ user: 1, risk_score: -1 });

module.exports = mongoose.model('Account', accountSchema);
