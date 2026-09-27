import React, { useState, useEffect } from 'react';
import {
  Sparkles, Search, BookOpen, Loader2, ArrowRight,
  Zap, User, Grid, Compass, Bookmark, Check
} from 'lucide-react';
import TiltCard3D from '../components/UI/TiltCard3D';
import BookCover from '../components/UI/BookCover';

function SkeletonRec() {
  return (
    <div className="card rounded-2xl p-4 flex gap-4 bg-white border-2 border-[#141416]">
      <div className="skeleton w-16 h-20 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="skeleton h-3.5 rounded w-4/5" />
        <div className="skeleton h-3 rounded w-2/3" />
        <div className="skeleton h-5 rounded-full w-24 mt-3" />
      </div>
    </div>
  );
}

function RecommendCard({ book, index, onSelect, onAddToBox, inBox }) {
  const matchPct = book.similarity_score !== undefined ? (book.similarity_score * 100).toFixed(0) : null;

  return (
    <TiltCard3D
      maxTilt={10}
      scale={1.02}
      onClick={onSelect}
      className="card rounded-2xl p-4 flex gap-4 cursor-pointer reveal border-2 border-[#141416] bg-white shadow-[3px_3px_0px_#141416] hover:shadow-[5px_5px_0px_#141416] transition-all"
    >
      <div className="w-20 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-[#141416] relative shadow-sm">
        <BookCover book={book} size="M" className="w-full h-full" />
        {matchPct && (
          <span className="absolute bottom-1 right-1 badge badge-yellow text-[8px] font-black px-1.5 py-0.5 z-10">
            {matchPct}% Match
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h4 className="font-editorial font-bold text-sm text-[#141416] truncate-2 leading-snug">
            {book['Book-Title']}
          </h4>
          <p className="text-xs text-[#5E5E68] font-bold truncate mt-1">
            {book['Book-Author'] || 'Unknown Author'}
          </p>
          <p className="text-[10px] text-[#5E5E68] truncate mt-0.5 font-mono">
            {book['Publisher'] || ''}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#141416]/10 mt-2">
          <span className="text-[10px] text-[#5E5E68] font-mono">
            {book['Year-Of-Publication'] || '—'}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToBox && onAddToBox(book);
            }}
            className={`text-[10px] font-black py-1 px-3 rounded-full border border-[#141416] shadow-[1px_1px_0px_#141416] transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center gap-1 ${
              inBox ? 'bg-[#D2F5E3] text-[#141416]' : 'bg-[#FAED8F] hover:bg-[#F5DE5D] text-[#141416]'
            }`}
          >
            {inBox ? (
              <>
                <Check className="w-3 h-3 text-emerald-700" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3 h-3" />
                <span>+ Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </TiltCard3D>
  );
}

const SAMPLE_QUERIES = [
  'Classical Mythology',
  'The Fellowship of the Ring',
  'To Kill a Mockingbird',
  'The Da Vinci Code',
  'Harry Potter',
  '1984'
];

export default function RecommendationsPage({
  setSelectedIsbn,
  setActiveTab,
  onAddToBox,
  boxBooks = []
}) {
  const [mode, setMode] = useState('item');
  const [query, setQuery] = useState('Classical Mythology');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [k, setK] = useState(10);

  const fetchRecs = async (overrideQuery) => {
    const q = (overrideQuery !== undefined ? overrideQuery : query).trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const ep = mode === 'item'
        ? `/api/recommend/item/${encodeURIComponent(q)}?k=${k}`
        : `/api/recommend/${encodeURIComponent(q)}?k=${k}`;
      const res = await fetch(ep);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        setError('No recommendations found for this query. Try a sample title above.');
      }
    } catch {
      setError('Connection error. Please ensure the API backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const handleSelectBook = (book) => {
    if (!book) return;
    if (setSelectedIsbn && setActiveTab) {
      setSelectedIsbn(book['ISBN'] || book['Book-Title']);
      setActiveTab('details');
    }
  };

  const recList = results?.recommendations || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">

      {/* Header Search Card */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white border-2 border-[#141416] shadow-[6px_6px_0px_#141416]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#FAED8F] border-2 border-[#141416] text-[#141416] font-editorial font-black text-xl shadow-[2px_2px_0px_#141416]">
              SB
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E3D9FF] border border-[#141416] text-[10px] font-black uppercase mb-0.5">
                <Sparkles className="w-3 h-3" />
                <span>TF-IDF Vector Space</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-editorial font-extrabold text-[#141416]">
                AI Book Recommendations
              </h2>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex p-1 rounded-full mb-4 gap-1 bg-[#FCFAF6] border-2 border-[#141416]">
          {[
            { id: 'item', label: 'Match by Book Title', icon: BookOpen },
            { id: 'user', label: 'Match by Member Profile', icon: User }
          ].map(m => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); setResults(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
                  active ? 'bg-[#FAED8F] text-[#141416] shadow-[1px_1px_0px_#141416]' : 'text-[#5E5E68] hover:text-[#141416]'
                }`}
              >
                <Icon className="w-4 h-4" /> {m.label}
              </button>
            );
          })}
        </div>

        {/* Search input bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-3 rounded-full px-5 py-3 bg-[#FCFAF6] border-2 border-[#141416] shadow-[2px_2px_0px_#141416]">
            <Search className="w-4 h-4 text-[#141416] flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchRecs()}
              placeholder={mode === 'item' ? 'Enter title (e.g. Classical Mythology)...' : 'Enter User ID...'}
              className="flex-1 bg-transparent text-[#141416] text-sm placeholder-[#92929D] outline-none font-bold"
            />
          </div>

          <select
            value={k}
            onChange={e => setK(Number(e.target.value))}
            className="px-4 py-3 bg-[#FCFAF6] rounded-full border-2 border-[#141416] text-xs font-black text-[#141416] outline-none shadow-[2px_2px_0px_#141416] cursor-pointer"
          >
            {[5, 10, 15, 20].map(n => (
              <option key={n} value={n}>{n} recommendations</option>
            ))}
          </select>

          <button
            onClick={() => fetchRecs()}
            disabled={loading}
            className="btn-primary py-3 px-7 text-xs font-black shadow-[3px_3px_0px_#141416] flex-shrink-0 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>Get Recommendations</span>
          </button>
        </div>

        {/* Sample query pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-[#141416]/10">
          <span className="text-[10px] font-black text-[#5E5E68] uppercase tracking-wider">Quick Suggestions:</span>
          {SAMPLE_QUERIES.map(q => (
            <button
              key={q}
              onClick={() => {
                setQuery(q);
                fetchRecs(q);
              }}
              className="px-3 py-1 rounded-full text-xs font-bold bg-[#FCFAF6] border border-[#141416] hover:bg-[#FAED8F] text-[#141416] shadow-[1px_1px_0px_#141416] transition-all cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          <div className="rounded-3xl p-12 bg-white border-2 border-[#141416] shadow-[6px_6px_0px_#141416] text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-[#141416] animate-spin" />
            <h4 className="font-editorial font-bold text-lg text-[#141416]">
              Computing Vector Similarities...
            </h4>
            <p className="text-xs text-[#5E5E68]">Calculating TF-IDF Cosine Distances across 271,000+ indexed books.</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-3xl p-6 bg-[#FFD6CE] border-2 border-[#141416] shadow-[4px_4px_0px_#141416] text-[#141416] text-sm font-bold flex items-center gap-3">
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {results && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial font-extrabold text-2xl text-[#141416] flex items-center gap-2">
              <span>Recommendations for: <strong>"{results.query_title || query}"</strong></span>
              <span className="badge badge-yellow ml-2">{recList.length} Closest Matches</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recList.map((rec, idx) => {
              const inBox = boxBooks.some(b => String(b.ISBN) === String(rec['ISBN']));
              return (
                <RecommendCard
                  key={idx}
                  book={rec}
                  index={idx}
                  onSelect={() => handleSelectBook(rec)}
                  onAddToBox={onAddToBox}
                  inBox={inBox}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
