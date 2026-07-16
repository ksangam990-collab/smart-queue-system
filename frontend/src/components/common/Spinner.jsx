// frontend/src/components/common/Spinner.jsx

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-4',
};

const Spinner = ({ size = 'md', className = '' }) => (
  <div className={`
    ${sizes[size]} rounded-full
    border-primary-200 border-t-primary-500
    animate-spin ${className}
  `} />
);

export default Spinner;