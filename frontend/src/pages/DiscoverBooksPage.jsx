import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, ChevronLeft, ChevronRight, ArrowRight, Loader2, X } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="book-card p-3 flex flex-col gap-3">
      <div className="skeleton rounded-xl h-48" />
      <div className="space-y-2">
        <div className="skeleton h-3.5 rounded w-4/5" />
        <div className="skeleton h-3 rounded w-3/5" />
      </div>
    </div>
  );
}

// Smart cover: tries dataset URL → Open Library by ISBN → gradient fallback
function BookCover({ imgUrl, isbn, title, className = '' }) {
  const sources = [];
  if (imgUrl && imgUrl.startsWith('http')) sources.push(imgUrl);
  if (isbn) {
    sources.push(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`);
    sources.push(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`);
  }
  const [srcIndex, setSrcIndex] = useState(0);
  const [loaded, setLoaded]     = useState(false);
  const currentSrc              = sources[srcIndex];
  const exhausted               = srcIndex >= sources.length;
  const gradients = [
    'linear-gradient(135deg,#7c3aed,#4f46e5)','linear-gradient(135deg,#059669,#0d9488)',
    'linear-gradient(135deg,#d97706,#dc2626)','linear-gradient(135deg,#e11d48,#9333ea)',
    'linear-gradient(135deg,#0284c7,#7c3aed)','linear-gradient(135deg,#f59e0b,#ef4444)',
  ];
  const gradient = gradients[(title?.charCodeAt(0) || 0) % gradients.length];
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3" style={{ background: gradient }}>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-extrabold text-sm">
          {(title||'?').slice(0,2).toUpperCase()}
        </div>
        <p className="text-white text-[10px] font-bold text-center line-clamp-2 leading-snug" style={{ textShadow:'0 1px 3px rgba(0,0,0,0.3)' }}>{title}</p>
        <div className="absolute top-0 left-2 bottom-0 w-0.5 bg-white/10 rounded"/>
      </div>
      {!exhausted && (
        <img key={currentSrc} src={currentSrc} alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loaded?'opacity-100':'opacity-0'}`}
          onLoad={()=>setLoaded(true)}
          onError={()=>{ setLoaded(false); setSrcIndex(i=>i+1); }}/>
      )}
    </div>
  );
}

function BookCard({ book, index, onClick }) {
  const imgUrl = book['Image-URL-M'] || book['Image-URL-L'] || book['Image-URL-S'];
  const isbn   = book['ISBN'];
  return (
    <div className="book-card p-3 flex flex-col gap-3 reveal cursor-pointer" style={{ animationDelay: `${Math.min(index, 12) * 0.04}s` }} onClick={onClick}>
      <div className="relative rounded-xl overflow-hidden h-48">
        <BookCover imgUrl={imgUrl} isbn={isbn} title={book['Book-Title']} className="w-full h-full"/>
        <span className="absolute top-2 right-2 badge badge-purple text-[9px]">{book['Year-Of-Publication'] || '—'}</span>
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="btn-primary text-xs py-1.5 px-3" style={{ borderRadius: '8px' }}>
            <ArrowRight className="w-3 h-3" /> View
          </span>
        </div>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-[13px] text-gray-900 truncate-2 leading-snug">{book['Book-Title']}</h4>
        <p className="text-[11px] text-gray-400 truncate mt-0.5">{book['Book-Author'] || 'Unknown'}</p>
        <p className="text-[10px] text-gray-300 truncate mt-0.5">{book['Publisher'] || ''}</p>
      </div>
      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
        <span className="text-[10px] font-mono text-gray-300">{(book['ISBN'] || '').slice(0, 10)}</span>
        <span className="text-[11px] font-semibold text-violet-600 flex items-center gap-0.5">Details <ArrowRight className="w-3 h-3" /></span>
      </div>
    </div>
  );
}

export default function DiscoverBooksPage({ setActiveTab, setSelectedIsbn }) {
  const [books, setBooks]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(false);
  const [focused, setFocused]       = useState(false);
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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCatalog(1, ''); }, []);

  const clearSearch = () => { setSearch(''); fetchCatalog(1, ''); };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ─── Search header ─── */}
      <div className="rounded-3xl p-6 md:p-8 reveal shine-card" style={{
        background: 'linear-gradient(135deg, #ffffff 60%, #f5f3ff)',
        border: '1px solid rgba(124,58,237,0.09)',
        boxShadow: '0 4px 24px rgba(124,58,237,0.06)',
      }}>
        <div className="mb-5">
          <h2 className="font-extrabold text-2xl text-gray-900 flex items-center gap-2 mb-1">
            <BookOpen className="w-6 h-6 text-indigo-500" /> Discover Books
          </h2>
          <p className="text-gray-400 text-sm">Search across 271,360 books by title, author, publisher, or ISBN</p>
        </div>

        <form onSubmit={e => { e.preventDefault(); fetchCatalog(1); }}>
          <div
            className={`search-glow flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300`}
            style={{
              background: '#ffffff',
              border: `1.5px solid ${focused ? 'rgba(124,58,237,0.35)' : 'rgba(0,0,0,0.09)'}`,
              boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Search className={`w-5 h-5 flex-shrink-0 transition-colors ${focused ? 'text-violet-500' : 'text-gray-300'}`} />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search title, author, publisher, ISBN..."
              className="flex-1 bg-transparent text-gray-900 text-sm placeholder-gray-300 outline-none"
            />
            {search && (
              <button type="button" onClick={clearSearch} className="text-gray-300 hover:text-gray-500 transition-colors">
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

      {/* Results meta */}
      <div className="flex items-center justify-between px-1 reveal-delay-1">
        <p className="text-sm text-gray-400">
          {search && <><span className="text-violet-600 font-semibold">"{search}"</span> — </>}
          <span className="text-gray-800 font-semibold">{total.toLocaleString()}</span> books found
        </p>
        <span className="text-xs text-gray-300 font-mono">Page {page} / {totalPages}</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : books.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-3 text-gray-400">
          <BookOpen className="w-12 h-12 opacity-30" />
          <p className="text-lg font-semibold text-gray-500">No books found</p>
          <button onClick={clearSearch} className="btn-secondary text-sm mt-1">Clear Search</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {books.map((book, idx) => (
            <BookCard key={idx} book={book} index={idx} onClick={() => {
              setSelectedIsbn && setSelectedIsbn(book['ISBN'] || book['Book-Title']);
              setActiveTab('details');
            }} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-3 pt-4 reveal">
          <button onClick={() => fetchCatalog(page - 1)} disabled={page <= 1} className="btn-secondary text-xs py-2 px-4 gap-1 disabled:opacity-40" style={{ borderRadius: '10px' }}>
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              return (
                <button key={p} onClick={() => fetchCatalog(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${p === page ? 'bg-violet-600 text-white shadow-glow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                  {p}
                </button>
              );
            })}
          </div>
          <button onClick={() => fetchCatalog(page + 1)} disabled={page >= totalPages} className="btn-secondary text-xs py-2 px-4 gap-1 disabled:opacity-40" style={{ borderRadius: '10px' }}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
