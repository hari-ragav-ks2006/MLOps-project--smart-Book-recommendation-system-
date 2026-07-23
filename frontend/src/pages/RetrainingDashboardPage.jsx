import React, { useState } from 'react';
import { RefreshCw, Zap, ShieldCheck, CheckCircle2, Clock, Sliders, Loader2 } from 'lucide-react';

export default function RetrainingDashboardPage() {
  const [retraining, setRetraining] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [autoRetrainDrift, setAutoRetrainDrift] = useState(true);
  const [schedule, setSchedule] = useState('weekly');

  const handleTriggerRetrain = async () => {
    setRetraining(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/retrain', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStatusMsg(data.message || 'Retraining initiated in background.');
      }
    } catch (err) {
      setStatusMsg('Failed to trigger retraining pipeline.');
    } finally {
      setRetraining(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="glass-panel p-6 rounded-2xl space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 text-emerald-400" />
          <span>Automated Model Retraining Dashboard</span>
        </h2>
        <p className="text-slate-400 text-sm">
          Configure drift-triggered retraining policies or initiate immediate model retraining on incoming data batches.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Retrain Policy Configuration */}
        <div className="glass-panel p-6 rounded-2xl space-y-5 border border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-brand-400" />
            <span>Retraining Policy Config</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="font-semibold text-white">Data Drift Auto-Retrain</span>
                <p className="text-slate-400 text-[11px]">Trigger when Evidently drift score &gt; 0.25</p>
              </div>
              <input
                type="checkbox"
                checked={autoRetrainDrrain => setAutoRetrainDrift(!autoRetrainDrift)}
                onChange={() => setAutoRetrainDrift(!autoRetrainDrift)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-slate-800 border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-slate-300">Scheduled Cron Interval</label>
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="daily">Daily Cron Job (0 0 * * *)</option>
                <option value="weekly">Weekly Cron Job (0 0 * * 0)</option>
                <option value="monthly">Monthly Cron Job (0 0 1 * *)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Immediate Retraining Control */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span>Manual Retrain Trigger</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Instantly re-fit TF-IDF vectorizer and nearest neighbors model using latest ingested dataset.
            </p>
          </div>

          {statusMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          <button
            onClick={handleTriggerRetrain}
            disabled={retraining}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {retraining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initiating Pipeline...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Trigger Retrain Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
