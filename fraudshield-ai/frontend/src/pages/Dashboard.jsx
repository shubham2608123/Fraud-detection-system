import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'];

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

function DashboardContent({ data }) {
  const s = data.summary;

  const riskDistData = [
    { name: 'High Risk', value: s.high_risk_count, color: '#ef4444' },
    { name: 'Medium Risk', value: s.medium_risk_count, color: '#f59e0b' },
    { name: 'Low Risk', value: s.low_risk_count, color: '#22c55e' },
  ];

  const cityData = {};
  (data.predictions || []).forEach(p => {
    if (p.city) {
      cityData[p.city] = (cityData[p.city] || 0) + 1;
    }
  });
  const topCities = Object.entries(cityData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([city, count]) => ({ city, mules: count }));

  const connectivityData = {};
  (data.predictions || []).forEach(p => {
    if (p.prediction === 1) {
      connectivityData[p.account_id] = p.linked_count;
    }
  });
  const topConnected = Object.entries(connectivityData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, count]) => ({ account: id.slice(-6), connections: count }));

  const timelineData = (() => {
    const riskBuckets = {};
    (data.predictions || []).forEach(p => {
      const bucket = Math.floor(p.risk_score / 10) * 10;
      const key = `${bucket}-${bucket + 10}`;
      riskBuckets[key] = (riskBuckets[key] || 0) + 1;
    });
    return Object.entries(riskBuckets)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([range, count]) => ({ range, count }));
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time fraud monitoring overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Authorized Access
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Transactions" value={s.total_transactions?.toLocaleString()} icon="💳" color="primary" delay={0} />
        <StatCard title="Total Accounts" value={s.total_accounts?.toLocaleString()} icon="👤" color="blue" delay={0.1} />
        <StatCard title="Mule Accounts Detected" value={s.mule_accounts_detected?.toLocaleString()} icon="🕵️" color="red" delay={0.2} />
        <StatCard title="Alerts Generated" value={s.alerts_generated?.toLocaleString()} icon="🔔" color="orange" delay={0.3} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="High Risk" value={s.high_risk_count?.toLocaleString()} icon="🔴" color="red" delay={0.4} />
        <StatCard title="Medium Risk" value={s.medium_risk_count?.toLocaleString()} icon="🟡" color="yellow" delay={0.5} />
        <StatCard title="Low Risk" value={s.low_risk_count?.toLocaleString()} icon="🟢" color="green" delay={0.6} />
        <StatCard title="Avg Risk Score" value={s.average_risk_score} icon="📈" color="purple" delay={0.7} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={riskDistData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {riskDistData.map((entry, i) => (
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
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Suspicious Cities</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topCities} barSize={32}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="city" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="mules" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Risk Score Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={timelineData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6"/>
                  <stop offset="100%" stopColor="#3b82f6"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Most Connected Accounts</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topConnected} layout="vertical" barSize={20}>
              <defs>
                <linearGradient id="horizontalBarGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06b6d4"/>
                  <stop offset="100%" stopColor="#3b82f6"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="account" tick={{ fontSize: 10, fill: '#64748b' }} width={60} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="connections" fill="url(#horizontalBarGradient)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, loading } = useApp();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No Transaction Data"
        message="No transaction data uploaded yet. Upload a transaction file to start analyzing fraud patterns and detecting mule accounts."
        actionText="Upload Transactions"
        actionPath="/upload"
      />
    );
  }

  return <DashboardContent data={data} />;
}
