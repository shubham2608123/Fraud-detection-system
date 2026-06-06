import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

export default function Settings() {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/model-info')
      .then(res => setModelInfo(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Platform configuration and model management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200"
        >
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Model Files</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-sm">📦</div>
                <div>
                  <p className="text-sm font-medium text-slate-800">fraud_model.pkl</p>
                  <p className="text-xs text-slate-500">XGBoost trained model</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {modelInfo ? 'Loaded' : 'Not Found'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">📦</div>
                <div>
                  <p className="text-sm font-medium text-slate-800">scaler.pkl</p>
                  <p className="text-xs text-slate-500">StandardScaler for features</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {modelInfo ? 'Loaded' : 'Not Found'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-sm">📦</div>
                <div>
                  <p className="text-sm font-medium text-slate-800">feature_columns.pkl</p>
                  <p className="text-xs text-slate-500">Selected feature names</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {modelInfo ? 'Loaded' : 'Not Found'}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200"
        >
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Model Details</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Model Type</p>
                <p className="text-sm font-medium text-slate-800">{modelInfo?.model_type || 'XGBoost'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Features Used</p>
                <p className="text-sm font-medium text-slate-800">From feature_columns.pkl</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Feature Count</p>
                <p className="text-sm font-medium text-slate-800">{modelInfo?.feature_count || 100}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Model Status</p>
                <p className="text-sm font-medium text-green-600">Active</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200"
        >
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">System Settings</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">Auto Processing</p>
                <p className="text-xs text-slate-500">Automatically process uploaded files</p>
              </div>
              <div className="w-10 h-6 bg-primary-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-all"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">Real-time Alerts</p>
                <p className="text-xs text-slate-500">Send real-time alerts via Socket.IO</p>
              </div>
              <div className="w-10 h-6 bg-primary-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-all"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">Store Results in DB</p>
                <p className="text-xs text-slate-500">Persist prediction results in MongoDB</p>
              </div>
              <div className="w-10 h-6 bg-primary-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-all"></div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200"
        >
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Account</h2>
          </div>
          <div className="p-5 space-y-3">
            <button className="w-full text-left px-4 py-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <p className="text-sm font-medium text-slate-800">Change Password</p>
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <p className="text-sm font-medium text-slate-800">Logout from all devices</p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
