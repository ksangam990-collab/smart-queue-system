import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-8xl font-bold text-primary-400 mb-4">404</p>
        <h1 className="text-2xl font-semibold text-slate-700 mb-2">Page not found</h1>
        <p className="text-slate-500 mb-8">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate(-1)} className="btn-primary">Go back</button>
      </motion.div>
    </div>
  );
};

export default NotFound;