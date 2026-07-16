// frontend/src/components/common/Badge.jsx

const variants = {
  success:   'bg-green-100 text-green-700',
  danger:    'bg-red-100 text-red-700',
  warning:   'bg-yellow-100 text-yellow-700',
  info:      'bg-blue-100 text-blue-700',
  purple:    'bg-purple-100 text-purple-700',
  default:   'bg-slate-100 text-slate-700',
};

const Badge = ({ children, variant = 'default', className = '' }) => (
  <span className={`
    inline-flex items-center px-2.5 py-0.5 rounded-full
    text-xs font-medium ${variants[variant]} ${className}
  `}>
    {children}
  </span>
);

export default Badge;