import React, { useState, useEffect } from 'react';
import { Sparkles, Search, BookOpen, Loader2, ArrowRight, Star, Zap, User } from 'lucide-react';

function SkeletonRec() {
  return (
    <div className="glass-card rounded-2xl p-4 flex gap-4">
      <div className="skeleton w-16 h-20 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="skeleton h-3.5 rounded w-4/5" />
        <div className="skeleton h-3 rounded w-2/3" />
        <div className="skeleton h-3 rounded w-1/2" />
        <div className="skeleton h-5 rounded-full w-24 mt-3" />
      </div>
    </div>
  );
}

function RecommendCard({ book, index, onClick }) {
  const img = book['Image-URL-M'] || book['Image-URL-L'] || book['Image-URL-S'];
  const score = book.similarity_score;

  return (
    <div
      className="glass-card rounded-2xl p-4 flex gap-4 cursor-pointer reveal"
      style={{ animationDelay: `${index * 0.07}s` }}
      onClick={onClick}
    >
      {/* Cover thumbnail */}
      <div className="w-16 h-20 rounded-xl overflow-hidden bg-surface-2 flex-shrink-0 flex items-center justify-center">
        {img && img.startsWith('http') ? (
          <img src={img} alt={book['Book-Title']} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
        ) : (
          <BookOpen className="w-6 h-6 text-slate-600" />
        )}
      </div>

      {/* Meta */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-[13px] text-white truncate-2 leading-snug mb-1">{book['Book-Title']}</h4>
        <p className="text-xs text-slate-500 truncate">{book['Book-Author'] || 'Unknown'}</p>
        <p className="text-[10px] text-slate-600 truncate mt-0.5">{book['Publisher'] || ''}</p>

        <div className="flex items-center gap-2 mt-2.5">
          {score !== undefined && (
            <span className="badge badge-emerald">
              <Star className="w-2.5 h-2.5" />
              {(score * 100).toFixed(0)}% match
            </span>
          )}
          <span className="text-[10px] text-slate-600 font-mono">{book['Year-Of-Publication'] || '—'}</span>
        </div>
      </div>

      <div className="flex-shrink-0 self-center">
        <ArrowRight className="w-4 h-4 text-slate-600" />
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const [mode, setMode] = useState('item');
  const [query, setQuery] = useState('Classical Mythology');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [k, setK] = useState(10);

  const fetchRecommendations = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const endpoint = mode === 'item'
        ? `/api/recommend/item/${encodeURIComponent(query.trim())}?k=${k}`
        : `/api/recommend/${encodeURIComponent(query.trim())}?k=${k}`;
      const res = await fetch(endpoint);
      if (res.ok) {
        setResults(await res.json());
      } else {
        setError('No recommendations found for this query.');
      }
    } catch {
      setError('Connection error. Please ensure the API server is running.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRecommendations(); }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ─── Header ─── */}
      <div
        className="rounded-3xl p-6 md:p-8 reveal"
        style={{
          background: 'rgba(13,17,23,0.8)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.12)' }}
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-white">AI Recommendations</h2>
            <p className="text-slate-500 text-xs">TF-IDF Cosine Similarity powered suggestions</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div
          className="flex p-1 rounded-xl mb-4 gap-1"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {[
            { id: 'item', label: 'By Book Title', icon: BookOpen },
            { id: 'user', label: 'By User ID', icon: User },
          ].map(m => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); setResults(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                  active
                    ? 'bg-brand-600 text-white shadow-glow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" /> {m.label}
              </button>
            );
          })}
        </div>

        {/* Search row */}
        <div className="flex gap-3">
          <div
            className="search-glow flex-1 flex items-center gap-2 rounded-xl px-4 py-2.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchRecommendations()}
              placeholder={mode === 'item' ? 'Book title or ISBN...' : 'User ID...'}
              className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 outline-none"
            />
          </div>

          <select
            value={k}
            onChange={e => setK(Number(e.target.value))}
            className="input-field w-24 py-2.5"
            style={{ borderRadius: '12px' }}
          >
            {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} recs</option>)}
          </select>

          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="btn-primary gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Generate
          </button>
        </div>
      </div>

      {/* ─── Results ─── */}
      {loading && (
        <div className="space-y-3 reveal">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRec key={i} />)}
        </div>
      )}

      {error && !loading && (
        <div
          className="rounded-2xl px-5 py-4 flex items-center gap-3 reveal"
          style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}
        >
          <span className="text-rose-400 text-sm">{error}</span>
        </div>
      )}

      {results && !loading && (
        <div className="reveal">
          {/* Query item summary */}
          {results.query_item && (
            <div
              className="rounded-2xl px-5 py-3 mb-4 flex items-center gap-3"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
            >
              <BookOpen className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-slate-400">Recommendations for: </span>
                <span className="text-sm font-bold text-white">{results.query_item['Book-Title']}</span>
              </div>
              <span className="badge badge-purple">{results.recommendations_count} found</span>
              {results.latency_ms && (
                <span className="text-[10px] text-slate-600">{results.latency_ms.toFixed(0)}ms</span>
              )}
            </div>
          )}

          <div className="space-y-3">
            {(results.recommendations || []).map((book, idx) => (
              <RecommendCard key={idx} book={book} index={idx} onClick={() => {}} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
