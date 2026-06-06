import { motion } from 'framer-motion';

export default function AccountProfile({ account }) {
  if (!account) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">{account.account_id}</h2>
          <p className="text-sm text-gray-500">{account.city}, {account.state}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Risk Score</p>
          <p className={`text-2xl font-bold ${
            account.risk_score > 80 ? 'text-red-600' :
            account.risk_score > 50 ? 'text-amber-600' : 'text-green-600'
          }`}>
            {account.risk_score}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Fraud Probability</p>
          <p className="text-2xl font-bold text-red-600">
            {(account.fraud_probability * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs text-gray-400 mb-2">Risk Level</p>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
          account.risk_level === 'high' ? 'bg-red-100 text-red-700' :
          account.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' :
          'bg-green-100 text-green-700'
        }`}>
          {account.risk_level?.toUpperCase()} RISK
        </span>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Transaction Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Incoming Txns</span>
            <span className="font-medium text-gray-700">{account.incoming_count}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Outgoing Txns</span>
            <span className="font-medium text-gray-700">{account.outgoing_count}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Incoming Amount</span>
            <span className="font-medium text-gray-700">₹{account.incoming_amount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Outgoing Amount</span>
            <span className="font-medium text-gray-700">₹{account.outgoing_amount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Total Counterparties</span>
            <span className="font-medium text-gray-700">{account.linked_count}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Cities Involved</span>
            <span className="font-medium text-gray-700">{account.city_count}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 mt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Prediction Explanation</h3>
        <div className="space-y-2">
          {account.risk_score > 80 && (
            <div className="flex items-start gap-2 text-xs">
              <span className="text-red-500 mt-0.5">●</span>
              <span className="text-gray-600">Extremely high risk score ({account.risk_score}) indicates strong fraud indicators</span>
            </div>
          )}
          {account.linked_count > 10 && (
            <div className="flex items-start gap-2 text-xs">
              <span className="text-orange-500 mt-0.5">●</span>
              <span className="text-gray-600">High connectivity: linked to {account.linked_count} accounts</span>
            </div>
          )}
          {account.city_count > 3 && (
            <div className="flex items-start gap-2 text-xs">
              <span className="text-amber-500 mt-0.5">●</span>
              <span className="text-gray-600">Multi-city activity across {account.city_count} cities</span>
            </div>
          )}
          <div className="flex items-start gap-2 text-xs">
            <span className="text-blue-500 mt-0.5">●</span>
            <span className="text-gray-600">
              ML model confidence: {(account.fraud_probability * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
