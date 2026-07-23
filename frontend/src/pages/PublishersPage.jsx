import React, { useState, useEffect } from 'react';
import { Building2, Search, BookOpen, ArrowRight, Loader2, LayoutGrid } from 'lucide-react';

function PublisherCard({ publisher, index, onClick }) {
  const colors = [
    ['rgba(244,63,94,0.12)', 'rgba(244,63,94,0.3)', '#fb7185'],
    ['rgba(139,92,246,0.12)', 'rgba(139,92,246,0.3)', '#a78bfa'],
    ['rgba(16,185,129,0.12)', 'rgba(16,185,129,0.3)', '#34d399'],
    ['rgba(245,158,11,0.12)', 'rgba(245,158,11,0.3)', '#fbbf24'],
    ['rgba(99,102,241,0.12)', 'rgba(99,102,241,0.3)', '#818cf8'],
    ['rgba(20,184,166,0.12)', 'rgba(20,184,166,0.3)', '#2dd4bf'],
  ];
  const [bg, border, text] = colors[index % colors.length];

  return (
    <div
      className="glass-card rounded-2xl p-5 cursor-pointer reveal"
      style={{ animationDelay: `${Math.min(index, 12) * 0.04}s` }}
      onClick={() => onClick(publisher.publisher)}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: bg }}
        >
          <Building2 className="w-5 h-5" style={{ color: text }} />
        </div>
        <span className="badge" style={{ background: bg, color: text, border: `1px solid ${border}`, fontSize: '10px' }}>
          {publisher.book_count?.toLocaleString()} titles
        </span>
      </div>
      <h4 className="font-bold text-[13px] text-white truncate-2 leading-snug">{publisher.publisher}</h4>
    </div>
  );
}

export default function PublishersPage({ setSelectedIsbn, setActiveTab }) {
  const [publishers, setPublishers] = useState([]);
  const [selectedPub, setSelectedPub] = useState(null);
  const [pubBooks, setPubBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPublishers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/publishers?limit=60');
      if (res.ok) {
        const data = await res.json();
        setPublishers(data.publishers || []);
      }
    } finally { setLoading(false); }
  };

  const fetchPubBooks = async (name) => {
    setBooksLoading(true);
    setSelectedPub(name);
    setPubBooks([]);
    try {
      const res = await fetch(`/api/publishers?publisher_name=${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        setPubBooks(data.books || []);
      }
    } finally { setBooksLoading(false); }
  };

  useEffect(() => { fetchPublishers(); }, []);

  const filtered = search
    ? publishers.filter(p => p.publisher?.toLowerCase().includes(search.toLowerCase()))
    : publishers;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div
        className="rounded-3xl p-6 md:p-8 reveal"
        style={{
          background: 'rgba(13,17,23,0.8)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.12)' }}>
            <Building2 className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-white">Publishers</h2>
            <p className="text-slate-500 text-xs">16,000+ publishing houses indexed in SmartBook AI</p>
          </div>
        </div>

        <div
          className="flex items-center gap-3 rounded-xl px-4 py-2.5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search publishers..."
            className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Publisher grid */}
        <div className="md:col-span-2">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-5">
                  <div className="skeleton w-10 h-10 rounded-xl mb-3" />
                  <div className="skeleton h-3.5 rounded w-3/4 mb-2" />
                  <div className="skeleton h-3 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Building2 className="w-10 h-10 mx-auto opacity-20 mb-3" />
              <p>No publishers found for "{search}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((publisher, idx) => (
                <PublisherCard
                  key={idx}
                  publisher={publisher}
                  index={idx}
                  onClick={fetchPubBooks}
                />
              ))}
            </div>
          )}
        </div>

        {/* Publisher book panel */}
        <div>
          {selectedPub ? (
            <div
              className="rounded-3xl p-5 sticky top-4"
              style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
            >
              <h3 className="font-bold text-[14px] text-white mb-4 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-rose-400" />
                <span className="truncate">{selectedPub}</span>
              </h3>

              {booksLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="skeleton w-10 h-14 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="skeleton h-3 rounded w-4/5" />
                        <div className="skeleton h-2.5 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : pubBooks.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No books found</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {pubBooks.map((book, i) => {
                    const img = book['Image-URL-S'] || book['Image-URL-M'];
                    return (
                      <div
                        key={i}
                        className="flex gap-3 items-center cursor-pointer group"
                        onClick={() => {
                          setSelectedIsbn && setSelectedIsbn(book['ISBN'] || book['Book-Title']);
                          setActiveTab && setActiveTab('details');
                        }}
                      >
                        <div className="w-10 h-14 rounded-lg overflow-hidden bg-surface-2 flex-shrink-0 flex items-center justify-center">
                          {img ? (
                            <img src={img} alt={book['Book-Title']} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
                          ) : (
                            <BookOpen className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-white truncate group-hover:text-rose-400 transition-colors">{book['Book-Title']}</p>
                          <p className="text-[10px] text-slate-500">{book['Book-Author'] || '—'}</p>
                          <p className="text-[10px] text-slate-600">{book['Year-Of-Publication'] || '—'}</p>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-700 group-hover:text-rose-400 transition-colors flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div
              className="rounded-3xl p-8 text-center"
              style={{ background: 'rgba(13,17,23,0.5)', border: '1px dashed rgba(255,255,255,0.07)' }}
            >
              <Building2 className="w-10 h-10 mx-auto text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm font-medium">Select a publisher</p>
              <p className="text-slate-600 text-xs mt-1">to browse their catalog</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
