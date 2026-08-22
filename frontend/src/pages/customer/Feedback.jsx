import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import MagneticButton from '../../components/home/MagneticButton';

const Feedback = () => {
  const [pending, setPending] = useState([]);
  const [given, setGiven] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, g] = await Promise.all([
        api.get('/feedback/pending'),
        api.get('/feedback/my'),
      ]);
      setPending(p.data.data);
      setGiven(g.data.data);
    } catch {
      toast.error('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/feedback', {
        appointmentId: selected._id,
        rating,
        comment,
      });
      toast.success('Thank you for your feedback!');
      setSelected(null);
      setRating(0);
      setComment('');
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Feedback</h2>
        <p className="text-slate-500 text-sm mt-1">Rate your completed appointments</p>
      </div>

      {selected ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="dash-card p-6"
        >
          <h3 className="font-semibold text-slate-800 mb-1">{selected.service?.name}</h3>
          <p className="text-sm text-slate-500 mb-6">{selected.department?.name}</p>

          <div className="flex gap-2 justify-center mb-6">
            {[1,2,3,4,5].map((star) => (
              <motion.button
                key={star}
                onClick={() => setRating(star)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <Star
                  size={36}
                  className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                />
              </motion.button>
            ))}
          </div>

          <textarea
            className="form-input resize-none mb-4"
            rows={4}
            placeholder="Share your experience (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="flex gap-3">
            <button onClick={() => { setSelected(null); setRating(0); setComment(''); }} className="btn-secondary flex-1">
              Cancel
            </button>
            <MagneticButton className="flex-1" strength={0.15}>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </MagneticButton>
          </div>
        </motion.div>
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-700 mb-3 text-sm">Pending Feedback</h3>
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
                className="space-y-3"
              >
                {pending.map((apt) => (
                  <motion.div
                    key={apt._id}
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="dash-card p-4 flex items-center justify-between hover:shadow-lg transition-shadow duration-300"
                  >
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{apt.service?.name}</p>
                      <p className="text-xs text-slate-500">{apt.department?.name}</p>
                    </div>
                    <MagneticButton strength={0.15}>
                      <button onClick={() => setSelected(apt)} className="btn-primary text-sm py-2">
                        Rate Now
                      </button>
                    </MagneticButton>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">Your Reviews</h3>
            {given.length === 0 ? (
              <div className="dash-card p-10 text-center text-slate-400 text-sm">
                <MessageSquare size={32} className="mx-auto mb-3 text-slate-300" />
                No reviews submitted yet
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                className="space-y-3"
              >
                {given.map((f) => (
                  <motion.div
                    key={f._id}
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                    className="dash-card p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-slate-800 text-sm">{f.service?.name}</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={14} className={s <= f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                        ))}
                      </div>
                    </div>
                    {f.comment && <p className="text-sm text-slate-500">{f.comment}</p>}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Feedback;
