import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../utils/api';
import { useApp } from '../context/AppContext';
import EmptyState from '../components/EmptyState';

const COLORS = ['#22c55e', '#f59e0b', '#dc2626'];

export default function ModelInsights() {
  const { data } = useApp();
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/transactions/latest')
      .then(res => {
        if (res.data) {
          return api.get('/model-info').catch(() => null);
        }
        return null;
      })
      .then(res => {
        if (res) setModelInfo(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const topFeatures = modelInfo?.top_features || [];
  const featureData = topFeatures.slice(0, 20).map(f => ({
    feature: f.feature,
    importance: parseFloat((f.importance * 100).toFixed(2)),
  }));

  const confidenceData = (() => {
    if (!data?.predictions) return [];
    const preds = data.predictions;
    const high = preds.filter(p => p.fraud_probability > 0.7).length;
    const med = preds.filter(p => p.fraud_probability > 0.3 && p.fraud_probability <= 0.7).length;
    const low = preds.filter(p => p.fraud_probability <= 0.3).length;
    return [
      { name: 'High Confidence', value: high },
      { name: 'Medium Confidence', value: med },
      { name: 'Low Confidence', value: low },
    ];
  })();

  if (!data) {
    return (
      <EmptyState
        title="No Model Data"
        message="Upload a transaction file to view model insights, feature importance, and prediction explanations."
        actionText="Upload Transactions"
        actionPath="/upload"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Model Insights</h1>
        <p className="text-sm text-slate-500 mt-1">Explainable AI insights from the fraud detection model</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-5 shadow-sm border border-slate-200"
        >
          <h3 className="text-xs text-slate-500 mb-1">Model Type</h3>
          <p className="text-xl font-bold text-slate-800">{modelInfo?.model_type || 'XGBoost'}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-5 shadow-sm border border-slate-200"
        >
          <h3 className="text-xs text-slate-500 mb-1">Features Used</h3>
          <p className="text-xl font-bold text-slate-800">{modelInfo?.feature_count || 100}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-5 shadow-sm border border-slate-200"
        >
          <h3 className="text-xs text-slate-500 mb-1">Model Status</h3>
          <p className="text-xl font-bold text-green-600">{modelInfo?.model_status || 'Active'}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-5 shadow-sm border border-slate-200"
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Top 20 Important Features</h3>
          {featureData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={featureData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="feature" tick={{ fontSize: 9 }} width={60} />
                <Tooltip formatter={(val) => `${val}%`} />
                <Bar dataKey="importance" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-slate-400">
              Feature importance data not available
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-5 shadow-sm border border-slate-200"
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Prediction Confidence Distribution</h3>
          {confidenceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={confidenceData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {confidenceData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-slate-400">
              No prediction data available
            </div>
          )}

          <div className="mt-4 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-semibold text-slate-700 mb-3">Why Accounts Are Flagged</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs">
                <span className="text-red-500 mt-0.5">●</span>
                <span className="text-slate-600">High XGBoost risk score with strong pattern matching</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="text-orange-500 mt-0.5">●</span>
                <span className="text-slate-600">Connected to multiple accounts in short timeframes</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="text-yellow-500 mt-0.5">●</span>
                <span className="text-slate-600">Receives and sends funds rapidly (velocity anomaly)</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="text-blue-500 mt-0.5">●</span>
                <span className="text-slate-600">Transfers across multiple cities indicate mule behavior</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-5 shadow-sm border border-slate-200"
      >
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Model Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-slate-500">Model Type</p>
            <p className="font-medium text-slate-800">{modelInfo?.model_type || 'XGBoost'}</p>
          </div>
          <div>
            <p className="text-slate-500">Features Used</p>
            <p className="font-medium text-slate-800">From feature_columns.pkl</p>
          </div>
          <div>
            <p className="text-slate-500">Feature Count</p>
            <p className="font-medium text-slate-800">{modelInfo?.feature_count || 100}</p>
          </div>
          <div>
            <p className="text-slate-500">Model Status</p>
            <p className="font-medium text-green-600">Active</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
