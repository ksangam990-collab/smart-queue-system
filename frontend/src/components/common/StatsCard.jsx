import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const colorMap = {
  primary: 'bg-primary-50 text-primary-600',
  green:   'bg-accent-500/10 text-accent-600',
  orange:  'bg-orange-50 text-orange-500',
  red:     'bg-danger-500/10 text-danger-500',
  purple:  'bg-purple-50 text-purple-500',
  blue:    'bg-blue-50 text-blue-500',
};

const StatsCard = ({ title, value, icon: Icon, color = 'primary', change, changeType = 'increase', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -3 }}
    className="dash-card p-5"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${colorMap[color]}`}>
        <Icon size={20} strokeWidth={2.2} />
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          changeType === 'increase' ? 'bg-accent-500/10 text-accent-600' : 'bg-danger-500/10 text-danger-500'
        }`}>
          {changeType === 'increase' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {change}%
        </div>
      )}
    </div>
    <p className="text-2xl font-bold text-slate-900 mb-0.5 tracking-tight">{value}</p>
    <p className="text-sm text-slate-500 font-medium">{title}</p>
  </motion.div>
);

export default StatsCard;