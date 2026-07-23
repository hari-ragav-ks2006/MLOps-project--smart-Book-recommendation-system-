import React, { useState, useEffect } from 'react';
import { BookOpen, Bookmark, Sparkles, ArrowLeft, Check, Calendar, Hash, Building2, User } from 'lucide-react';

/* ── Reusable cover component with graceful fallback ── */
function BookCover({ imgUrl, isbn, title, author, className = '', style = {} }) {
  // Build a prioritized list of image sources to try
  const sources = [];
  if (imgUrl && imgUrl.startsWith('http')) sources.push(imgUrl);
  if (isbn) {
    // Open Library Covers API — free, no key, very high coverage
    sources.push(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`);
    sources.push(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`);
  }

  const [srcIndex, setSrcIndex] = useState(0);
  const [loaded, setLoaded]     = useState(false);
  const currentSrc              = sources[srcIndex];
  const exhausted               = srcIndex >= sources.length;

  const gradients = [
    'linear-gradient(135deg,#7c3aed,#4f46e5)',
    'linear-gradient(135deg,#059669,#0d9488)',
    'linear-gradient(135deg,#d97706,#dc2626)',
    'linear-gradient(135deg,#e11d48,#9333ea)',
    'linear-gradient(135deg,#0284c7,#7c3aed)',
    'linear-gradient(135deg,#0d9488,#059669)',
    'linear-gradient(135deg,#7c3aed,#ec4899)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
  ];
  const gradient  = gradients[(title?.charCodeAt(0) || 0) % gradients.length];
  const initials  = (title || '?').slice(0, 2).toUpperCase();

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {/* Gradient fallback — always underneath */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 gap-3" style={{ background: gradient }}>
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-extrabold text-xl">
          {initials}
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-sm leading-snug text-center line-clamp-3 px-1"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
            {title || 'Unknown Title'}
          </p>
          {author && (
            <p className="text-white/70 text-[10px] mt-1 font-medium truncate">{author}</p>
          )}
        </div>
        <div className="absolute top-0 left-3 bottom-0 w-0.5 bg-white/10 rounded" />
        <div className="absolute top-0 left-5 bottom-0 w-px bg-white/05 rounded" />
      </div>

      {/* Real image — tries each source, moves to next on error */}
      {!exhausted && (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(false); setSrcIndex(i => i + 1); }}
        />
      )}
    </div>
  );
}

