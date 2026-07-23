import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, ChevronLeft, ChevronRight, ArrowRight, Loader2, SlidersHorizontal, X } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="book-card p-3 flex flex-col gap-3">
      <div className="skeleton rounded-xl h-48" />
      <div className="space-y-2">
        <div className="skeleton h-3.5 rounded w-4/5" />
        <div className="skeleton h-3 rounded w-3/5" />
        <div className="skeleton h-2.5 rounded w-2/5" />
      </div>
    </div>
  );
}

function BookCard({ book, index, onClick }) {
  const imgUrl = book['Image-URL-M'] || book['Image-URL-L'] || book['Image-URL-S'];

  return (
    <div
      className="book-card p-3 flex flex-col gap-3 reveal cursor-pointer"
      style={{ animationDelay: `${Math.min(index, 12) * 0.04}s` }}
      onClick={onClick}
    >
      <div className="relative rounded-xl overflow-hidden bg-surface-2 h-48 flex items-center justify-center">
        {imgUrl && imgUrl.startsWith('http') ? (
          <img
            src={imgUrl}
            alt={book['Book-Title']}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <BookOpen className="w-10 h-10 text-slate-700" />
        )}
        <span
          className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-lg"
          style={{ background: 'rgba(8,11,20,0.9)', border: '1px solid rgba(255,255,255,0.08)', color: '#a78bfa' }}
        >
          {book['Year-Of-Publication'] || '—'}
        </span>
        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'rgba(8,11,20,0.65)', backdropFilter: 'blur(4px)' }}
        >
          <div className="btn-primary text-xs gap-1 py-1.5 px-3">
            <ArrowRight className="w-3 h-3" />
            <span>View</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 flex-1">
        <h4 className="font-bold text-[13px] text-white truncate-2 leading-snug">{book['Book-Title']}</h4>
        <p className="text-[11px] text-slate-500 truncate">{book['Book-Author'] || 'Unknown'}</p>
        <p className="text-[10px] text-slate-600 truncate mt-0.5">{book['Publisher'] || ''}</p>
      </div>

      <div
        className="flex items-center justify-between pt-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="text-[10px] font-mono text-slate-600">{(book['ISBN'] || '').slice(0, 10)}</span>
        <span className="text-[11px] font-semibold text-brand-400 flex items-center gap-0.5">
          Details <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

export default function DiscoverBooksPage({ setActiveTab, setSelectedIsbn }) {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef(null);

  const fetchCatalog = async (p = 1, q = search) => {
    setLoading(true);
    try {
      let url = `/api/books?page=${p}&limit=24`;
      if (q) url += `&search=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBooks(data.items || []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setTotalPages(data.total_pages || 1);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCatalog(1, ''); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchCatalog(1);
  };

  const clearSearch = () => {
    setSearch('');
    fetchCatalog(1, '');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ─── Search Header ─── */}
      <div
        className="rounded-3xl p-6 md:p-8 reveal"
        style={{
          background: 'rgba(13,17,23,0.8)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div className="mb-5">
          <h2 className="font-extrabold text-2xl text-white flex items-center gap-2 mb-1">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Discover Books
          </h2>
          <p className="text-slate-500 text-sm">Search across 271,360 books by title, author, publisher, or ISBN</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit}>
          <div
            className={`search-glow flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${
              searchFocused ? 'bg-opacity-80' : ''
            }`}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${searchFocused ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <Search className={`w-5 h-5 flex-shrink-0 transition-colors ${searchFocused ? 'text-brand-400' : 'text-slate-500'}`} />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search title, author, publisher, ISBN..."
              className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 outline-none"
            />
            {search && (
              <button type="button" onClick={clearSearch} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
            <button type="submit" className="btn-primary text-xs py-1.5 px-4 gap-1.5 flex-shrink-0" style={{ borderRadius: '10px' }}>
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              Search
            </button>
          </div>
        </form>
      </div>

      {/* ─── Results meta ─── */}
      <div className="flex items-center justify-between px-1 reveal-delay-1">
        <p className="text-sm text-slate-500">
          {search ? (
            <>Showing results for <span className="text-brand-400 font-semibold">"{search}"</span> — </>
          ) : null}
          <span className="text-white font-semibold">{total.toLocaleString()}</span> books
        </p>
        <span className="text-xs text-slate-600 font-mono">Page {page} / {totalPages}</span>
      </div>

      {/* ─── Grid ─── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : books.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-4 text-slate-500">
          <BookOpen className="w-12 h-12 opacity-30" />
          <p className="text-lg font-semibold">No books found</p>
          <p className="text-sm">Try a different search term</p>
          <button onClick={clearSearch} className="btn-secondary text-sm mt-2">Clear Search</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {books.map((book, idx) => (
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

      {/* ─── Pagination ─── */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-3 pt-4 reveal">
          <button
            onClick={() => fetchCatalog(page - 1)}
            disabled={page <= 1}
            className="btn-secondary text-xs py-2 px-4 gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ borderRadius: '10px' }}
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              return (
                <button
                  key={p}
                  onClick={() => fetchCatalog(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                    p === page
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-500 hover:text-white hover:bg-white/05'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => fetchCatalog(page + 1)}
            disabled={page >= totalPages}
            className="btn-secondary text-xs py-2 px-4 gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ borderRadius: '10px' }}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
