import React from 'react';
import { Sliders, Server, Database, Activity, FileCheck, Layers } from 'lucide-react';

export default function AdminPanelPage({ health }) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="glass-panel p-6 rounded-2xl space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Sliders className="w-6 h-6 text-brand-400" />
          <span>System Administration & MLOps Registry</span>
        </h2>
        <p className="text-slate-400 text-sm">
          Overview of model artifact versions, server configuration, DVC dataset trackers, and API route endpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Registry Status */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <span>Active Service Status</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">FastAPI REST Server</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                Running (Port 8000)
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">MLflow Tracking URI</span>
              <span className="font-mono text-brand-300">file:///mlflow</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">DVC Dataset Status</span>
              <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 font-semibold border border-brand-500/20">
                Tracked (Booksdataset.xlsx)
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Prometheus Telemetry</span>
              <span className="font-mono text-emerald-300">/prometheus_metrics</span>
            </div>
          </div>
        </div>

        {/* API Endpoint Documentation Quick Access */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Exposed REST API Endpoints</span>
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-indigo-400 font-bold">POST /upload_dataset</span>
              <span className="text-slate-400">Upload CSV/Excel</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-indigo-400 font-bold">POST /preprocess</span>
              <span className="text-slate-400">Clean & vector features</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-indigo-400 font-bold">POST /train</span>
              <span className="text-slate-400">Train TF-IDF + NN model</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-emerald-400 font-bold">GET /recommend/{'{id}'}</span>
              <span className="text-slate-400">Get top-K recommendations</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-purple-400 font-bold">GET /drift</span>
              <span className="text-slate-400">Evidently data drift report</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
