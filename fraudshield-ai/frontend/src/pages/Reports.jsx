import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import { generatePDFReport, generateExcelReport } from '../utils/exportUtils';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100">
        <p className="text-sm font-semibold text-gray-800">{label || payload[0].name}</p>
        <p className="text-sm text-gray-600 mt-1">
          {payload[0].name || 'Value'}: <span className="font-bold text-gray-800">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const { data } = useApp();
  const [exporting, setExporting] = useState(null);

  const handleExportPDF = () => {
    setExporting('pdf');
    try {
      generatePDFReport(data);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to generate PDF report');
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = () => {
    setExporting('excel');
    try {
      generateExcelReport(data);
    } catch (err) {
      console.error('Excel export error:', err);
      alert('Failed to generate Excel report');
    } finally {
      setExporting(null);
    }
  };

  const reportData = useMemo(() => {
    if (!data) return null;
    const preds = data.predictions || [];

    const riskDist = [
      { name: 'High Risk', value: data.summary?.high_risk_count || 0, color: '#ef4444' },
      { name: 'Medium Risk', value: data.summary?.medium_risk_count || 0, color: '#f59e0b' },
      { name: 'Low Risk', value: data.summary?.low_risk_count || 0, color: '#22c55e' },
    ];

    const cityData = {};
    preds.forEach(p => {
      if (p.city) {
        cityData[p.city] = (cityData[p.city] || 0) + 1;
      }
    });
    const topCities = Object.entries(cityData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([city, count]) => ({ city, count }));

    const muleAccounts = preds.filter(p => p.prediction === 1)
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 10);

    const riskFactors = [
      { factor: 'Risk Score', value: 85 },
      { factor: 'Connections', value: 72 },
      { factor: 'City Spread', value: 65 },
      { factor: 'Velocity', value: 58 },
      { factor: 'Amount', value: 45 },
    ];

    const alertStats = {
      total: data.alerts?.length || 0,
      critical: data.alerts?.filter(a => a.severity === 'critical').length || 0,
      high: data.alerts?.filter(a => a.severity === 'high').length || 0,
      medium: data.alerts?.filter(a => a.severity === 'medium').length || 0,
    };

    return { riskDist, topCities, muleAccounts, riskFactors, alertStats };
  }, [data]);

  if (!data || !reportData) {
    return (
      <EmptyState
        title="No Report Data"
        message="Upload a transaction file to generate comprehensive fraud analysis reports."
        actionText="Upload Transactions"
        actionPath="/upload"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-sm text-gray-400 mt-1">Comprehensive fraud analysis report for investigation</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            disabled={exporting === 'pdf'}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {exporting === 'pdf' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            {exporting === 'pdf' ? 'Generating...' : 'Export PDF'}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting === 'excel'}
            className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-green-500/30"
          >
            {exporting === 'excel' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            {exporting === 'excel' ? 'Generating...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* Report Contents Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-100 rounded-2xl p-5"
      >
        <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Report Contents
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-blue-700">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            Executive Summary
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            All Mule Accounts (Full Details)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            Complete Alerts Log
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            Geographic Analysis
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            Transaction Routes
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            All Raw Transaction Data
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            Investigation Checklist
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            Law Enforcement Recommendations
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Risk Score Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={reportData.riskDist}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {reportData.riskDist.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Cities Involved</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={reportData.topCities} barSize={32}>
              <defs>
                <linearGradient id="reportBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="city" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="url(#reportBarGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Risk Factor Analysis</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={reportData.riskFactors}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11, fill: '#64748b' }} />
              <PolarRadiusAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Radar name="Risk" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Alert Statistics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-500">Total Alerts</span>
              <span className="text-2xl font-bold text-gray-800">{reportData.alertStats.total}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
              <span className="text-sm text-gray-500">Critical Alerts</span>
              <span className="text-2xl font-bold text-red-600">{reportData.alertStats.critical}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
              <span className="text-sm text-gray-500">High Alerts</span>
              <span className="text-2xl font-bold text-orange-600">{reportData.alertStats.high}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
              <span className="text-sm text-gray-500">Medium Alerts</span>
              <span className="text-2xl font-bold text-amber-600">{reportData.alertStats.medium}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Top Mule Accounts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">#</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Account ID</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Risk Score</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Fraud Probability</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">City</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Connections</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Cities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reportData.muleAccounts.map((acc, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-xs text-gray-500 font-medium">{i + 1}</td>
                  <td className="px-6 py-4 font-mono text-xs font-medium text-gray-800">{acc.account_id}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">{acc.risk_score}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">{(acc.fraud_probability * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4 text-xs text-gray-600">{acc.city}</td>
                  <td className="px-6 py-4 text-xs text-gray-600">{acc.linked_count}</td>
                  <td className="px-6 py-4 text-xs text-gray-600">{acc.city_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
