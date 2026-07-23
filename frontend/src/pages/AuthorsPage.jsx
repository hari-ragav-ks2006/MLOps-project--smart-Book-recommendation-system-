import React, { useState, useEffect } from 'react';
import { Users, Search, BookOpen, ArrowRight, Loader2 } from 'lucide-react';

function AuthorCard({ author, index, onClick }) {
  const initials = (author.author || '?')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const colors = [
    ['rgba(139,92,246,0.15)', '#a78bfa'],
    ['rgba(16,185,129,0.15)', '#34d399'],
    ['rgba(245,158,11,0.15)', '#fbbf24'],
    ['rgba(244,63,94,0.15)', '#fb7185'],
    ['rgba(99,102,241,0.15)', '#818cf8'],
    ['rgba(20,184,166,0.15)', '#2dd4bf'],
  ];
  const [bg, text] = colors[index % colors.length];

  return (
    <div
      className="glass-card rounded-2xl p-5 flex items-center gap-4 cursor-pointer reveal"
      style={{ animationDelay: `${Math.min(index, 10) * 0.04}s` }}
      onClick={() => onClick(author.author)}
    >
      {/* Avatar */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-extrabold text-sm"
        style={{ background: bg, color: text }}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-[13px] text-white truncate">{author.author}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{author.book_count?.toLocaleString()} books</p>
        {author.sample_title && (
          <p className="text-[10px] text-slate-600 truncate mt-0.5">"{author.sample_title}"</p>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <ArrowRight className="w-4 h-4 text-slate-600" />
      </div>
    </div>
  );
}

export default function AuthorsPage({ setSelectedIsbn, setActiveTab }) {
  const [authors, setAuthors] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [authorBooks, setAuthorBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/authors?limit=60`);
      if (res.ok) {
        const data = await res.json();
        setAuthors(data.authors || []);
      }
    } finally { setLoading(false); }
  };

  const fetchAuthorBooks = async (name) => {
    setBooksLoading(true);
    setSelectedAuthor(name);
    setAuthorBooks([]);
    try {
      const res = await fetch(`/api/authors?author_name=${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        setAuthorBooks(data.books || []);
      }
    } finally { setBooksLoading(false); }
  };

  useEffect(() => { fetchAuthors(); }, []);

  const filtered = search
    ? authors.filter(a => a.author?.toLowerCase().includes(search.toLowerCase()))
    : authors;

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
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)' }}>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-white">Authors</h2>
            <p className="text-slate-500 text-xs">100,000+ unique authors indexed in SmartBook AI</p>
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
            placeholder="Search authors..."
            className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Author list */}
        <div className="md:col-span-2 space-y-2">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 flex items-center gap-4">
                <div className="skeleton w-12 h-12 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3.5 rounded w-1/2" />
                  <div className="skeleton h-3 rounded w-1/3" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Users className="w-10 h-10 mx-auto opacity-20 mb-3" />
              <p>No authors found for "{search}"</p>
            </div>
          ) : (
            filtered.map((author, idx) => (
              <AuthorCard
                key={idx}
                author={author}
                index={idx}
                onClick={fetchAuthorBooks}
              />
            ))
          )}
        </div>

        {/* Author book panel */}
        <div>
          {selectedAuthor ? (
            <div
              className="rounded-3xl p-5 sticky top-4"
              style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
            >
              <h3 className="font-bold text-[14px] text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-400" />
                <span className="truncate">{selectedAuthor}</span>
              </h3>

              {booksLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="skeleton w-10 h-14 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="skeleton h-3 rounded w-4/5" />
                        <div className="skeleton h-2.5 rounded w-3/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {authorBooks.map((book, i) => {
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
                          <p className="text-[12px] font-semibold text-white truncate group-hover:text-brand-400 transition-colors">{book['Book-Title']}</p>
                          <p className="text-[10px] text-slate-500">{book['Year-Of-Publication'] || '—'}</p>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-700 group-hover:text-brand-400 transition-colors flex-shrink-0" />
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
              <Users className="w-10 h-10 mx-auto text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm font-medium">Select an author</p>
              <p className="text-slate-600 text-xs mt-1">to browse their catalog</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