function MetaChip({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="flex flex-col gap-1 p-3.5 rounded-2xl" style={{ background: bg, border: '1px solid rgba(0,0,0,0.07)' }}>
      <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${color}`}>
        <Icon className="w-3 h-3" /> {label}
      </span>
      <span className="text-[13px] font-bold text-gray-900 leading-snug">{value || '—'}</span>
    </div>
  );
}

function SimilarCard({ book, onClick }) {
  const img = book['Image-URL-M'] || book['Image-URL-L'] || book['Image-URL-S'];
  const isbn = book['ISBN'];
  return (
    <div className="book-card p-3 flex flex-col gap-2 cursor-pointer" onClick={onClick}>
      <BookCover
        imgUrl={img}
        isbn={isbn}
        title={book['Book-Title']}
        author={book['Book-Author']}
        className="h-28 rounded-xl"
      />
      <div>
        <p className="text-[12px] font-bold text-gray-900 truncate-1 leading-snug">{book['Book-Title']}</p>
        <p className="text-[10px] text-gray-400 truncate">{book['Book-Author']}</p>
      </div>
      {book.similarity_score !== undefined && (
        <span className="badge badge-emerald text-[9px]">{(book.similarity_score * 100).toFixed(0)}% match</span>
      )}
    </div>
  );
}

export default function BookDetailsPage({ selectedIsbn, setSelectedIsbn, setActiveTab }) {
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [isSaved, setIsSaved]   = useState(false);
  const targetIsbn = selectedIsbn || '0195153448';

  useEffect(() => {
    setLoading(true);
    setBookData(null);
    fetch(`/api/books/${encodeURIComponent(targetIsbn)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setBookData(data);
          const s = JSON.parse(localStorage.getItem('smartbook_favorites') || '[]');
          setIsSaved(s.some(x => String(x.ISBN) === String(data.book?.ISBN)));
        }
      })
      .finally(() => setLoading(false));
  }, [targetIsbn]);

  const toggleFav = () => {
    if (!bookData?.book) return;
    const s = JSON.parse(localStorage.getItem('smartbook_favorites') || '[]');
    const u = isSaved
      ? s.filter(x => String(x.ISBN) !== String(bookData.book.ISBN))
      : [...s, bookData.book];
    localStorage.setItem('smartbook_favorites', JSON.stringify(u));
    setIsSaved(!isSaved);
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-3xl p-8 flex gap-8" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="skeleton w-52 h-72 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-4 py-2">
          <div className="skeleton h-4 rounded w-1/4" />
          <div className="skeleton h-8 rounded w-3/4" />
          <div className="skeleton h-5 rounded w-1/2" />
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}
          </div>
        </div>
      </div>
    </div>
  );

  const book = bookData?.book;
  if (!book) return (
    <div className="py-24 text-center">
      <BookOpen className="w-12 h-12 mx-auto text-gray-200 mb-4" />
      <p className="text-gray-400">Book not found.</p>
      <button onClick={() => setActiveTab('discover')} className="btn-secondary mt-4">Back to Catalog</button>
    </div>
  );

  const imgUrl = book['Image-URL-L'] || book['Image-URL-M'] || book['Image-URL-S'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <button onClick={() => setActiveTab('discover')} className="btn-ghost gap-2 text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </button>

      {/* ─── Main card ─── */}
      <div
        className="rounded-3xl p-6 md:p-8 reveal shine-card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 70%, #f5f3ff)',
          border: '1px solid rgba(124,58,237,0.1)',
          boxShadow: '0 8px 40px rgba(124,58,237,0.07)',
        }}
      >
        <div className="flex flex-col md:flex-row gap-8">

          {/* Cover — uses the smart BookCover with fallback */}
          <div className="flex-shrink-0">
            <BookCover
              imgUrl={imgUrl}
              isbn={book['ISBN']}
              title={book['Book-Title']}
              author={book['Book-Author']}
              className="w-48 md:w-52 h-72 rounded-2xl"
              style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}
            />
          </div>

          {/* Metadata */}
          <div className="flex-1 space-y-5">
            <div>
              <span className="badge badge-purple mb-3">
                <Calendar className="w-2.5 h-2.5" /> {book['Year-Of-Publication'] || '—'}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mt-2">
                {book['Book-Title']}
              </h1>
              <p className="text-gray-400 mt-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-gray-300" />
                By <strong className="text-gray-700 ml-1">{book['Book-Author'] || 'Unknown'}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <MetaChip icon={Hash}      label="ISBN"      value={book['ISBN']}                color="text-violet-600" bg="#f5f3ff" />
              <MetaChip icon={Building2} label="Publisher" value={book['Publisher']}            color="text-rose-600"   bg="#fff1f2" />
              <MetaChip icon={Calendar}  label="Year"      value={book['Year-Of-Publication']} color="text-amber-600"  bg="#fffbeb" />
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={toggleFav}
                className="btn-primary"
                style={isSaved ? { background: 'linear-gradient(135deg,#059669,#047857)' } : { background: 'white', color: '#374151', border: '1px solid rgba(0,0,0,0.12)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {isSaved ? 'Saved to Favorites' : 'Add to Favorites'}
              </button>

              <button onClick={() => setActiveTab('recommendations')} className="btn-primary">
                <Sparkles className="w-4 h-4" /> AI Similarity Match
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Similar Books ─── */}
      {bookData?.similar_books?.length > 0 && (
        <div
          className="rounded-3xl p-6 reveal"
          style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}
        >
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-amber-500" />
            More Like This
            <span className="badge badge-amber ml-2">{bookData.similar_books.length} results</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {bookData.similar_books.map((rec, idx) => (
              <SimilarCard
                key={idx}
                book={rec}
                onClick={() => setSelectedIsbn(rec['ISBN'] || rec['Book-Title'])}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
