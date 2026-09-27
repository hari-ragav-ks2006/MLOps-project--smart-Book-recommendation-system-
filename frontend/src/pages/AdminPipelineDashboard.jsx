import React, { useState, useEffect } from 'react';
import {
  Activity, CheckCircle2, XCircle, Clock, Zap,
  RefreshCw, ChevronDown, ChevronUp, ShieldCheck,
  AlertCircle, FileText, BarChart3, List
} from 'lucide-react';

// ── Step Status Icon ──────────────────────────
function StepIcon({ status }) {
  if (status === 'PASSED' || status === 'DONE' || status === 'PROMOTED')
    return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (status === 'FAILED')
    return <XCircle className="w-4 h-4 text-red-600" />;
  if (status === 'RUNNING')
    return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
  return <Clock className="w-4 h-4 text-gray-400" />;
}

const STEP_LABELS = {
  validation: 'Data Validation',
  dataset_versioning: 'DVC Versioning',
  tfidf_rebuild: 'TF-IDF Rebuild',
  evaluation: 'Model Evaluation',
  mlflow_logging: 'MLflow Logging',
  artifact_validation: 'Artifact Validation',
  deployment: 'Promote to Production',
};

// ── Pipeline Run Card ─────────────────────────
function PipelineRunCard({ run }) {
  const [expanded, setExpanded] = useState(false);
  const steps = run.steps || {};
  const isSuccess = run.success;
  const stepList = Object.keys(STEP_LABELS);

  const overallStatus = run.success ? 'SUCCESS' :
    run.error ? 'FAILED' : 'IN_PROGRESS';

  const statusColor = {
    SUCCESS: 'bg-[#D2F5E3] border-[#141416]',
    FAILED: 'bg-[#FFD6CE] border-[#141416]',
    IN_PROGRESS: 'bg-[#E3D9FF] border-[#141416]',
  }[overallStatus] || 'bg-[#F4EFE6] border-[#141416]';

  const formatTime = (ts) => {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString('en-IN', {
        dateStyle: 'short', timeStyle: 'medium'
      });
    } catch { return ts; }
  };

  return (
    <div className={`rounded-2xl border-2 shadow-[4px_4px_0px_#141416] overflow-hidden ${statusColor}`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full px-5 py-4 flex items-center gap-3 cursor-pointer hover:bg-white/20 transition-colors"
      >
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
          overallStatus === 'SUCCESS' ? 'bg-emerald-500' :
          overallStatus === 'FAILED' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'
        }`} />
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-editorial font-extrabold text-[#141416] truncate">
            {run.run_name || run.run_id}
          </p>
          <p className="text-[10px] text-[#5E5E68] mt-0.5">
            {run.trigger_reason?.replace(/_/g, ' ')} · {formatTime(run.started_at)}
            {run.total_duration_sec && ` · ${run.total_duration_sec}s`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${
            overallStatus === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
            overallStatus === 'FAILED' ? 'bg-red-100 text-red-800 border-red-300' :
            'bg-blue-100 text-blue-800 border-blue-300'
          }`}>{overallStatus.replace('_', ' ')}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-[#141416]" /> : <ChevronDown className="w-4 h-4 text-[#141416]" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-[#141416]/20 pt-4 bg-white/40 space-y-3">
          {/* Step pipeline */}
          <div className="space-y-2">
            {stepList.map((key, i) => {
              const step = steps[key] || {};
              const status = step.status || 'PENDING';
              return (
                <div key={key} className="flex items-center gap-3">
                  {/* Connector line */}
                  <div className="flex flex-col items-center gap-0.5">
                    <StepIcon status={status} />
                    {i < stepList.length - 1 && (
                      <div className={`w-0.5 h-4 ${
                        status === 'PASSED' || status === 'DONE' || status === 'PROMOTED'
                          ? 'bg-emerald-400' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-bold ${status === 'FAILED' ? 'text-red-700' : 'text-[#141416]'}`}>
                        {STEP_LABELS[key] || key}
                      </p>
                      {step.duration_ms && (
                        <span className="text-[9px] text-[#5E5E68] font-mono">{step.duration_ms}ms</span>
                      )}
                    </div>
                    {/* Step detail */}
                    {step.error && (
                      <p className="text-[10px] text-red-600 mt-0.5">{step.error}</p>
                    )}
                    {step.rows && (
                      <p className="text-[10px] text-[#5E5E68] mt-0.5">{step.rows.toLocaleString()} rows</p>
                    )}
                    {step.precision_at_5 && (
                      <p className="text-[10px] text-[#5E5E68] mt-0.5">
                        Precision@5: {step.precision_at_5} · Recall@5: {step.recall_at_5}
                      </p>
                    )}
                    {step.run_id && (
                      <p className="text-[10px] font-mono text-purple-700 mt-0.5">MLflow: {step.run_id}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {run.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 font-medium">
              <AlertCircle className="inline w-3 h-3 mr-1" />{run.error}
            </div>
          )}
          {run.promoted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs text-emerald-700 font-black flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> New model promoted to production
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Audit Log Table ───────────────────────────
function AuditLog({ log }) {
  if (!log || log.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-[#5E5E68]">
        No audit events recorded yet.
      </div>
    );
  }

  const formatTime = (ts) => {
    try { return new Date(ts).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }); }
    catch { return ts; }
  };

  const eventColor = (evt) => {
    if (evt?.includes('COMPLETE') || evt?.includes('ADDED') || evt?.includes('SUCCESS')) return 'bg-emerald-100 text-emerald-800';
    if (evt?.includes('FAILED') || evt?.includes('ERROR')) return 'bg-red-100 text-red-800';
    if (evt?.includes('UPDATED') || evt?.includes('BULK')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="divide-y divide-[#141416]/10">
      {log.map((entry, i) => (
        <div key={i} className="flex items-start gap-3 py-3 px-2 hover:bg-[#F4EFE6] rounded-xl transition-colors">
          <div className="flex-shrink-0 mt-0.5">
            {entry.status === 'SUCCESS'
              ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              : entry.status === 'FAILED'
              ? <XCircle className="w-4 h-4 text-red-500" />
              : <Activity className="w-4 h-4 text-blue-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${eventColor(entry.event_type)}`}>
                {entry.event_type?.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] text-[#5E5E68]">{formatTime(entry.timestamp)}</span>
            </div>
            {entry.book_title && (
              <p className="text-xs font-bold text-[#141416] mt-0.5 truncate">{entry.book_title}</p>
            )}
            {entry.details && (
              <p className="text-[10px] text-[#5E5E68] mt-0.5 truncate">{entry.details}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────
export default function AdminPipelineDashboard() {
  const [tab, setTab] = useState('pipeline');
  const [runs, setRuns] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pipeline/status');
      const data = await res.json();
      setRuns(data.runs || []);
    } catch { setRuns([]); }
    finally { setLoading(false); }
  };

  const fetchAudit = async () => {
    try {
      const res = await fetch('/api/admin/audit-log?limit=50');
      const data = await res.json();
      setAuditLog(data.audit_log || []);
    } catch { setAuditLog([]); }
  };

  useEffect(() => {
    fetchPipeline();
    fetchAudit();
    const id = setInterval(() => { fetchPipeline(); fetchAudit(); }, 10000);
    return () => clearInterval(id);
  }, []);

  const triggerPipeline = async () => {
    setTriggering(true);
    try {
      await fetch('/api/admin/pipeline/trigger', { method: 'POST' });
      setTimeout(fetchPipeline, 1500);
    } catch { }
    finally { setTriggering(false); }
  };

  const tabs = [
    { id: 'pipeline', label: 'Pipeline Runs', icon: Zap },
    { id: 'audit', label: 'Audit Log', icon: List },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="rounded-3xl bg-[#E3D9FF] border-2 border-[#141416] p-6 sm:p-8 shadow-[6px_6px_0px_#141416] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #141416 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#141416] text-[10px] font-black uppercase mb-3">
              <Activity className="w-3 h-3" /> Admin · MLOps
            </div>
            <h1 className="text-3xl sm:text-4xl font-editorial font-extrabold text-[#141416] tracking-tight">
              Pipeline Dashboard
            </h1>
            <p className="text-sm text-[#141416]/70 mt-1">Live pipeline runs, artifact validation status, and full audit trail.</p>
          </div>
          <button onClick={triggerPipeline} disabled={triggering}
            className="btn-primary text-sm py-3 px-5 gap-2 shadow-[3px_3px_0px_#141416] cursor-pointer disabled:opacity-60 self-start">
            {triggering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Trigger Rebuild
          </button>
        </div>
      </div>

      {/* Stats */}
      {runs.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Runs', val: runs.length, color: 'bg-white' },
            { label: 'Successful', val: runs.filter(r => r.success).length, color: 'bg-[#D2F5E3]' },
            { label: 'Failed', val: runs.filter(r => !r.success && r.error).length, color: 'bg-[#FFD6CE]' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 border-2 border-[#141416] shadow-[3px_3px_0px_#141416] text-center`}>
              <p className="text-2xl font-editorial font-black text-[#141416]">{s.val}</p>
              <p className="text-[11px] font-black text-[#5E5E68] uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex p-1 rounded-full bg-[#F4EFE6] border-2 border-[#141416] gap-1">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                tab === t.id ? 'bg-[#E3D9FF] text-[#141416] shadow-[1px_1px_0px_#141416]' : 'text-[#5E5E68] hover:text-[#141416]'
              }`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === 'pipeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial font-extrabold text-base text-[#141416]">Recent Runs</h3>
            <button onClick={fetchPipeline} disabled={loading}
              className="btn-ghost text-xs py-1.5 px-3 gap-1 cursor-pointer">
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
          {loading && runs.length === 0 && (
            <div className="text-center py-12 text-sm text-[#5E5E68]">Loading pipeline runs...</div>
          )}
          {!loading && runs.length === 0 && (
            <div className="rounded-2xl bg-[#F4EFE6] border-2 border-[#141416] p-10 text-center">
              <Zap className="w-8 h-8 text-[#5E5E68] mx-auto mb-3" />
              <p className="font-editorial font-bold text-[#141416] mb-1">No pipeline runs yet</p>
              <p className="text-xs text-[#5E5E68]">Add or update a book, or manually trigger a rebuild to start.</p>
            </div>
          )}
          {runs.map((run, i) => <PipelineRunCard key={run.run_id || i} run={run} />)}
        </div>
      )}

      {tab === 'audit' && (
        <div className="rounded-2xl bg-white border-2 border-[#141416] p-5 shadow-[4px_4px_0px_#141416]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-editorial font-extrabold text-base text-[#141416]">Audit Log</h3>
            <button onClick={fetchAudit}
              className="btn-ghost text-xs py-1.5 px-3 gap-1 cursor-pointer">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
          <AuditLog log={auditLog} />
        </div>
      )}
    </div>
  );
}
