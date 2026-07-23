import React, { useState } from 'react';
import { Cpu, Play, CheckCircle2, Loader2, Sparkles, Sliders, ShieldCheck } from 'lucide-react';

export default function TrainingDashboardPage() {
  const [maxFeatures, setMaxFeatures] = useState(5000);
  const [training, setTraining] = useState(false);
  const [result, setResult] = useState(null);

  const handleTrain = async () => {
    setTraining(true);
    setResult(null);

    try {
      const res = await fetch('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ max_features: parseInt(maxFeatures) })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="glass-panel p-6 rounded-2xl space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Cpu className="w-6 h-6 text-brand-400" />
          <span>Recommendation Model Training Dashboard</span>
        </h2>
        <p className="text-slate-400 text-sm">
          Train content-based TF-IDF & Nearest Neighbors matrix factorization models with experiment tracking to MLflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="glass-panel p-6 rounded-2xl space-y-5 border border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <span>Hyperparameters</span>
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">TF-IDF Max Features</label>
            <select
              value={maxFeatures}
              onChange={(e) => setMaxFeatures(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="1000">1,000 Vocabulary Features</option>
              <option value="5000">5,000 Vocabulary Features (Default)</option>
              <option value="10000">10,000 Vocabulary Features</option>
              <option value="20000">20,000 Vocabulary Features</option>
            </select>
          </div>

          <div className="space-y-2 text-xs text-slate-400">
            <p>• Metric: Cosine Similarity</p>
            <p>• Algorithm: NearestNeighbors (Brute)</p>
            <p>• Tracking: MLflow Registry</p>
          </div>

          <button
            onClick={handleTrain}
            disabled={training}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {training ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Training Model...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start Training Pipeline</span>
              </>
            )}
          </button>
        </div>

        {/* Results / Live Telemetry */}
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Training Results & Validation Metrics</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Real-time MLflow run telemetry feedback.</p>
          </div>

          {result ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold text-sm">Model Trained Successfully!</span>
                </div>
                <span className="text-xs font-mono bg-emerald-950 px-2.5 py-1 rounded border border-emerald-500/30">
                  MLflow Run: {result.mlflow_run_id?.substring(0, 8)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Items Indexed</span>
                  <p className="text-xl font-bold text-white mt-1">{result.metadata?.num_items?.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Precision@5</span>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{(result.metadata?.precision_at_5 * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Recall@5</span>
                  <p className="text-xl font-bold text-indigo-400 mt-1">{(result.metadata?.recall_at_5 * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Train Latency</span>
                  <p className="text-xl font-bold text-brand-400 mt-1">{result.metadata?.train_latency_sec}s</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-300">Top Extracted Text Vocabulary Features</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {result.metadata?.features_used?.map((feat, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
              Click "Start Training Pipeline" to train the model on the uploaded dataset.
            </div>
          )}

          <div className="flex items-center space-x-2 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <span>Artifacts persisted to <code className="text-brand-300 font-mono">/models/recommendation_model.joblib</code></span>
          </div>
        </div>
      </div>
    </div>
  );
}
