import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Building2, Database, Activity, Cpu } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area, RadialBarChart, RadialBar, Cell, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-xl text-xs font-semibold"
      style={{ background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
    >
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-bold">
          {entry.name}: {entry.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

function MetricCard({ icon: Icon, label, value, color, gradient, delay }) {
  return (
    <div className={`stat-card reveal ${delay}`}>
      <div className={`absolute inset-0 rounded-[inherit] opacity-60`} style={{ background: gradient }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div className="dot-pulse w-2 h-2 rounded-full bg-emerald-400" />
        </div>
        <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
        <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
      </div>
    </div>
  );
}

const GRADIENT_STOPS = [
  ['#8b5cf6', '#6366f1'],
  ['#10b981', '#059669'],
  ['#f59e0b', '#ef4444'],
];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setAnalytics(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ─── Header ─── */}
      <div
        className="rounded-3xl p-6 md:p-8 reveal"
        style={{
          background: 'rgba(13,17,23,0.8)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
            <BarChart3 className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-white">Dataset Analytics</h2>
            <p className="text-slate-500 text-xs">Publication trends, author contributions & publishing house metrics</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="stat-card reveal">
              <div className="skeleton h-6 rounded w-1/2 mb-2" />
              <div className="skeleton h-10 rounded w-3/4" />
              <div className="skeleton h-3 rounded w-1/3 mt-2" />
            </div>
          ))}
        </div>
      ) : analytics ? (
        <>
          {/* ─── Metric Cards ─── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={Database}
              label="Total Books Indexed"
              value={analytics.total_books?.toLocaleString() || '—'}
              color="text-purple-400"
              gradient="radial-gradient(circle at top left, rgba(139,92,246,0.15), transparent)"
              delay="reveal-delay-1"
            />
            <MetricCard
              icon={Users}
              label="Unique Authors"
              value={analytics.unique_authors?.toLocaleString() || '—'}
              color="text-emerald-400"
              gradient="radial-gradient(circle at top left, rgba(16,185,129,0.15), transparent)"
              delay="reveal-delay-2"
            />
            <MetricCard
              icon={Building2}
              label="Publishing Houses"
              value={analytics.unique_publishers?.toLocaleString() || '—'}
              color="text-amber-400"
              gradient="radial-gradient(circle at top left, rgba(245,158,11,0.15), transparent)"
              delay="reveal-delay-3"
            />
          </div>

          {/* ─── Area Chart: Publication Timeline ─── */}
          {analytics.year_chart && (
            <div
              className="rounded-3xl p-6 reveal"
              style={{ background: 'rgba(13,17,23,0.75)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
            >
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-5 h-5 text-brand-400" />
                <h3 className="font-bold text-white text-[15px]">Publication Timeline</h3>
                <span className="badge badge-purple ml-auto">Historical Distribution</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={analytics.year_chart} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="year" stroke="#475569" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Books Published"
                    stroke="#8b5cf6"
                    fill="url(#areaGradient)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: '#8b5cf6', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ─── Bar Charts ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {analytics.top_authors && (
              <div
                className="rounded-3xl p-6 reveal"
                style={{ background: 'rgba(13,17,23,0.75)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-[15px]">Top 10 Authors</h3>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={analytics.top_authors} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <defs>
                      <linearGradient id="authGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" stroke="#475569" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="author" type="category" stroke="#475569" width={90} tick={{ fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Books" fill="url(#authGrad)" radius={[0, 6, 6, 0]} maxBarSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {analytics.top_publishers && (
              <div
                className="rounded-3xl p-6 reveal"
                style={{ background: 'rgba(13,17,23,0.75)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <Building2 className="w-5 h-5 text-rose-400" />
                  <h3 className="font-bold text-white text-[15px]">Top 10 Publishers</h3>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={analytics.top_publishers} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <defs>
                      <linearGradient id="pubGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f43f5e" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" stroke="#475569" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="publisher" type="category" stroke="#475569" width={90} tick={{ fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Titles" fill="url(#pubGrad)" radius={[0, 6, 6, 0]} maxBarSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="py-16 text-center text-slate-500">
          <Activity className="w-12 h-12 mx-auto opacity-20 mb-3" />
          <p>Failed to load analytics data.</p>
        </div>
      )}
    </div>
  );
}
