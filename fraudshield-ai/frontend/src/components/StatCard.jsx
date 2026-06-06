import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon, color = 'primary', delay = 0, iconBg = true }) {
  const colorMap = {
    primary: 'bg-white',
    red: 'bg-gradient-to-br from-red-50 to-red-100/50',
    green: 'bg-gradient-to-br from-green-50 to-green-100/50',
    yellow: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100/50',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100/50',
  };

  const iconColorMap = {
    primary: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  const iconCircleMap = {
    primary: 'bg-blue-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    yellow: 'bg-amber-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`rounded-2xl p-5 shadow-sm border border-gray-100 ${colorMap[color]} hover:shadow-md transition-shadow duration-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {value !== null && value !== undefined ? value : '--'}
          </p>
        </div>
        {iconBg && (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconCircleMap[color]} shadow-lg`}>
            <span className="text-white text-lg">{icon}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
