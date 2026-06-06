import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';

export default function UploadTransactions() {
  const { uploadFile, uploading } = useApp();
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFile = useCallback(async (file) => {
    setError('');
    try {
      const res = await uploadFile(file);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process file');
    }
  }, [uploadFile]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Upload Transactions</h1>
        <p className="text-sm text-gray-400 mt-1">Upload CSV or Excel files for AI-powered fraud analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
              dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            {uploading ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                <p className="text-sm text-gray-600 font-medium">Processing transactions with AI model...</p>
                <p className="text-xs text-gray-400">This may take a moment for large files</p>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Drag & Drop your transaction file here</p>
                <p className="text-xs text-gray-400 mb-4">or</p>
                <label className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 cursor-pointer transition-colors shadow-lg shadow-blue-500/30">
                  Choose File
                  <input type="file" accept=".csv,.xlsx,.xls" onChange={onFileSelect} className="hidden" />
                </label>
                <p className="text-xs text-gray-400 mt-4">Supported formats: CSV, Excel</p>
              </>
            )}
          </motion.div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-5 py-4 rounded-xl mt-4 border border-red-100 flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-4">How it works</h3>
            <ol className="space-y-4 text-xs text-gray-600">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</span>
                <span className="pt-0.5">Upload CSV/Excel transaction file</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</span>
                <span className="pt-0.5">AI model analyzes transactions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</span>
                <span className="pt-0.5">Detects mule accounts & risk scores</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">4</span>
                <span className="pt-0.5">Generates alerts and insights</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">5</span>
                <span className="pt-0.5">Results stored securely in database</span>
              </li>
            </ol>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2">
              {['File Uploaded', 'Processing', 'AI Analysis', 'Detection', 'Completed'].map((step, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    result ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {i + 1}
                  </div>
                  {i < 4 && <div className="w-5 h-px bg-gray-200"></div>}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Processing Results</h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              View Dashboard
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard title="Transactions Processed" value={result.summary?.total_transactions?.toLocaleString()} icon="💳" color="primary" />
            <StatCard title="Accounts Processed" value={result.summary?.total_accounts?.toLocaleString()} icon="👤" color="blue" />
            <StatCard title="Mule Accounts Detected" value={result.summary?.mule_accounts_detected?.toLocaleString()} icon="🕵️" color="red" />
            <StatCard title="Alerts Generated" value={result.summary?.alerts_generated?.toLocaleString()} icon="🔔" color="orange" />
            <StatCard title="Processing Time" value={`${result.processing_time}s`} icon="⏱️" color="green" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
