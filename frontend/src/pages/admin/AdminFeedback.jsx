// frontend/src/pages/admin/AdminFeedback.jsx

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MessageSquare, TrendingUp, Filter,
  ChevronDown, Search, ThumbsUp, ThumbsDown,
  Building2, Frown, Meh, Smile,
} from 'lucide-react';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

// ── Star row ──────────────────────────────────────────────────
const Stars = ({ rating, size = 14 }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map((s) => (
      <Star
        key={s}
        size={size}
        className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
      />
    ))}
  </div>
);

// ── Sentiment icon ────────────────────────────────────────────
const Sentiment = ({ rating }) => {
  if (rating >= 4) return <Smile  size={16} className="text-emerald-500" />;
  if (rating === 3) return <Meh   size={16} className="text-amber-400" />;
  return               <Frown size={16} className="text-rose-400" />;
};

// ── Big stat card ─────────────────────────────────────────────
const StatBubble = ({ label, value, sub, color = 'primary' }) => {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    accent:  'from-accent-500  to-accent-600',
    amber:   'from-amber-400   to-amber-500',
    rose:    'from-rose-400    to-rose-500',
  };
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${colors[color]} p-5 text-white`}>
      <p className="text-white/70 text-xs font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-white/60 text-xs mt-1">{sub}</p>}
    </div>
  );
};

const AdminFeedback = () => {
  const [feedback, setFeedback]       = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [deptFilter, setDeptFilter]   = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy]           = useState('newest'); // newest | oldest | highest | lowest
  const [expanded, setExpanded]       = useState(null);

  // ── Fetch ─────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fbRes, deptRes] = await Promise.all([
        api.get('/feedback'),
        api.get('/departments'),
      ]);
      setFeedback(fbRes.data.data);
      setDepartments(deptRes.data.data);
    } catch {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived stats ─────────────────────────────────────────
  const total    = feedback.length;
  const avgRating = total
    ? (feedback.reduce((s, f) => s + f.rating, 0) / total).toFixed(1)
    : '—';
  const positive = feedback.filter((f) => f.rating >= 4).length;
  const negative = feedback.filter((f) => f.rating <= 2).length;

  // Ratings breakdown 1–5
  const breakdown = [5,4,3,2,1].map((star) => ({
    star,
    count: feedback.filter((f) => f.rating === star).length,
    pct: total ? Math.round((feedback.filter((f) => f.rating === star).length / total) * 100) : 0,
  }));

  // Per-department avg
  const deptStats = departments.map((d) => {
    const dFeedback = feedback.filter((f) => f.department?._id === d._id);
    const avg = dFeedback.length
      ? (dFeedback.reduce((s, f) => s + f.rating, 0) / dFeedback.length).toFixed(1)
      : null;
    return { ...d, avg, count: dFeedback.length };
  }).filter((d) => d.count > 0).sort((a, b) => b.avg - a.avg);

  // ── Filter + sort ─────────────────────────────────────────
  let filtered = [...feedback];

  if (deptFilter)   filtered = filtered.filter((f) => f.department?._id === deptFilter);
  if (ratingFilter) filtered = filtered.filter((f) => f.rating === Number(ratingFilter));
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (f) =>
        f.user?.name?.toLowerCase().includes(q) ||
        f.comment?.toLowerCase().includes(q) ||
        f.service?.name?.toLowerCase().includes(q) ||
        f.department?.name?.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => {
    if (sortBy === 'newest')  return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest')  return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest')  return a.rating - b.rating;
    return 0;
  });

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Feedback & Ratings</h2>
        <p className="text-slate-500 text-sm mt-1">Patient reviews across all departments</p>
      </div>

      {/* ── Stat bubbles ─────────────────────────────────────  */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBubble label="Total Reviews"   value={total}      sub="all time"                color="primary" />
        <StatBubble label="Avg Rating"      value={`${avgRating} ★`} sub="out of 5.0"       color="amber"   />
        <StatBubble label="Positive (4–5★)" value={positive}   sub={`${total ? Math.round(positive/total*100) : 0}% of reviews`} color="accent" />
        <StatBubble label="Negative (1–2★)" value={negative}   sub={`${total ? Math.round(negative/total*100) : 0}% of reviews`} color="rose"   />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Rating breakdown ─────────────────────────────── */}
        <div className="dash-card p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-500" /> Rating Breakdown
          </h3>
          <div className="space-y-3">
            {breakdown.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3">
                <button
                  onClick={() => setRatingFilter(ratingFilter === String(star) ? '' : String(star))}
                  className={`flex items-center gap-1 text-xs font-medium w-10 flex-shrink-0 ${
                    ratingFilter === String(star) ? 'text-primary-600' : 'text-slate-500'
                  }`}
                >
                  {star} <Star size={11} className="fill-amber-400 text-amber-400" />
                </button>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      star >= 4 ? 'bg-emerald-400' : star === 3 ? 'bg-amber-400' : 'bg-rose-400'
                    }`}
                  />
                </div>
                <span className="text-xs text-slate-400 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Per-department avg ────────────────────────────── */}
        <div className="dash-card p-5 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-primary-500" /> By Department
          </h3>
          {deptStats.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No department data yet</p>
          ) : (
            <div className="space-y-3">
              {deptStats.map((d) => (
                <div key={d._id} className="flex items-center gap-3">
                  <span className="text-xl w-7 flex-shrink-0">{d.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-700 truncate">{d.name}</p>
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{d.count} reviews</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(d.avg / 5) * 100}%` }}
                          transition={{ duration: 0.7, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            d.avg >= 4 ? 'bg-emerald-400' : d.avg >= 3 ? 'bg-amber-400' : 'bg-rose-400'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 w-8 flex-shrink-0">
                        {d.avg}★
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────── */}
      <div className="dash-card p-4 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3">
        {/* Search */}
        <div className="relative sm:col-span-2 lg:flex-1 lg:min-w-52">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, service, comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10 w-full"
          />
        </div>

        {/* Department */}
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="form-input w-full lg:w-auto"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>{d.icon} {d.name}</option>
          ))}
        </select>

        {/* Rating */}
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="form-input w-full lg:w-auto"
        >
          <option value="">All Ratings</option>
          {[5,4,3,2,1].map((r) => (
            <option key={r} value={r}>{'★'.repeat(r)} ({r} star{r > 1 ? 's' : ''})</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="form-input w-full lg:w-auto"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>

        {/* Clear */}
        {(search || deptFilter || ratingFilter || sortBy !== 'newest') && (
          <button
            onClick={() => { setSearch(''); setDeptFilter(''); setRatingFilter(''); setSortBy('newest'); }}
            className="btn-secondary text-sm w-full lg:w-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ── Results count ─────────────────────────────────────── */}
      <p className="text-xs text-slate-400 -mt-2">
        Showing {filtered.length} of {total} review{total !== 1 ? 's' : ''}
        {ratingFilter && ` · ${ratingFilter}★ only`}
        {deptFilter && ` · ${departments.find(d => d._id === deptFilter)?.name}`}
      </p>

      {/* ── Review cards ─────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="dash-card p-16 text-center">
          <MessageSquare size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No reviews found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          className="space-y-3"
        >
          {filtered.map((f) => (
            <motion.div
              key={f._id}
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              className="dash-card overflow-hidden"
            >
              {/* Card header */}
              <button
                onClick={() => setExpanded(expanded === f._id ? null : f._id)}
                className="w-full p-4 flex items-center gap-4 text-left hover:bg-slate-50 transition-colors"
              >
                {/* Avatar */}
                <img
                  src={f.user?.avatar?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${f.user?.name}`}
                  alt={f.user?.name}
                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                />

                {/* Name + service */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <p className="font-semibold text-slate-800 text-sm truncate">{f.user?.name}</p>
                    <Sentiment rating={f.rating} />
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {f.service?.name} · {f.department?.name}
                  </p>
                </div>

                {/* Rating + date */}
                <div className="flex-shrink-0 text-right">
                  <Stars rating={f.rating} />
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(f.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                    expanded === f._id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Expanded comment */}
              <AnimatePresence>
                {expanded === f._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0 border-t border-slate-50">
                      {f.comment ? (
                        <p className="text-sm text-slate-600 leading-relaxed pt-3">
                          "{f.comment}"
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400 italic pt-3">No written comment.</p>
                      )}
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                          f.rating >= 4 ? 'bg-emerald-50 text-emerald-600' :
                          f.rating === 3 ? 'bg-amber-50 text-amber-600' :
                          'bg-rose-50 text-rose-500'
                        }`}>
                          {f.rating >= 4 ? '😊 Positive' : f.rating === 3 ? '😐 Neutral' : '😞 Negative'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {f.isPublic ? '🌐 Public review' : '🔒 Private'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default AdminFeedback;
