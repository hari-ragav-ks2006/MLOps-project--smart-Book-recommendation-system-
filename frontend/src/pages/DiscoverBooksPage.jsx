import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, ChevronLeft, ChevronRight, ArrowRight, Loader2, X, Sparkles, Filter, Package, Check } from 'lucide-react';
import TiltCard3D from '../components/UI/TiltCard3D';

function SkeletonCard() {
  return (
    <div className="card p-4 flex flex-col gap-3 bg-white border-2 border-[#141416]">
      <div className="skeleton rounded-xl h-52" />
      <div className="space-y-2">
        <div className="skeleton h-4 rounded w-4/5" />
        <div className="skeleton h-3 rounded w-3/5" />
      </div>
    </div>
  );
}

import BookCover from '../components/UI/BookCover';

function BookCard({ book, index, onClick, onAddToBox, inBox }) {
  return (
    <TiltCard3D
      maxTilt={10}
      scale={1.02}
      className="card rounded-2xl p-3 flex flex-col gap-3 cursor-pointer h-full bg-white border-2 border-[#141416] shadow-[3px_3px_0px_#141416] hover:shadow-[5px_5px_0px_#141416] transition-all"
      onClick={onClick}
    >
      <div className="relative rounded-xl overflow-hidden h-52 group border border-[#141416]/20 bg-[#F4EFE6]">
        <BookCover book={book} size="M" className="w-full h-full" />
        <span className="absolute top-2 right-2 badge badge-yellow text-[9px] font-black z-10">
          {book['Year-Of-Publication'] || '2024'}
        </span>

        <div className="absolute inset-0 bg-[#141416]/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20">
          <span className="btn-primary text-xs py-1.5 px-3.5 shadow-[2px_2px_0px_#141416]">
            Inspect 3D →
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-editorial font-bold text-xs text-[#141416] truncate-2 leading-tight">
            {book['Book-Title']}
          </h4>
          <p className="text-[11px] text-[#5E5E68] font-bold truncate mt-1">
            {book['Book-Author'] || 'Unknown'}
          </p>
        </div>

        <div className="pt-2 border-t border-[#141416]/10 mt-2 flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-[#5E5E68]">
            {(book['ISBN'] || '').slice(0, 10)}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToBox && onAddToBox(book);
            }}
            className={`text-[10px] font-black py-1 px-3 rounded-full border border-[#141416] shadow-[1px_1px_0px_#141416] transition-transform active:translate-x-0.5 active:translate-y-0.5 ${inBox ? 'bg-[#D2F5E3] text-[#141416]' : 'bg-[#FAED8F] hover:bg-[#F5DE5D] text-[#141416]'
              }`}
          >
            {inBox ? 'In Box' : '+ Box'}
          </button>
        </div>
      </div>
    </TiltCard3D>
  );
}

const GENRE_TAGS = ['Horror', 'Dark Fantasy', 'Thriller', 'Literary Fiction', 'Gothic', 'Sci-Fi', 'Romance', 'Mystery'];

export default function DiscoverBooksPage({
  setActiveTab,
  setSelectedIsbn,
  onAddToBox,
  boxBooks = []
}) {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleQuickFilter = (term) => {
    setSearch(term);
    fetchCatalog(1, term);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">

      {/* ─── Search Header (Aardvark Editorial) ─── */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white border-2 border-[#141416] shadow-[6px_6px_0px_#141416]">
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAED8F] border border-[#141416] text-[10px] font-black uppercase mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>271,000+ Curated Hardcovers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-editorial font-extrabold text-[#141416]">
            All Books Catalog
          </h2>
          <p className="text-sm text-[#5E5E68] font-medium">
            Search titles, authors, and publishers. Pick any 3 books to build your custom monthly box.
          </p>
        </div>

        <form onSubmit={e => { e.preventDefault(); fetchCatalog(1); }}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 rounded-full px-5 py-3 bg-[#FCFAF6] border-2 border-[#141416] shadow-[2px_2px_0px_#141416] focus-within:shadow-[4px_4px_0px_#141416] transition-shadow">
              <Search className="w-5 h-5 text-[#141416] flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, author, or ISBN..."
                className="flex-1 bg-transparent text-sm text-[#141416] placeholder-[#92929D] font-bold outline-none"
              />
              {search && (
                <button type="button" onClick={clearSearch} className="text-[#5E5E68] hover:text-[#141416]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary py-3 px-7 text-xs font-black shadow-[3px_3px_0px_#141416]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Search Catalog</span>
            </button>
          </div>
        </form>

        {/* Quick Filter Genres */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-[#141416]/10">
          <span className="text-[10px] font-black text-[#5E5E68] uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3" /> Quick Filter:
          </span>
          {GENRE_TAGS.map(g => (
            <button
              key={g}
              onClick={() => handleQuickFilter(g)}
              className="px-3 py-1 rounded-full text-xs font-bold bg-[#FCFAF6] border border-[#141416] hover:bg-[#FAED8F] text-[#141416] shadow-[1px_1px_0px_#141416] transition-all cursor-pointer"
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm font-bold text-[#5E5E68]">
          {search && <><span className="text-[#141416]">"{search}"</span> — </>}
          <strong className="text-[#141416]">{total.toLocaleString()}</strong> books available
        </p>
        <span className="text-xs text-[#5E5E68] font-mono font-bold">
          Page {page} / {totalPages}
        </span>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : books.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border-2 border-[#141416] max-w-md mx-auto p-8 shadow-[6px_6px_0px_#141416]">
          <BookOpen className="w-12 h-12 mx-auto text-[#141416] mb-4" />
          <h3 className="font-editorial font-bold text-xl text-[#141416]">No Books Found</h3>
          <p className="text-xs text-[#5E5E68] mt-1">Try another search keyword or clear filters.</p>
          <button onClick={clearSearch} className="btn-secondary mt-4 text-xs">
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {books.map((book, idx) => {
            const inBox = boxBooks.some(b => String(b.ISBN) === String(book['ISBN']));
            return (
              <BookCard
                key={idx}
                book={book}
                index={idx}
                onClick={() => {
                  setSelectedIsbn && setSelectedIsbn(book['ISBN'] || book['Book-Title']);
                  setActiveTab('details');
                }}
                onAddToBox={onAddToBox}
                inBox={inBox}
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => fetchCatalog(page - 1)}
            disabled={page <= 1}
            className="btn-secondary text-xs py-2 px-4 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              return (
                <button
                  key={p}
                  onClick={() => fetchCatalog(p)}
                  className={`w-9 h-9 rounded-full text-xs font-black border-1.5 border-[#141416] transition-all ${p === page
                      ? 'bg-[#FAED8F] text-[#141416] shadow-[2px_2px_0px_#141416]'
                      : 'bg-white text-[#5E5E68] hover:bg-gray-100'
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
            className="btn-secondary text-xs py-2 px-4 disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
