import React, { useState, useEffect } from 'react';
import { BarChart3, Database, FileCode, CheckCircle, RefreshCw, Table } from 'lucide-react';

export default function DatasetAnalysisPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchValidation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/validate_dataset', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setData(json.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValidation();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between glass-panel p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <span>Dataset Exploratory Analysis (EDA)</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Automated column profiling, type inference, missing value inspection & raw sample view.
          </p>
        </div>
        <button
          onClick={fetchValidation}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-slate-400 rounded-2xl">
          Loading dataset analysis...
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="glass-card p-5 rounded-xl">
              <span className="text-xs text-slate-400">Total Rows</span>
              <p className="text-2xl font-extrabold text-white mt-1">{data.total_rows?.toLocaleString()}</p>
            </div>
            <div className="glass-card p-5 rounded-xl">
              <span className="text-xs text-slate-400">Total Columns</span>
              <p className="text-2xl font-extrabold text-white mt-1">{data.total_columns}</p>
            </div>
            <div className="glass-card p-5 rounded-xl">
              <span className="text-xs text-slate-400">Text / Categorical</span>
              <p className="text-2xl font-extrabold text-brand-400 mt-1">{data.text_columns?.length || 0}</p>
            </div>
            <div className="glass-card p-5 rounded-xl">
              <span className="text-xs text-slate-400">Duplicate Rows</span>
              <p className="text-2xl font-extrabold text-amber-400 mt-1">{data.duplicate_rows}</p>
            </div>
          </div>

          {/* Schema Table */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileCode className="w-5 h-5 text-brand-400" />
              <span>Column Schema & Missing Values</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Column Name</th>
                    <th className="p-3">Inferred Data Type</th>
                    <th className="p-3">Missing Values</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.columns?.map((col) => (
                    <tr key={col} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">{col}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-indigo-300">
                          {data.dtypes?.[col]}
                        </span>
                      </td>
                      <td className="p-3">
                        {data.missing_values?.[col] > 0 ? (
                          <span className="text-amber-400 font-semibold">{data.missing_values[col]} missing</span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">0 (Complete)</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Validated
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Data Preview */}
          {data.sample_records && (
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Table className="w-5 h-5 text-indigo-400" />
                <span>Dataset Record Samples</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      {data.columns?.map((col) => (
                        <th key={col} className="p-3 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {data.sample_records.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        {data.columns?.map((col) => (
                          <td key={col} className="p-3 max-w-xs truncate text-slate-300">
                            {String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
