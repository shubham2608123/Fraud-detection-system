import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import AccountProfile from '../components/AccountProfile';

export default function MuleAccounts() {
  const { data } = useApp();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const muleAccounts = useMemo(() => {
    if (!data?.predictions) return [];
    return data.predictions.filter(p => p.prediction === 1);
  }, [data]);

  const handleAccountClick = useCallback((account) => {
    setSelectedAccount(account);
    setShowProfile(true);
  }, []);

  if (!data || muleAccounts.length === 0) {
    return (
      <EmptyState
        title="No Mule Accounts Detected"
        message="Upload a transaction file to detect mule accounts. The AI model will analyze patterns and flag suspicious accounts."
        actionText="Upload Transactions"
        actionPath="/upload"
      />
    );
  }

  if (showProfile && selectedAccount) {
    return (
      <div>
        <button
          onClick={() => setShowProfile(false)}
          className="mb-4 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Mule Accounts
        </button>
        <AccountProfile account={selectedAccount} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mule Accounts</h1>
        <p className="text-sm text-gray-400 mt-1">{muleAccounts.length} suspicious accounts detected by AI</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Account ID</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Risk Score</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Fraud Probability</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">City</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Incoming Txns</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Outgoing Txns</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Linked Accounts</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {muleAccounts.map((account, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-medium text-gray-800">{account.account_id}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      account.risk_score > 80 ? 'bg-red-100 text-red-700' :
                      account.risk_score > 50 ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {account.risk_score}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">{(account.fraud_probability * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4 text-xs text-gray-600">{account.city}</td>
                  <td className="px-6 py-4 text-xs text-gray-600">{account.incoming_count}</td>
                  <td className="px-6 py-4 text-xs text-gray-600">{account.outgoing_count}</td>
                  <td className="px-6 py-4 text-xs text-gray-600">{account.linked_count}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      Suspicious
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleAccountClick(account)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1"
                    >
                      View Profile
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
