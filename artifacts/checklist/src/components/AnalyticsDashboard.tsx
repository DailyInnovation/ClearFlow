import { useEffect } from 'react';
import { ArrowLeft, TrendingUp, Target, BarChart2, RefreshCw, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { useAnalytics } from '../hooks/useAnalytics';
import { usePremiumStore } from '../store/usePremiumStore';

interface AnalyticsDashboardProps {
  onClose: () => void;
}

const GREEN = '#22C55E';
const SLATE = '#334155';

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest">
        {icon}
        {label}
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-muted-foreground font-medium mb-0.5">{label}</p>
      <p className="text-primary font-bold">{payload[0].value}% complete</p>
    </div>
  );
}

export function AnalyticsDashboard({ onClose }: AnalyticsDashboardProps) {
  const { deactivatePremium } = usePremiumStore();
  const {
    consistencyScore,
    totalSessions,
    dailyCompletions,
    topMissedItems,
    kitStats,
    isLoading,
    refresh,
  } = useAnalytics();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const topKit =
    kitStats.length > 0
      ? kitStats.reduce((a, b) => (a.totalSessions > b.totalSessions ? a : b))
      : null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-0 bg-background flex flex-col z-20 overflow-hidden"
    >
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 text-foreground hover:bg-accent rounded-md transition-colors"
            data-testid="analytics-back-button"
            aria-label="Close insights"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-bold text-foreground text-lg leading-none">Insights</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Completion analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
            data-testid="analytics-refresh-button"
            aria-label="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={deactivatePremium}
            className="flex items-center gap-1.5 text-xs text-primary font-bold px-3 py-1.5 border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
            data-testid="downgrade-button"
          >
            <Crown className="w-3.5 h-3.5" />
            Pro
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : totalSessions === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-4">
            <BarChart2 className="w-12 h-12 text-muted-foreground opacity-40" />
            <div>
              <p className="font-bold text-foreground text-lg mb-2">No data yet</p>
              <p className="text-muted-foreground text-sm">
                Complete a kit and tap Reset to log your first session. Insights appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-5 max-w-2xl mx-auto w-full pb-10">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard
                icon={<Target className="w-3.5 h-3.5" />}
                label="Consistency"
                value={consistencyScore !== null ? `${consistencyScore}%` : '—'}
                sub="avg completion at reset"
              />
              <StatCard
                icon={<TrendingUp className="w-3.5 h-3.5" />}
                label="Sessions"
                value={String(totalSessions)}
                sub="total kit resets"
              />
              {topKit && (
                <div className="col-span-2 sm:col-span-1">
                  <StatCard
                    icon={<BarChart2 className="w-3.5 h-3.5" />}
                    label="Top Kit"
                    value={topKit.kitName.length > 12 ? topKit.kitName.slice(0, 12) + '…' : topKit.kitName}
                    sub={`${topKit.avgCompletion}% avg · ${topKit.totalSessions} sessions`}
                  />
                </div>
              )}
            </div>

            {/* Completion Rate Chart */}
            {dailyCompletions.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Completion Rate Over Time
                </h2>
                <div className="bg-card border border-border rounded-xl p-4">
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={dailyCompletions} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={GREEN} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="rate"
                        stroke={GREEN}
                        strokeWidth={2}
                        fill="url(#greenGradient)"
                        dot={{ fill: GREEN, r: 3, strokeWidth: 0 }}
                        activeDot={{ fill: GREEN, r: 5, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* Top Missed Items */}
            {topMissedItems.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Top Missed Items
                </h2>
                <div className="bg-card border border-border rounded-xl p-4">
                  <ResponsiveContainer width="100%" height={Math.max(topMissedItems.length * 40, 80)}>
                    <BarChart
                      layout="vertical"
                      data={topMissedItems}
                      margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                    >
                      <XAxis
                        type="number"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="text"
                        width={110}
                        tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: string) => (v.length > 14 ? v.slice(0, 14) + '…' : v)}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value} time${value !== 1 ? 's' : ''}`, 'Missed']}
                        contentStyle={{
                          backgroundColor: '#1e2530',
                          border: '1px solid #334155',
                          borderRadius: 8,
                          color: '#e2e8f0',
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      />
                      <Bar dataKey="missCount" radius={[0, 4, 4, 0]} maxBarSize={22}>
                        {topMissedItems.map((_, i) => (
                          <Cell
                            key={i}
                            fill={i === 0 ? GREEN : SLATE}
                            opacity={1 - i * 0.12}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* Per-Kit Breakdown */}
            {kitStats.length > 1 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Kit Breakdown
                </h2>
                <div className="flex flex-col gap-2">
                  {kitStats
                    .sort((a, b) => b.avgCompletion - a.avgCompletion)
                    .map((kit) => (
                      <div
                        key={kit.kitId}
                        className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between"
                        data-testid={`kit-stat-${kit.kitId}`}
                      >
                        <div>
                          <p className="font-bold text-foreground text-sm">{kit.kitName}</p>
                          <p className="text-xs text-muted-foreground">
                            {kit.totalSessions} session{kit.totalSessions !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-28 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${kit.avgCompletion}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-primary w-10 text-right">
                            {kit.avgCompletion}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
