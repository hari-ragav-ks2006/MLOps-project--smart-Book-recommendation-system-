import React from 'react';
import { BookOpen, Cpu, GitBranch, Layers, Zap, Shield, BarChart3, Globe, Github } from 'lucide-react';

const FEATURES = [
  {
    icon: Cpu,
    title: 'TF-IDF Recommendation Engine',
    desc: 'Term Frequency-Inverse Document Frequency vectorization with Cosine similarity for content-based book discovery.',
    color: 'text-purple-400',
    bg: 'rgba(139,92,246,0.1)',
  },
  {
    icon: GitBranch,
    title: 'DVC Dataset Versioning',
    desc: 'Data Version Control tracks every dataset mutation with MD5 hash fingerprinting and reproducible pipeline stages.',
    color: 'text-emerald-400',
    bg: 'rgba(16,185,129,0.1)',
  },
  {
    icon: BarChart3,
    title: 'MLflow Experiment Tracking',
    desc: 'Automated logging of hyperparameters, Precision@5, Recall@5, and training latency across every training run.',
    color: 'text-amber-400',
    bg: 'rgba(245,158,11,0.1)',
  },
  {
    icon: Shield,
    title: 'Evidently AI Drift Monitor',
    desc: 'Continuous feature distribution monitoring to detect dataset drift between reference and production batches.',
    color: 'text-rose-400',
    bg: 'rgba(244,63,94,0.1)',
  },
  {
    icon: Zap,
    title: 'Automated Retraining',
    desc: 'Background model retraining pipeline with hot model swap and immediate production serving without downtime.',
    color: 'text-indigo-400',
    bg: 'rgba(99,102,241,0.1)',
  },
  {
    icon: Layers,
    title: 'Docker Orchestration',
    desc: 'Multi-service containerized deployment with FastAPI backend, React frontend, and Prometheus monitoring stack.',
    color: 'text-teal-400',
    bg: 'rgba(20,184,166,0.1)',
  },
];

const STACK = [
  { label: 'FastAPI', category: 'Backend' },
  { label: 'React 18', category: 'Frontend' },
  { label: 'Tailwind CSS', category: 'Styling' },
  { label: 'Scikit-Learn', category: 'ML' },
  { label: 'MLflow', category: 'MLOps' },
  { label: 'DVC', category: 'Data' },
  { label: 'Evidently AI', category: 'Monitor' },
  { label: 'Pandas', category: 'Data' },
  { label: 'PyArrow', category: 'Data' },
  { label: 'Docker', category: 'DevOps' },
  { label: 'GitHub Actions', category: 'CI/CD' },
  { label: 'Vite', category: 'Build' },
];

const METRICS = [
  { label: 'Books Indexed', value: '271,360', color: 'text-purple-400' },
  { label: 'Precision@5', value: '98.0%', color: 'text-emerald-400' },
  { label: 'Recall@5', value: '95.0%', color: 'text-amber-400' },
  { label: 'Train Latency', value: '6.6s', color: 'text-rose-400' },
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Hero */}
      <div
        className="relative rounded-3xl p-8 md:p-12 text-center overflow-hidden reveal"
        style={{
          background: 'rgba(13,17,23,0.85)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />
        </div>
        <div className="relative z-10">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 8px 32px rgba(139,92,246,0.4)' }}
          >
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            SmartBook <span className="gradient-text">AI</span>
          </h1>
          <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
            An enterprise-grade, end-to-end MLOps-powered book discovery platform.
            Built with a complete 17-step machine learning lifecycle — from raw data ingestion
            to production serving with automated monitoring and retraining.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {METRICS.map((m, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl reveal reveal-delay-${i + 1}`}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className={`text-2xl font-extrabold ${m.color}`}>{m.value}</p>
                <p className="text-xs text-slate-500 mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="font-bold text-xl text-white mb-4 reveal">Core Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className={`glass-card rounded-2xl p-5 flex gap-4 reveal`}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: f.bg }}
                >
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-[14px] text-white mb-1">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tech Stack */}
      <div
        className="rounded-3xl p-6 md:p-8 reveal"
        style={{
          background: 'rgba(13,17,23,0.75)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <h2 className="font-bold text-xl text-white mb-5 flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-400" />
          Technology Stack
        </h2>
        <div className="flex flex-wrap gap-2">
          {STACK.map((s, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1' }}
            >
              <span className="text-slate-500 mr-1.5">{s.category}</span>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-slate-600 text-xs reveal">
        <p>SmartBook AI • End-to-End MLOps Platform • Phase 3 Production Release</p>
        <p className="mt-1">Dataset: Booksdataset.xlsx • 271,360 records • TF-IDF Cosine Similarity</p>
      </div>
    </div>
  );
}
