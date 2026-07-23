import React, { useState, useEffect } from 'react';
import { Sparkles, Search, BookOpen, Loader2, ArrowRight, Star, Zap, User } from 'lucide-react';

function SkeletonRec() {
  return (
    <div className="card rounded-2xl p-4 flex gap-4">
      <div className="skeleton w-16 h-20 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="skeleton h-3.5 rounded w-4/5" />
        <div className="skeleton h-3 rounded w-2/3" />
        <div className="skeleton h-5 rounded-full w-24 mt-3" />
      </div>
    </div>
  );
}

function RecommendCard({ book, index }) {
  const img = book['Image-URL-M'] || book['Image-URL-L'] || book['Image-URL-S'];
  return (
    <div className="card rounded-2xl p-4 flex gap-4 reveal" style={{ animationDelay: `${index * 0.07}s` }}>
      <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center border border-gray-100">
        {img && img.startsWith('http')
          ? <img src={img} alt={book['Book-Title']} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
          : <BookOpen className="w-6 h-6 text-gray-200" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-[13px] text-gray-900 truncate-2 leading-snug mb-1">{book['Book-Title']}</h4>
        <p className="text-xs text-gray-400 truncate">{book['Book-Author'] || 'Unknown'}</p>
        <p className="text-[10px] text-gray-300 truncate mt-0.5">{book['Publisher'] || ''}</p>
        <div className="flex items-center gap-2 mt-2">
          {book.similarity_score !== undefined && (
            <span className="badge badge-emerald"><Star className="w-2.5 h-2.5" />{(book.similarity_score*100).toFixed(0)}% match</span>
          )}
          <span className="text-[10px] text-gray-300">{book['Year-Of-Publication'] || '—'}</span>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const [mode, setMode]       = useState('item');
  const [query, setQuery]     = useState('Classical Mythology');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [k, setK]             = useState(10);

  const fetchRecs = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(''); setResults(null);
    try {
      const ep = mode === 'item'
        ? `/api/recommend/item/${encodeURIComponent(query.trim())}?k=${k}`
        : `/api/recommend/${encodeURIComponent(query.trim())}?k=${k}`;
      const res = await fetch(ep);
      res.ok ? setResults(await res.json()) : setError('No recommendations found for this query.');
    } catch { setError('Connection error. Please ensure the API server is running.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecs(); }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header card */}
      <div className="rounded-3xl p-6 md:p-8 reveal shine-card" style={{
        background: 'linear-gradient(135deg, #ffffff 60%, #fffbeb)',
        border: '1px solid rgba(217,119,6,0.1)',
        boxShadow: '0 4px 24px rgba(217,119,6,0.06)',
      }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fffbeb' }}>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-gray-900">AI Recommendations</h2>
            <p className="text-gray-400 text-xs">TF-IDF Cosine Similarity powered book suggestions</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex p-1 rounded-xl mb-4 gap-1" style={{ background: '#f8f7f4', border: '1px solid rgba(0,0,0,0.07)' }}>
          {[{ id: 'item', label: 'By Book Title', icon: BookOpen }, { id: 'user', label: 'By User ID', icon: User }].map(m => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button key={m.id} onClick={() => { setMode(m.id); setResults(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${active ? 'bg-white text-violet-700 shadow-card' : 'text-gray-400 hover:text-gray-600'}`}>
                <Icon className="w-4 h-4" /> {m.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <div className="search-glow flex-1 flex items-center gap-2 rounded-xl px-4 py-2.5 bg-white" style={{ border: '1.5px solid rgba(0,0,0,0.09)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Search className="w-4 h-4 text-gray-300 flex-shrink-0" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchRecs()}
              placeholder={mode === 'item' ? 'Book title or ISBN...' : 'User ID...'}
              className="flex-1 bg-transparent text-gray-900 text-sm placeholder-gray-300 outline-none" />
          </div>
          <select value={k} onChange={e => setK(Number(e.target.value))} className="input-field w-24 py-2.5 text-sm" style={{ borderRadius: '12px' }}>
            {[5,10,15,20].map(n => <option key={n} value={n}>{n} recs</option>)}
          </select>
          <button onClick={fetchRecs} disabled={loading} className="btn-primary gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Generate
          </button>
        </div>
      </div>

      {loading && <div className="space-y-3">{Array.from({length:5}).map((_,i)=><SkeletonRec key={i}/>)}</div>}

      {error && !loading && (
        <div className="rounded-2xl px-5 py-4 flex items-center gap-3" style={{ background: '#fff1f2', border: '1px solid rgba(225,29,72,0.2)' }}>
          <span className="text-rose-600 text-sm">{error}</span>
        </div>
      )}

      {results && !loading && (
        <div>
          {results.query_item && (
            <div className="rounded-2xl px-5 py-3 mb-4 flex items-center gap-3" style={{ background: '#f5f3ff', border: '1px solid rgba(124,58,237,0.15)' }}>
              <BookOpen className="w-4 h-4 text-violet-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-400">For: </span>
                <span className="text-sm font-bold text-gray-900">{results.query_item['Book-Title']}</span>
              </div>
              <span className="badge badge-purple">{results.recommendations_count} found</span>
              {results.latency_ms && <span className="text-[10px] text-gray-400">{results.latency_ms.toFixed(0)}ms</span>}
            </div>
          )}
          <div className="space-y-3">
            {(results.recommendations || []).map((book, idx) => <RecommendCard key={idx} book={book} index={idx} />)}
          </div>
        </div>
      )}
    </div>
  );
}
