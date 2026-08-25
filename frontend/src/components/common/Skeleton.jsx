// frontend/src/components/common/Skeleton.jsx
// Reusable skeleton shimmer primitives + page-level skeletons

// ── Base shimmer block ─────────────────────────────────────────
export const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
);

// ── Stat card skeleton (matches StatsCard) ─────────────────────
export const StatCardSkeleton = () => (
  <div className="dash-card p-5 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <Shimmer className="h-3 w-24 rounded-lg" />
      <Shimmer className="w-9 h-9 rounded-xl" />
    </div>
    <Shimmer className="h-8 w-16 rounded-lg mb-2" />
    <Shimmer className="h-3 w-20 rounded-lg" />
  </div>
);

// ── Table row skeleton ─────────────────────────────────────────
export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="border-b border-slate-50">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Shimmer className={`h-4 rounded-lg ${i === 0 ? 'w-32' : i === cols - 1 ? 'w-16' : 'w-24'}`} />
      </td>
    ))}
  </tr>
);

// ── Card list item skeleton (appointments, notifications) ──────
export const CardItemSkeleton = () => (
  <div className="dash-card p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <Shimmer className="w-12 h-12 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Shimmer className="h-4 w-32 rounded-lg" />
          <Shimmer className="h-5 w-16 rounded-full" />
        </div>
        <Shimmer className="h-3 w-48 rounded-lg" />
        <Shimmer className="h-3 w-36 rounded-lg" />
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <Shimmer className="h-7 w-16 rounded-xl" />
        <Shimmer className="h-3 w-20 rounded-lg" />
      </div>
    </div>
  </div>
);

// ── Dashboard page skeleton (4 stat cards + 2 chart areas) ────
export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Shimmer className="h-7 w-56 rounded-xl" />
        <Shimmer className="h-4 w-40 rounded-lg" />
      </div>
      <Shimmer className="h-9 w-32 rounded-xl" />
    </div>
    {/* Stat cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
    {/* Chart rows */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="dash-card p-5 space-y-3">
        <Shimmer className="h-5 w-36 rounded-lg" />
        <Shimmer className="h-48 w-full rounded-2xl" />
      </div>
      <div className="dash-card p-5 space-y-3">
        <Shimmer className="h-5 w-36 rounded-lg" />
        <Shimmer className="h-48 w-full rounded-2xl" />
      </div>
    </div>
    {/* Recent table */}
    <div className="dash-card overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <Shimmer className="h-5 w-40 rounded-lg" />
      </div>
      <div className="divide-y divide-slate-50">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-4">
            <Shimmer className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-4 w-40 rounded-lg" />
              <Shimmer className="h-3 w-56 rounded-lg" />
            </div>
            <Shimmer className="h-6 w-20 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── Table page skeleton (manage pages) ────────────────────────
export const TablePageSkeleton = ({ cols = 5, rows = 6 }) => (
  <div className="space-y-6 animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Shimmer className="h-7 w-48 rounded-xl" />
        <Shimmer className="h-4 w-36 rounded-lg" />
      </div>
      <Shimmer className="h-10 w-32 rounded-xl" />
    </div>
    {/* Filter bar */}
    <div className="dash-card p-4 flex gap-3">
      <Shimmer className="flex-1 h-10 rounded-xl" />
      <Shimmer className="h-10 w-36 rounded-xl" />
      <Shimmer className="h-10 w-28 rounded-xl" />
    </div>
    {/* Table */}
    <div className="dash-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-6 py-3.5">
                  <Shimmer className="h-3 w-20 rounded-lg" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} cols={cols} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ── My Appointments skeleton ──────────────────────────────────
export const AppointmentsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Shimmer className="h-7 w-48 rounded-xl" />
        <Shimmer className="h-4 w-36 rounded-lg" />
      </div>
      <Shimmer className="h-10 w-28 rounded-xl" />
    </div>
    {/* Filter tabs */}
    <div className="flex gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Shimmer key={i} className="h-9 w-24 rounded-xl" />
      ))}
    </div>
    {/* Appointment cards */}
    {Array.from({ length: 3 }).map((_, i) => (
      <CardItemSkeleton key={i} />
    ))}
  </div>
);

// ── Notification skeleton ─────────────────────────────────────
export const NotificationsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="flex items-center justify-between">
      <Shimmer className="h-7 w-40 rounded-xl" />
      <Shimmer className="h-9 w-28 rounded-xl" />
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="dash-card p-4 flex gap-3">
        <Shimmer className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-40 rounded-lg" />
          <Shimmer className="h-3 w-64 rounded-lg" />
          <Shimmer className="h-3 w-24 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

// ── Queue panel skeleton ──────────────────────────────────────
export const QueuePanelSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Shimmer className="h-7 w-40 rounded-xl" />
        <Shimmer className="h-4 w-48 rounded-lg" />
      </div>
      <Shimmer className="h-10 w-24 rounded-xl" />
    </div>
    {/* Queue cards */}
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="dash-card p-4 flex items-center gap-4">
        <Shimmer className="w-14 h-14 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-32 rounded-lg" />
          <Shimmer className="h-3 w-48 rounded-lg" />
        </div>
        <Shimmer className="h-10 w-28 rounded-xl flex-shrink-0" />
      </div>
    ))}
  </div>
);

// ── Profile skeleton ──────────────────────────────────────────
export const ProfileSkeleton = () => (
  <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
    <Shimmer className="h-7 w-32 rounded-xl" />
    <div className="dash-card p-6 space-y-4">
      <Shimmer className="h-5 w-36 rounded-lg" />
      <div className="flex items-center gap-4">
        <Shimmer className="w-16 h-16 rounded-2xl flex-shrink-0" />
        <Shimmer className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Shimmer className="h-3 w-20 rounded-lg" />
            <Shimmer className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <Shimmer className="h-10 w-28 rounded-xl" />
    </div>
  </div>
);

// ── Reports skeleton ──────────────────────────────────────────
export const ReportsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Shimmer className="h-7 w-52 rounded-xl" />
        <Shimmer className="h-4 w-40 rounded-lg" />
      </div>
      <div className="flex gap-2">
        <Shimmer className="h-10 w-24 rounded-xl" />
        <Shimmer className="h-10 w-28 rounded-xl" />
      </div>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
    <div className="dash-card p-4 space-y-3">
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => <Shimmer key={i} className="h-8 w-24 rounded-xl" />)}
      </div>
      <div className="flex gap-3">
        <Shimmer className="flex-1 h-10 rounded-xl" />
        <Shimmer className="h-10 w-36 rounded-xl" />
        <Shimmer className="h-10 w-28 rounded-xl" />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="dash-card p-5 lg:col-span-2 space-y-3">
        <Shimmer className="h-5 w-40 rounded-lg" />
        <Shimmer className="h-56 w-full rounded-2xl" />
      </div>
      <div className="dash-card p-5 space-y-3">
        <Shimmer className="h-5 w-32 rounded-lg" />
        <Shimmer className="h-56 w-full rounded-2xl" />
      </div>
    </div>
  </div>
);

export default Shimmer;
