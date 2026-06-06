const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  model_files: {
    fraud_model: { filename: String, upload_date: Date, size: Number },
    scaler: { filename: String, upload_date: Date, size: Number },
    feature_columns: { filename: String, upload_date: Date, size: Number },
  },
  model_info: {
    model_type: { type: String, default: 'XGBoost' },
    feature_count: Number,
    model_status: { type: String, default: 'active' },
    last_prediction: Date,
  },
  system: {
    auto_processing: { type: Boolean, default: true },
    real_time_alerts: { type: Boolean, default: true },
    store_results: { type: Boolean, default: true },
  },
});

module.exports = mongoose.model('Settings', settingsSchema);
