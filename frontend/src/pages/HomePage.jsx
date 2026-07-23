import React, { useState, useEffect } from 'react';
import {
  BookOpen, Sparkles, Search, TrendingUp,
  Users, Building2, ArrowRight, Cpu, Star, Zap
} from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="book-card p-4 flex flex-col gap-3">
      <div className="skeleton rounded-xl h-44" />
      <div className="space-y-2">
        <div className="skeleton h-3.5 rounded w-4/5" />
        <div className="skeleton h-3 rounded w-3/5" />
      </div>
      <div className="skeleton h-3 rounded w-2/5 mt-auto" />
    </div>
  );
}

function BookCard({ book, index, onClick }) {
  const imgUrl = book['Image-URL-M'] || book['Image-URL-L'] || book['Image-URL-S'];
  const year = book['Year-Of-Publication'] || '—';

  return (
    <div
      className="book-card p-3 flex flex-col gap-3 reveal"
      style={{ animationDelay: `${index * 0.06}s` }}
      onClick={onClick}
    >
      {/* Cover image */}
      <div className="relative rounded-xl overflow-hidden bg-surface-2 h-44 flex items-center justify-center">
        {imgUrl && imgUrl.startsWith('http') ? (
          <img
            src={imgUrl}
            alt={book['Book-Title']}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <BookOpen className="w-10 h-10 text-slate-700" />
        )}
        {/* Year badge */}
        <span
          className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-lg"
          style={{ background: 'rgba(8,11,20,0.85)', border: '1px solid rgba(255,255,255,0.08)', color: '#a78bfa' }}
        >
          {year}
        </span>
        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'rgba(8,11,20,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <div className="btn-primary text-xs gap-1 py-1.5 px-3">
            <ArrowRight className="w-3.5 h-3.5" />
            <span>View Details</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5 flex-1">
        <h4 className="font-bold text-[13px] text-white truncate-1 leading-snug">{book['Book-Title']}</h4>
        <p className="text-[11px] text-slate-500 truncate">{book['Book-Author'] || 'Unknown Author'}</p>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="text-[10px] font-mono text-slate-600">{(book['ISBN'] || '').slice(0, 10)}</span>
        <span className="text-[11px] font-semibold text-brand-400 flex items-center gap-1">
          Details <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

const STATS = [
  {
    value: '271,360',
    label: 'Books Indexed',
    icon: BookOpen,
    gradient: 'from-purple-500/20 to-transparent',
    iconColor: 'text-purple-400',
    iconBg: 'rgba(139,92,246,0.12)',
    delay: 'reveal-delay-1',
  },
  {
    value: '100K+',
    label: 'Unique Authors',
    icon: Users,
    gradient: 'from-emerald-500/20 to-transparent',
    iconColor: 'text-emerald-400',
    iconBg: 'rgba(16,185,129,0.12)',
    delay: 'reveal-delay-2',
  },
  {
    value: '16,000+',
    label: 'Publishers',
    icon: Building2,
    gradient: 'from-rose-500/20 to-transparent',
    iconColor: 'text-rose-400',
    iconBg: 'rgba(244,63,94,0.12)',
    delay: 'reveal-delay-3',
  },
  {
    value: '98.0%',
    label: 'Precision@5',
    icon: Cpu,
    gradient: 'from-amber-500/20 to-transparent',
    iconColor: 'text-amber-400',
    iconBg: 'rgba(245,158,11,0.12)',
    delay: 'reveal-delay-4',
  },
];

export default function HomePage({ setActiveTab, setSelectedIsbn }) {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/books?limit=8')
      .then(r => r.json())
      .then(d => { setFeaturedBooks(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ─── Hero Section ─── */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 md:p-12 reveal"
        style={{
          background: 'rgba(13,17,23,0.8)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Background decorative elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <div
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }}
          />
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full badge badge-purple">
            <Sparkles className="w-3 h-3" />
            <span>AI-Powered Book Discovery Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-[1.1] mb-4">
            Discover Your Next
            <br />
            <span className="gradient-text">Favorite Read</span>
            {' '}with AI
          </h1>

          <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
            Explore 271,000+ titles powered by TF-IDF Content-Based filtering, cosine similarity matching,
            and intelligent author & publisher indexing.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setActiveTab('discover')} className="btn-primary">
              <Search className="w-4 h-4" />
              Explore 271K Books
            </button>
            <button onClick={() => setActiveTab('recommendations')} className="btn-secondary">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Get AI Recommendations
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mini feature pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {['TF-IDF Engine', 'Cosine Similarity', 'Real-time ML', 'MLflow Tracking', 'DVC Versioning'].map(tag => (
              <span key={tag} className="badge badge-indigo">
                <Zap className="w-2.5 h-2.5" /> {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`stat-card ${stat.delay}`} style={{ background: 'rgba(13,17,23,0.7)' }}>
              {/* Top gradient */}
              <div
                className={`absolute inset-0 rounded-[inherit] bg-gradient-to-br ${stat.gradient} opacity-70`}
              />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-2xl font-extrabold text-white tracking-tight">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: stat.iconBg }}
                >
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Featured Books ─── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-xl text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-400" />
              Featured Catalog
            </h2>
            <p className="text-xs text-slate-500 mt-1">Trending titles from the SmartBook AI dataset</p>
          </div>
          <button
            onClick={() => setActiveTab('discover')}
            className="btn-ghost text-[13px] gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredBooks.map((book, idx) => (
              <BookCard
                key={idx}
                book={book}
                index={idx}
                onClick={() => {
                  setSelectedIsbn && setSelectedIsbn(book['ISBN'] || book['Book-Title']);
                  setActiveTab('details');
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
